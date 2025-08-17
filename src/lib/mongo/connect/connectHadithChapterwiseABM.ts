// src/lib/mongo/connect/connectHadithChapterwiseABM.ts
import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;
export async function getHadithChapterwiseABM_Db() {
  const uri = process.env.MONGODB_HADITH_CHAPTERWISE_ABM_URI;
  if (!uri) {
    throw new Error(
      "❌ MONGODB_HADITH_CHAPTERWISE_ABM_URI is missing in environment"
    );
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db("hadith_chapterwise_abm");
}
