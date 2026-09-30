/**
 * Automated Functional API Test Suite for Fixora Backend
 * Covers CRUD operations and requirements for all 4 team members
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
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log(' Starting Fixora Backend Automated Functional Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(` [PASS] ${description}`);
      passed++;
    } else {
      console.error(` [FAIL] ${description}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/');
    assert(health.status === 200 && health.data.app === 'Fixora API', 'Health check endpoint returns 200 & Fixora API');

    // 2. Member 1: Auth & Discovery
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Test Customer',
      email: `test_user_${Date.now()}@test.lk`,
      password: 'password123',
      phone: '+94 77 000 1122',
      role: 'customer',
    });
    assert(regRes.status === 201 && regRes.data.token, 'FR-01: Member 1 - User Registration & JWT token generation');
    const token = regRes.data?.token;
    const testUserId = regRes.data?.user?.id;

    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'kasun@gmail.com',
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'FR-02: Member 1 - User Login with credentials');

    const googleAuthRes = await request('/api/auth/google', 'POST', {
      email: `google_${Date.now()}@fixora.lk`,
      name: 'Google Verified User',
      googleId: 'g_123456789',
    });
    assert(googleAuthRes.status === 200 && googleAuthRes.data.token, 'Member 1 - Google OAuth endpoint returns authenticated session');

    const providersRes = await request('/api/providers?category=Plumber');
    assert(providersRes.status === 200 && providersRes.data.count > 0, 'FR-03/04: Member 1 - Providers search & category filter (Plumber)');
    const sampleProvider = providersRes.data?.data?.[0];

    const providerDetailRes = await request(`/api/providers/${sampleProvider._id}`);
    assert(providerDetailRes.status === 200 && providerDetailRes.data.data.reviews, 'FR-05: Member 1 - View provider profile details & reviews');

    // 3. Member 2: Booking Flow
    const newBookingRes = await request('/api/bookings', 'POST', {
      customerId: testUserId,
      providerId: sampleProvider._id,
      serviceCategory: sampleProvider.category,
      serviceTitle: `${sampleProvider.category} Rapid Service`,
      scheduledDate: '2026-10-15',
      timeSlot: '11:00 AM',
      serviceAddress: 'No 88, Baseline Road, Colombo',
      addOns: [{ name: 'Pipe Joint Replacement', price: 1200, selected: true }],
      pricing: { basePrice: 2000, addOnsTotal: 1200, serviceFee: 250, totalAmount: 3450 },
    }, token);
    assert(newBookingRes.status === 201 && newBookingRes.data.data.bookingRef, 'FR-07/08: Member 2 - Create booking with Date & Time, Add-ons & LKR pricing');
    const createdBooking = newBookingRes.data?.data;

    const rescheduleRes = await request(`/api/bookings/${createdBooking._id}/reschedule`, 'PUT', {
      scheduledDate: '2026-10-18',
      timeSlot: '02:00 PM',
    }, token);
    assert(rescheduleRes.status === 200 && rescheduleRes.data.data.scheduledDate === '2026-10-18', 'FR-13: Member 2 - Reschedule appointment date & time');

    const cancelRes = await request(`/api/bookings/${createdBooking._id}/cancel`, 'PUT', {
      cancellationReason: 'Change of schedule plans',
    }, token);
    assert(cancelRes.status === 200 && cancelRes.data.data.status === 'cancelled', 'FR-13: Member 2 - Cancel booking with refund reason');

    // 4. Member 3: Status, Chat & Reviews
    const sendMsgRes = await request(`/api/bookings/${createdBooking._id}/messages`, 'POST', {
      text: 'Exact Location',
      isQuickReply: true,
      senderRole: 'customer',
      senderName: 'Test Customer',
    }, token);
    assert(sendMsgRes.status === 201 && sendMsgRes.data.data.isQuickReply, 'FR-14: Member 3 - Send 1-tap quick reply in chat');

    const getMsgRes = await request(`/api/bookings/${createdBooking._id}/messages`);
    assert(getMsgRes.status === 200 && getMsgRes.data.count > 0, 'FR-14: Member 3 - Fetch in-app chat conversation history');

    const reviewRes = await request('/api/reviews', 'POST', {
      bookingId: createdBooking._id,
      providerId: sampleProvider._id,
      rating: 5,
      praiseTags: ['Punctual & On Time', 'Clean Work Area'],
      reviewText: 'Excellent service and punctual arrival.',
      tipAmount: 300,
    }, token);
    assert(reviewRes.status === 201 && reviewRes.data.data.rating === 5, 'FR-15: Member 3 - Submit 1-5 star review, praise chips, and tip in LKR');

    const historyRes = await request('/api/bookings/my-history');
    assert(historyRes.status === 200 && typeof historyRes.data.ongoingCount === 'number', 'FR-18: Member 3 - Fetch service request history (Ongoing & Completed tabs)');

    // 5. Member 4: Provider & Admin Management
    const statusUpdateRes = await request(`/api/bookings/${createdBooking._id}/status`, 'PUT', {
      status: 'accepted',
    }, token);
    assert(statusUpdateRes.status === 200 && statusUpdateRes.data.data.status === 'accepted', 'FR-10: Member 4 - Provider Accept / Reject request status update');

    const availabilityRes = await request('/api/provider/availability', 'PUT', {
      providerId: sampleProvider._id,
      isAvailable: true,
      workingHours: { start: '08:00 AM', end: '07:00 PM' },
    }, token);
    assert(availabilityRes.status === 200 && availabilityRes.data.success, 'FR-16: Member 4 - Toggle provider availability & save working hours');

    const adminStatsRes = await request('/api/admin/overview');
    assert(adminStatsRes.status === 200 && adminStatsRes.data.data.stats.totalUsers > 0, 'FR-17: Member 4 - Admin Dashboard Executive KPI stats');

    const verifyRes = await request(`/api/admin/providers/${sampleProvider._id}/verify`, 'PUT', {
      status: 'verified',
    });
    assert(verifyRes.status === 200 && verifyRes.data.data.verificationStatus === 'verified', 'FR-17: Member 4 - Admin Provider verification & approval');

    const paymentRes = await request(`/api/bookings/${createdBooking._id}/pay`, 'POST', {
      paymentMethod: 'Apple Pay',
    }, token);
    assert(paymentRes.status === 200 && paymentRes.data.data.isPaid, 'FR-12: Member 4 - Final Bill Payment processing & transaction generation');

    console.log(`\n========================================`);
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log(' ALL FUNCTIONAL AND CRUD REQUIREMENTS VERIFIED SUCCESSFULLY!');
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
  }
};

runTests();
