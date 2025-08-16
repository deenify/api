// src/lib/mongo/importQuranData.js
// node src/lib/mongo/importQuranData.js
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const uri = process.env.MONGODB_QURAN_URI;
if (!uri) throw new Error("❌ Please set MONGODB_URI in .env.local");

const DB_NAME = "quran"; // Cluster0 ke andar ye DB create hoga
const ROOT_DIR = path.join(process.cwd(), "src", "lib", "mongo", "db", "quran");

async function importData() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);

  // 1. Import metadata.json
  const metaPath = path.join(ROOT_DIR, "metadata.json");
  if (fs.existsSync(metaPath)) {
    const metaData = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    await db.collection("metadata").deleteMany({});
    await db.collection("metadata").insertMany(metaData);
    console.log(`✅ Inserted ${metaData.length} docs into "metadata"`);
  }

  // 2. Import editions folder (languages)
  const editionsDir = path.join(ROOT_DIR, "edition");
  const languages = fs.readdirSync(editionsDir);

  for (const lang of languages) {
    const langDir = path.join(editionsDir, lang);
    const files = fs.readdirSync(langDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(langDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Collection name: editions_<language>_<fileNameWithoutExt>
      const collectionName = `edition_${lang}_${path.basename(file, ".json")}`;

      await db.collection(collectionName).deleteMany({});
      if (jsonData.length > 0) {
        await db.collection(collectionName).insertMany(jsonData);
        console.log(
          `✅ Inserted ${jsonData.length} docs into "${collectionName}"`
        );
      }
    }
  }

  await client.close();
  console.log("🎉 All data uploaded successfully!");
}

importData().catch((err) => {
  console.error("❌ Import failed:", err);
});
