// mongodb.ts
import { MongoClient } from 'mongodb';

const uri: string | undefined = process.env.MONGODB_URI;
let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (typeof uri == undefined) {
    throw new Error("URI is not defined in parameters!");
  }

  const client = await MongoClient.connect(uri);

  try {
    await client.connect();
    console.log('Connection to MongoDB established successfully!');
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    console.log('MongoDB connection closed!');
    cachedClient = null;
  }
}

