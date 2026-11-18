import express from 'express';

const router = express.Router();

const userRoutes = (users) => {
  // GET /users - Fetch all users
  router.get('/', async (req, res) => {
    try {
      const cursor = users.find({});
      const result = await cursor.toArray();
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};

export default userRoutes;
