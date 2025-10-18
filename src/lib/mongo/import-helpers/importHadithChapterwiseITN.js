// src/lib/mongo/importHadithChapterwiseITN.js
// Run: node src/lib/mongo/import-helpers/importHadithChapterwiseITN.js

import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { serverEnv } from "../../../env";

const uri = serverEnv.MONGODB_HADITH_CHAPTERWISE_ITN_URI;
if (!uri) {
  throw new Error("❌ Please set MONGODB_HADITH_CHAPTERWISE_ITN_URI in .env");
}

const DB_NAME = "hadith_chapterwise_itn";
const ROOT_DIR = path.join(
  process.cwd(),
  "src",
  "lib",
  "mongo",
  "db",
  "hadith",
  "chapter-wise",
  "itn" // 👈 ITN folder
);

async function importHadithChapterwiseITN() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);

  // 1. Global metadata.json (from chapter-wise root, NOT ITN folder)
  const globalMetaPath = path.join(ROOT_DIR, "..", "metadata.json");
  if (fs.existsSync(globalMetaPath)) {
    const metaData = JSON.parse(fs.readFileSync(globalMetaPath, "utf8"));
    await db.collection("metadata").deleteMany({});
    await db
      .collection("metadata")
      .insertMany(Array.isArray(metaData) ? metaData : [metaData]);
    console.log(
      `✅ Inserted ${
        Array.isArray(metaData) ? metaData.length : 1
      } docs into "metadata"`
    );
  }

  // 2. Loop over each book in ITN
  const books = fs
    .readdirSync(ROOT_DIR)
    .filter((name) => fs.lstatSync(path.join(ROOT_DIR, name)).isDirectory());

  for (const book of books) {
    const bookDir = path.join(ROOT_DIR, book);

    // Book-level metadata.json
    const bookMetaPath = path.join(bookDir, "metadata.json");
    if (fs.existsSync(bookMetaPath)) {
      const bookMetaData = JSON.parse(fs.readFileSync(bookMetaPath, "utf8"));
      await db.collection(`book_${book}_metadata`).deleteMany({});
      await db
        .collection(`book_${book}_metadata`)
        .insertMany(
          Array.isArray(bookMetaData) ? bookMetaData : [bookMetaData]
        );
      console.log(
        `✅ Inserted ${
          Array.isArray(bookMetaData) ? bookMetaData.length : 1
        } docs into "book_${book}_metadata"`
      );
    }

    // Languages folders
    const languages = fs
      .readdirSync(bookDir)
      .filter((name) => fs.lstatSync(path.join(bookDir, name)).isDirectory());

    for (const lang of languages) {
      const langDir = path.join(bookDir, lang);

      const chapterFiles = fs
        .readdirSync(langDir)
        .filter((f) => f.endsWith(".json"));

      for (const chapterFile of chapterFiles) {
        const filePath = path.join(langDir, chapterFile);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const chapterName = path.basename(chapterFile, ".json");

        const collectionName = `book_${book}_${lang}_${chapterName}`;
        await db.collection(collectionName).deleteMany({});
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          await db.collection(collectionName).insertMany(jsonData);
          console.log(
            `✅ Inserted ${jsonData.length} docs into "${collectionName}"`
          );
        } else if (!Array.isArray(jsonData)) {
          await db.collection(collectionName).insertOne(jsonData);
          console.log(`✅ Inserted 1 doc into "${collectionName}"`);
        }
      }
    }
  }

  await client.close();
  console.log("🎉 All ITN chapter-wise Hadith data uploaded successfully!");
}

importHadithChapterwiseITN().catch((err) => {
  console.error("❌ Import failed:", err);
});
