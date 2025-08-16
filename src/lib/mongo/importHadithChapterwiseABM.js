// src/lib/mongo/importHadithChapterwiseABM.js
// Run: node src/lib/mongo/importHadithChapterwiseABM.js
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const uri = process.env.MONGODB_HADITH_CHAPTERWISE_ABM_URI;
if (!uri)
  throw new Error("❌ Please set MONGODB_HADITH_CHAPTERWISE_ABM_URI in .env");

const DB_NAME = "hadith_chapterwise_abm";
const ROOT_DIR = path.join(
  process.cwd(),
  "src",
  "lib",
  "mongo",
  "db",
  "hadith",
  "chapter-wise"
);
const TARGET_FOLDER = "abm"; // Only process this folder for ABM

async function importHadithChapterwiseABM() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);

  // 1. Insert global metadata.json from root
  const globalMetaPath = path.join(ROOT_DIR, "metadata.json");
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

  // 2. Process only ABM folder
  const abmDir = path.join(ROOT_DIR, TARGET_FOLDER);
  if (!fs.existsSync(abmDir)) throw new Error(`❌ Folder not found: ${abmDir}`);

  const books = fs
    .readdirSync(abmDir)
    .filter((name) => fs.lstatSync(path.join(abmDir, name)).isDirectory());

  for (const book of books) {
    const bookDir = path.join(abmDir, book);

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

    // Language folders
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

        if (Array.isArray(jsonData)) {
          if (jsonData.length > 0) {
            await db.collection(collectionName).insertMany(jsonData);
            console.log(
              `✅ Inserted ${jsonData.length} docs into "${collectionName}"`
            );
          } else {
            console.warn(`⚠️ Skipped ${collectionName} (empty array)`);
          }
        } else {
          await db.collection(collectionName).insertOne(jsonData);
          console.log(`✅ Inserted 1 doc into "${collectionName}"`);
        }
      }
    }
  }

  await client.close();
  console.log("🎉 All ABM chapter-wise Hadith data uploaded successfully!");
}

importHadithChapterwiseABM().catch((err) => {
  console.error("❌ Import failed:", err);
});
