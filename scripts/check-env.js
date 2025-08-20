import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Environment variables loaded from:', path.resolve(__dirname, '../.env'));
console.log('FIREBASE_SERVICE_ACCOUNT exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // Try to parse as JSON
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Valid JSON, project_id:', serviceAccount.project_id);
  } catch (e) {
    console.log('Not a JSON string, trying base64...');
    try {
      // Try to decode as base64
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString();
      const serviceAccount = JSON.parse(decoded);
      console.log('✅ Valid base64, project_id:', serviceAccount.project_id);
    } catch (e2) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', e2.message);
      console.log('First 50 chars:', process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 50) + '...');
    }
  }
}
