import { Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const options = {};

let client;
let database: Db;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._) {
    client = new MongoClient(uri, options);
    client = await client.connect();
  }
} else {
  // In production, create a new MongoClient instance
  client = new MongoClient(uri, options);
  client = await client.connect();
}

if (client) {
  database = client.db('swapforge');
}

export { database };
