import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();

const appRoutes = (applications, users) => {
    // POST /applications - Submit a new job application
    router.post('/', async (req, res) => {
        try {
            const body = req.body;
            const email = (body.email || '').toLowerCase().trim();

            // Determine applicant's subscription tier from users collection
            let plan = (body.plan || 'normal').toLowerCase();
            if (users && email) {
                const userDoc = await users.findOne({ email });
                if (userDoc) {
                    plan = (userDoc.plan || (userDoc.premium ? 'premium' : userDoc.pro ? 'pro' : 'normal')).toLowerCase();
                }
            }

            // Priority Score: Premium (3) > Pro (2) > Normal (1)
            const priorityScore = plan === 'premium' ? 3 : plan === 'pro' ? 2 : 1;

            const application = {
                ...body,
                email,
                plan,
                priorityScore,
                verifiedBadge: plan === 'pro' || plan === 'premium',
                priorityCandidate: plan === 'premium',
                appliedAt: new Date().toISOString(),
            };

            const result = await applications.insertOne(application);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error submitting application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // GET /applications - Fetch applications (Recruiters see Premium first, then Pro, then Normal)
    router.get('/', async (req, res) => {
        try {
            const { email, jobId } = req.query;
            const query = {};
            if (email) query.email = email.toLowerCase().trim();
            if (jobId) query.jobId = jobId;

            // Sort order:
            // 1. priorityScore: -1 (Premium=3 first, Pro=2 second, Normal=1 third)
            // 2. appliedAt: -1 (Newest submissions first within the same tier)
            const result = await applications
                .find(query)
                .sort({ priorityScore: -1, appliedAt: -1 })
                .toArray();

            res.json(result);
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // GET /applications/count - Count applications for a user or job
    router.get('/count', async (req, res) => {
        try {
            const { email, jobId } = req.query;
            const query = {};
            if (email) query.email = email.toLowerCase().trim();
            if (jobId) query.jobId = jobId;
            const result = await applications.countDocuments(query);
            res.json({ count: result });
        } catch (error) {
            console.error('Error fetching application count:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // DELETE /applications/:id - Withdraw application
    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid application ID' });
            }
            const result = await applications.deleteOne({ _id: new ObjectId(id) });
            if (!result.deletedCount) {
                return res.status(404).json({ error: 'Application not found' });
            }
            res.json({ message: 'Application withdrawn successfully', result });
        } catch (error) {
            console.error('Error withdrawing application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};

export default appRoutes;
