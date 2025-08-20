import { testWebhook } from '../api/lemon-webhook.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock request and response objects
const mockRequest = {
  method: 'GET',
  url: '/test',
  headers: {}
};

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    return res;
  };
  res.send = (data) => {
    console.log('Response:', data);
    return res;
  };
  return res;
};

// Run the test
console.log('🚀 Testing webhook handler...');
console.log('NODE_ENV:', process.env.NODE_ENV);

try {
  await testWebhook(mockRequest, mockResponse());
  console.log('✅ Test completed');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
