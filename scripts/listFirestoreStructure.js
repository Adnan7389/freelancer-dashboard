import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
const serviceAccount = JSON.parse(fs.readFileSync(new URL('../freelancer-dashboard-478945082e.json', import.meta.url)));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listCollections() {
  const result = {};

  const collections = await db.listCollections();
  for (const col of collections) {
    result[col.id] = [];
    const snapshot = await col.limit(5).get(); // limit to 5 docs for speed
    if (snapshot.empty) {
      continue;
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      result[col.id].push({
        documentId: doc.id,
        fields: Object.keys(data)
      });
    });
  }

  return result;
}

async function main() {
  try {
    const structure = await listCollections();
    const outputPath = path.join(__dirname, "firestore-structure.json");
    fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
    console.log(`✅ Firestore structure saved to ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error listing structure:", err);
    process.exit(1);
  }
}

main();
