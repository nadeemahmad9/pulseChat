const assert = require('assert');
const http = require('http');
const app = require('../app');
const mongoose = require('mongoose');

let server;
let port;
let cookieHeader;

const request = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers,
      },
    };

    if (cookieHeader) {
      reqOptions.headers['Cookie'] = cookieHeader;
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      if (res.headers['set-cookie']) {
        cookieHeader = res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
      }
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Running PulseChat Backend Automated Tests...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pulsechat');

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check Endpoint');
    const health = await request('/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'OK');
    console.log('  ✅ Health check passed');

    // Test 2: Register user A
    console.log('Test 2: Register User A');
    const testUserA = {
      name: 'Alice Smith',
      username: 'alice_' + Date.now(),
      email: `alice_${Date.now()}@test.com`,
      password: 'password123',
    };
    const regA = await request('/api/auth/register', 'POST', testUserA);
    assert.strictEqual(regA.status, 201);
    assert.strictEqual(regA.body.user.name, testUserA.name);
    console.log('  ✅ Register User A passed');

    // Test 3: Get Me
    console.log('Test 3: Get Authenticated User Profile');
    const me = await request('/api/auth/me');
    assert.strictEqual(me.status, 200);
    assert.strictEqual(me.body.user.email, testUserA.email);
    console.log('  ✅ Get Me passed');

    // Test 4: Register user B
    console.log('Test 4: Register User B');
    const cookieA = cookieHeader;
    cookieHeader = null; // reset cookie to register User B
    const testUserB = {
      name: 'Bob Johnson',
      username: 'bob_' + Date.now(),
      email: `bob_${Date.now()}@test.com`,
      password: 'password123',
    };
    const regB = await request('/api/auth/register', 'POST', testUserB);
    assert.strictEqual(regB.status, 201);
    const userBId = regB.body.user._id;
    console.log('  ✅ Register User B passed');

    // Restore cookie for User A
    cookieHeader = cookieA;

    // Test 5: Search Users
    console.log('Test 5: Search Users');
    const search = await request(`/api/users/search?q=Bob`);
    assert.strictEqual(search.status, 200);
    assert(Array.isArray(search.body.users));
    console.log('  ✅ Search Users passed');

    // Test 6: Create Private Conversation
    console.log('Test 6: Create Private Conversation');
    const conv = await request('/api/conversations/private', 'POST', { recipientId: userBId });
    assert.strictEqual(conv.status, 200);
    assert(conv.body.conversation._id);
    const convId = conv.body.conversation._id;
    console.log('  ✅ Create Private Conversation passed');

    // Test 7: Send Message
    console.log('Test 7: Send Text Message');
    const msg = await request('/api/messages', 'POST', {
      conversationId: convId,
      content: 'Hello Bob! This is an automated test message.',
    });
    assert.strictEqual(msg.status, 201);
    assert.strictEqual(msg.body.message.content, 'Hello Bob! This is an automated test message.');
    console.log('  ✅ Send Message passed');

    // Test 8: Get Messages
    console.log('Test 8: Get Messages');
    const getMsgs = await request(`/api/messages/${convId}`);
    assert.strictEqual(getMsgs.status, 200);
    assert(getMsgs.body.messages.length >= 1);
    console.log('  ✅ Get Messages passed');

    console.log('\n🎉 ALL BACKEND AUTOMATED TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
  }
}

runTests();
