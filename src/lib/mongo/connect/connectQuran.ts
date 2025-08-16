// src/lib/mongo/quran.ts
import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;
export async function getQuranDb() {
  const uri = process.env.MONGODB_QURAN_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_QURAN_URI is missing in environment");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db("quran");
}
