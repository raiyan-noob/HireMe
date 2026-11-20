import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();

const savedRoutes = (savedJobs) => {
    // POST /saved - Save a job for a user
    router.post('/', async (req, res) => {
        try {
            const {
                jobId,
                userId,
                email,
                jobTitle,
                companyName,
                location,
                workplaceType,
                employmentType,
                category,
                skills,
                minSalary,
                maxSalary,
                currency,
                salaryPeriod,
                description,
            } = req.body;

            if (!jobId || !email) {
                return res.status(400).json({ error: 'jobId and email are required' });
            }

            // Check if already saved by this user
            const existing = await savedJobs.findOne({ jobId: String(jobId), email });
            if (existing) {
                return res.status(200).json({ message: 'Job is already saved', insertedId: existing._id, existing: true });
            }

            const doc = {
                jobId: String(jobId),
                userId: userId || null,
                email,
                jobTitle: jobTitle || 'Job Title',
                companyName: companyName || 'Company',
                location: location || 'Remote',
                workplaceType: workplaceType || 'Remote',
                employmentType: employmentType || 'Full-time',
                category: category || 'General',
                skills: Array.isArray(skills) ? skills : [],
                minSalary: minSalary || null,
                maxSalary: maxSalary || null,
                currency: currency || 'USD',
                salaryPeriod: salaryPeriod || 'Per Year',
                description: description || '',
                savedAt: new Date().toISOString(),
            };

            const result = await savedJobs.insertOne(doc);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error saving job:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // GET /saved - Fetch saved jobs (query by email)
    router.get('/', async (req, res) => {
        try {
            const { email } = req.query;
            const query = {};
            if (email) query.email = email;
            const result = await savedJobs.find(query).sort({ savedAt: -1 }).toArray();
            res.json(result);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // DELETE /saved/:id - Unsave a job by doc ID
    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            let result;

            if (ObjectId.isValid(id)) {
                result = await savedJobs.deleteOne({ _id: new ObjectId(id) });
            }

            // If not deleted by ObjectId, try deleting by jobId
            if (!result || result.deletedCount === 0) {
                const { email } = req.query;
                const filter = { jobId: id };
                if (email) filter.email = email;
                result = await savedJobs.deleteOne(filter);
            }

            if (!result || result.deletedCount === 0) {
                return res.status(404).json({ error: 'Saved job not found' });
            }

            res.json({ message: 'Job removed from saved successfully', result });
        } catch (error) {
            console.error('Error removing saved job:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};

export default savedRoutes;
