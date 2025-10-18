// src/lib/mongo/importHadithBookwise.js
// Run: node src/lib/mongo/import-helpers/importHadithBookwise.js

import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { serverEnv } from "../../../env";

const uri = serverEnv.MONGODB_HADITH_BOOKWISE_URI;
if (!uri) {
  throw new Error("❌ Please set MONGODB_HADITH_BOOKWISE_URI in .env");
}

const DB_NAME = "hadith_bookwise";
const ROOT_DIR = path.join(
  process.cwd(),
  "src",
  "lib",
  "mongo",
  "db",
  "hadith",
  "book-wise"
);

async function importHadithBookwise() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);

  /** 1. Insert root metadata.json (array) **/
  const globalMetaPath = path.join(ROOT_DIR, "metadata.json");
  if (fs.existsSync(globalMetaPath)) {
    const metaData = JSON.parse(fs.readFileSync(globalMetaPath, "utf8"));
    if (!Array.isArray(metaData)) {
      throw new Error("❌ Root metadata.json must be an array!");
    }
    await db.collection("metadata").deleteMany({});
    await db.collection("metadata").insertMany(metaData);
    console.log(`✅ Inserted ${metaData.length} docs into "metadata"`);
  }

  /** 2. Process each book folder **/
  const books = fs
    .readdirSync(ROOT_DIR)
    .filter(
      (name) =>
        fs.lstatSync(path.join(ROOT_DIR, name)).isDirectory() &&
        name !== "metadata.json"
    );

  for (const book of books) {
    const bookDir = path.join(ROOT_DIR, book);

    // Book-level metadata.json (object)
    const bookMetaPath = path.join(bookDir, "metadata.json");
    if (fs.existsSync(bookMetaPath)) {
      const bookMetaData = JSON.parse(fs.readFileSync(bookMetaPath, "utf8"));
      await db.collection(`book_${book}_metadata`).deleteMany({});
      await db.collection(`book_${book}_metadata`).insertOne(bookMetaData);
      console.log(`✅ Inserted metadata for "${book}"`);
    }

    // Language JSON files (object each)
    const langFiles = fs
      .readdirSync(bookDir)
      .filter((f) => f.endsWith(".json") && f !== "metadata.json");

    for (const langFile of langFiles) {
      const filePath = path.join(bookDir, langFile);
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const langName = path.basename(langFile, ".json");

      const collectionName = `book_${book}_${langName}`;
      await db.collection(collectionName).deleteMany({});
      await db.collection(collectionName).insertOne(jsonData);
      console.log(`✅ Inserted 1 doc into "${collectionName}"`);
    }
  }

  await client.close();
  console.log("🎉 All book-wise Hadith data uploaded successfully!");
}

importHadithBookwise().catch((err) => {
  console.error("❌ Import failed:", err);
});
