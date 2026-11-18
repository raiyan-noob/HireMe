import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();

const jobRoutes = (jobs) => {
    // GET /jobs - Fetch jobs (optionally filter by employer email: ?email=...)
    router.get('/', async (req, res) => {
        try {
            const { email } = req.query;
            const query = email ? { employerEmail: email } : {};
            const result = await jobs.find(query).sort({ createdAt: -1 }).toArray();
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // POST /jobs - Create new job
    router.post('/', async (req, res) => {
        try {
            const job = await jobs.insertOne(req.body);
            res.status(201).json(job);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // PATCH /jobs/:id or PUT /jobs/:id - Update an existing job
    const handleUpdateJob = async (req, res) => {
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid job ID' });
            }
            const updateData = { ...req.body };
            delete updateData._id; // Ensure _id cannot be overwritten

            const result = await jobs.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            if (!result.matchedCount) {
                return res.status(404).json({ error: 'Job not found' });
            }

            res.json({ message: 'Job updated successfully', result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    router.patch('/:id', handleUpdateJob);
    router.put('/:id', handleUpdateJob);

    // DELETE /jobs/:id - Delete a job by ID
    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid job ID' });
            }
            const result = await jobs.deleteOne({ _id: new ObjectId(id) });
            if (!result.deletedCount) {
                return res.status(404).json({ error: 'Job not found' });
            }
            res.json({ message: 'Job deleted successfully', result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
};

export default jobRoutes;