import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import userRoutes from './routes/userRoutes.js';

// Fix querySrv ECONNREFUSED on local ISP DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  console.warn('Could not set DNS servers:', e);
}

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

const client = new MongoClient(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hffrouf.mongodb.net/`);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB();
const db= connectedClient.db('HireMedb');
const users = db.collection('user');

app.get('/', (req, res) => {
  res.send('Server is running');
});

// User routes
app.use('/users', userRoutes(users));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
