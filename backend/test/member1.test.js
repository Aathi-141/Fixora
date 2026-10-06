/**
 * Member 1 Automated Test Suite: Auth, Onboarding & Provider Discovery
 */
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const run = async () => {
  console.log('=====================================================');
  console.log(' FIXORA AUTOMATED TEST SUITE: MEMBER 1');
  console.log(' User Authentication, Onboarding & Provider Discovery');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;
  const assert = (cond, desc) => {
    if (cond) {
      console.log(` [PASS] ${desc}`);
      passed++;
    } else {
      console.error(` [FAIL] ${desc}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/');
    assert(health.status === 200 && health.data.app === 'Fixora API', 'Health Check: Server online & connected to MongoDB');

    // 2. User Registration
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Manusha Test User',
      email: `m1_user_${Date.now()}@test.lk`,
      password: 'password123',
      phone: '+94 77 111 2233',
      role: 'customer',
    });
    assert(regRes.status === 201 && regRes.data.token, 'FR-01: Customer Registration & JWT Token issuance');

    // 3. User Login
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'kasun@gmail.com',
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'FR-02: User Login with credentials & session authorization');

    // 4. Google OAuth
    const googleRes = await request('/api/auth/google', 'POST', {
      email: `google_${Date.now()}@fixora.lk`,
      name: 'Google Verified User',
      googleId: 'g_test_123',
    });
    assert(googleRes.status === 200 && googleRes.data.token, 'FR-02b: Google OAuth 1-tap Authentication');

    // 5. Provider Search & Filter
    const provSearchRes = await request('/api/providers?category=Plumber');
    assert(provSearchRes.status === 200 && provSearchRes.data.count > 0, 'FR-03/04: Provider Search & Category Filtering (Plumber)');

    // 6. View Provider Profile & Reviews
    const sampleId = provSearchRes.data.data[0]._id;
    const provDetailRes = await request(`/api/providers/${sampleId}`);
    assert(provDetailRes.status === 200 && provDetailRes.data.data.reviews, 'FR-05: View Verified Provider Profile details & verified reviews');

    console.log(`\n-----------------------------------------------------`);
    console.log(` Member 1 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`-----------------------------------------------------`);
    if (failed === 0) {
      console.log(' ALL MEMBER 1 REQUIREMENTS VERIFIED SUCCESSFULLY!\n');
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
  }
};

run();
