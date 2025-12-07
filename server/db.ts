import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/techmart';

let db: Db;
let client: MongoClient;
let connectionPromise: Promise<Db> | null = null;

export async function connectToDatabase(): Promise<Db> {
  // Return cached connection if available
  if (db && client) {
    return db;
  }

  // If a connection is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create a new connection
  connectionPromise = (async () => {
    try {
      client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 2,
      });
      await client.connect();
      console.log('✅ Connected to MongoDB');
      console.log(`📊 Database: techmart`);

      db = client.db('techmart');

      // Create indexes for faster queries
      const usersCollection = db.collection('users');
      await usersCollection.createIndex({ email: 1 });
      console.log('✅ Created indexes for users collection');

      const productsCollection = db.collection('products');
      await productsCollection.createIndex({ category: 1 });
      await productsCollection.createIndex({ brand: 1 });
      await productsCollection.createIndex({ name: 'text', description: 'text' });
      console.log('✅ Created indexes for products collection');

      return db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
    db = null as any;
    client = null as any;
    connectionPromise = null;
  }
}
