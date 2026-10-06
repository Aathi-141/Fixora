/**
 * Member 3 Automated Test Suite: Chat, Real-Time Status & Reviews
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
  console.log(' FIXORA AUTOMATED TEST SUITE: MEMBER 3');
  console.log(' In-App Chat, Service Tracking & Ratings/Reviews');
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
    // 1. Login user
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'kasun@gmail.com',
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Authenticate customer for messaging & tracking');
    const token = loginRes.data?.token;

    // 2. Fetch sample booking
    const historyRes = await request('/api/bookings/my-history', 'GET', null, token);
    assert(historyRes.status === 200 && typeof historyRes.data.ongoingCount === 'number', 'FR-18: Fetch service request history (Ongoing & Completed tabs)');
    const sampleBooking = historyRes.data.data?.[0];
    const bookingId = sampleBooking ? sampleBooking._id : '6abfbc7b7f0bd8c50e79e404';

    // 3. Send 1-tap quick reply chat message
    const sendMsgRes = await request(`/api/bookings/${bookingId}/messages`, 'POST', {
      text: 'Are you on the way?',
      isQuickReply: true,
      senderRole: 'customer',
      senderName: 'Kasun Perera',
    }, token);
    assert(sendMsgRes.status === 201 && sendMsgRes.data.data.text, 'FR-14: Send 1-tap quick reply in chat');

    // 4. Fetch chat conversation history
    const getMsgRes = await request(`/api/bookings/${bookingId}/messages`, 'GET', null, token);
    assert(getMsgRes.status === 200 && Array.isArray(getMsgRes.data.data), 'FR-14: Fetch in-app chat conversation history between customer and provider');

    // 5. Submit 1-5 star review, praise tags, and tip
    const provsRes = await request('/api/providers');
    const provider = provsRes.data.data[0];
    const reviewRes = await request('/api/reviews', 'POST', {
      bookingId,
      providerId: provider._id,
      rating: 5,
      praiseTags: ['Punctual & On Time', 'Great Communication', 'Clean Work Area'],
      reviewText: 'Outstanding craftsmanship and very professional.',
      tipAmount: 500,
    }, token);
    assert(reviewRes.status === 201 && reviewRes.data.data.rating === 5, 'FR-15: Submit 1-5 star review, praise chips, and tip in LKR');

    // 6. Fetch provider public reviews
    const getReviewsRes = await request(`/api/reviews/provider/${provider._id}`);
    assert(getReviewsRes.status === 200 && Array.isArray(getReviewsRes.data.data), 'FR-15b: Fetch provider review wall & verified ratings');

    console.log(`\n-----------------------------------------------------`);
    console.log(` Member 3 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`-----------------------------------------------------`);
    if (failed === 0) {
      console.log(' ALL MEMBER 3 REQUIREMENTS VERIFIED SUCCESSFULLY!\n');
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
  }
};

run();
