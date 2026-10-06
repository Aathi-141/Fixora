/**
 * Member 4 Automated Test Suite: Provider Operations, Admin Dashboard Modals & Payment
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
  console.log(' FIXORA AUTOMATED TEST SUITE: MEMBER 4');
  console.log(' Provider Operations, Admin Live Modals & Payments');
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
    // 1. Fetch provider
    const provsRes = await request('/api/providers');
    const sampleProvider = provsRes.data.data[0];

    // 2. Provider Availability Toggle
    const availRes = await request('/api/provider/availability', 'PUT', {
      providerId: sampleProvider._id,
      isAvailable: true,
      workingHours: { start: '08:00 AM', end: '07:00 PM' },
    });
    assert(availRes.status === 200 && availRes.data.success, 'FR-16: Toggle Provider Availability & Save Working Hours');

    // 3. Provider Job Lifecycle: Accept -> On The Way -> Complete
    const bookingsRes = await request('/api/admin/bookings');
    const targetBooking = bookingsRes.data.data[0];

    const acceptRes = await request(`/api/bookings/${targetBooking._id}/status`, 'PUT', { status: 'accepted' });
    assert(acceptRes.status === 200 && acceptRes.data.data.status === 'accepted', 'FR-10: Provider Accept booking request status update');

    const onWayRes = await request(`/api/bookings/${targetBooking._id}/status`, 'PUT', { status: 'on_the_way', etaMinutes: 15 });
    assert(onWayRes.status === 200 && onWayRes.data.data.status === 'on_the_way', 'Provider status update to "On The Way" with real-time ETA');

    const compRes = await request(`/api/bookings/${targetBooking._id}/status`, 'PUT', { status: 'completed' });
    assert(compRes.status === 200 && compRes.data.data.status === 'completed', 'Provider mark "Service Completed" status update');

    // 4. Final Bill Payment
    const payRes = await request(`/api/bookings/${targetBooking._id}/pay`, 'POST', { paymentMethod: 'Credit/Debit Card' });
    assert(payRes.status === 200 && payRes.data.data.isPaid, 'FR-12: Final Bill Payment processing & transaction generation');

    // 5. Admin Dashboard Executive Overview Stats
    const adminOverviewRes = await request('/api/admin/overview');
    assert(adminOverviewRes.status === 200 && adminOverviewRes.data.data.stats.totalUsers > 0, 'FR-17: Admin Dashboard Executive KPI stats from live MongoDB');

    // 6. Admin Modal 1: All Registered Users
    const adminUsersRes = await request('/api/admin/users');
    assert(adminUsersRes.status === 200 && adminUsersRes.data.count > 0, 'Admin Modal 1: Live Registered Users query (Customers, Providers, Admins)');

    // 7. Admin Modal 2: Active Service Providers & Verification
    const adminProvsRes = await request('/api/admin/providers');
    assert(adminProvsRes.status === 200 && adminProvsRes.data.count > 0, 'Admin Modal 2: Live Provider Fleet query with Availability & Ratings');

    const verifyRes = await request(`/api/admin/providers/${sampleProvider._id}/verify`, 'PUT', { status: 'verified' });
    assert(verifyRes.status === 200 && verifyRes.data.data.verificationStatus === 'verified', 'FR-17b: Admin Provider Verification & Approval action');

    // 8. Admin Modal 3: Platform Bookings Lifecycle
    const adminBooksRes = await request('/api/admin/bookings');
    assert(adminBooksRes.status === 200 && adminBooksRes.data.count > 0, 'Admin Modal 3: Platform Bookings Lifecycle query with reference & status');

    // 9. Admin Modal 4: Customer Complaints & Dispute Resolution
    const adminDispsRes = await request('/api/admin/disputes');
    assert(adminDispsRes.status === 200 && Array.isArray(adminDispsRes.data.data), 'Admin Modal 4: Customer Complaints & Disputes query');

    if (adminDispsRes.data.data.length > 0) {
      const dispId = adminDispsRes.data.data[0]._id;
      const resolveRes = await request(`/api/admin/disputes/${dispId}/resolve`, 'PUT', {
        resolutionNotes: 'Admin approved credit adjustment.',
      });
      assert(resolveRes.status === 200 && resolveRes.data.data.status === 'resolved', 'Admin Dispute Resolution: Resolve & Issue Customer Credit action');
    }

    console.log(`\n-----------------------------------------------------`);
    console.log(` Member 4 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`-----------------------------------------------------`);
    if (failed === 0) {
      console.log(' ALL MEMBER 4 REQUIREMENTS VERIFIED SUCCESSFULLY!\n');
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
  }
};

run();
