// src/lib/mongo/connect/connectHadithBookwise.ts
import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;
export async function getHadithBookwiseDb() {
  const uri = process.env.MONGODB_HADITH_BOOKWISE_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_HADITH_BOOKWISE_URI is missing in environment");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db("hadith_bookwise");
}
