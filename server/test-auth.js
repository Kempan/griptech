// server/test-auth.js
const axios = require('axios');

const API_BASE_URL = 'https://t040vihsqd.execute-api.eu-north-1.amazonaws.com/prod';

async function testAuth() {
  console.log('🧪 Testing authentication flow...\n');

  try {
    // Test 1: Check session before login
    console.log('1️⃣ Testing session before login...');
    const sessionBefore = await axios.get(`${API_BASE_URL}/api/session`, {
      withCredentials: true
    });
    console.log('Session before login:', sessionBefore.data);

    // Test 2: Login
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, {
      email: 'joakim@tundran.se',
      password: 'admin'
    }, {
      withCredentials: true
    });
    console.log('Login response:', loginResponse.data);

    // Test 3: Check session after login
    console.log('\n3️⃣ Testing session after login...');
    const sessionAfter = await axios.get(`${API_BASE_URL}/api/session`, {
      withCredentials: true
    });
    console.log('Session after login:', sessionAfter.data);

    // Test 4: Check cookies in response headers
    console.log('\n4️⃣ Checking response headers...');
    console.log('Set-Cookie headers:', loginResponse.headers['set-cookie']);

    console.log('\n✅ Authentication test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testAuth(); 