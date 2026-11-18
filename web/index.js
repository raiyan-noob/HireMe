import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient } from 'mongodb';

// Fix querySrv ECONNREFUSED on local ISP DNS
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
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

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
