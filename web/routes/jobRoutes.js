import express from 'express';

const router = express.Router();

const jobRoutes = (jobs) => {
    router.post('/', async (req, res) => {
        try {
            const job = await jobs.insertOne(req.body);
            res.status(201).json(job);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
};

export default jobRoutes;