import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import the webhook handler after env is loaded
const { default: webhookHandler, testWebhook } = await import('../api/lemon-webhook.js');

// Mock request and response
const req = { method: 'GET', url: '/test' };
const res = {
  status: (code) => ({
    json: (data) => console.log('✅ Response:', { code, data }),
    send: (data) => console.log('✅ Response:', { code, data })
  })
};

// Run the test
try {
  console.log('🚀 Starting webhook test...');
  await testWebhook(req, res);
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
