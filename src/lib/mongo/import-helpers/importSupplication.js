// src/lib/mongo/import-helpers/importSupplication.js
// Run: node src/lib/mongo/import-helpers/importSupplication.js

import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri = process.env.MONGODB_SUPPLICATION_URI;
if (!uri) throw new Error("❌ Please set MONGODB_SUPPLICATION_URI in .env");

const DB_NAME = "supplications";
const ROOT_DIR = path.join(process.cwd(), "src", "lib", "mongo", "db", "dua");

async function importDuasData() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`📡 Connected to MongoDB → Database: ${DB_NAME}`);

  /* 1️⃣ IMPORT METADATA */
  const metaPath = path.join(ROOT_DIR, "metadata.json");
  if (fs.existsSync(metaPath)) {
    const metaData = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    await db.collection("metadata").deleteMany({});
    await db.collection("metadata").insertOne(metaData);
    console.log("✅ Metadata uploaded to 'metadata' collection.");
  } else {
    console.warn("⚠️ No metadata.json found — skipping metadata import.");
  }

  /* 2️⃣ IMPORT EACH GROUP FILE */
  const groupDir = path.join(ROOT_DIR, "group");
  if (!fs.existsSync(groupDir))
    throw new Error("❌ 'group' folder not found inside duas directory.");

  const groupFiles = fs
    .readdirSync(groupDir)
    .filter((f) => f.endsWith(".json"));
  if (!groupFiles.length) {
    console.warn("⚠️ No group JSON files found.");
    return;
  }

  for (const file of groupFiles) {
    const filePath = path.join(groupDir, file);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // ✅ Use file name as group name
    const groupName = path
      .basename(file, ".json")
      .toLowerCase()
      .replace(/\s+/g, "_");
    const collectionName = groupName;

    await db.collection(collectionName).deleteMany({});
    await db.collection(collectionName).insertOne(jsonData);

    console.log(`✅ Uploaded "${file}" → collection "${collectionName}"`);
  }

  await client.close();
  console.log("🎉 All duas data imported successfully!");
}

importDuasData().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
