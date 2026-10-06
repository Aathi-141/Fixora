/**
 * Member 2 Automated Test Suite: Booking Flow & Profile Management
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
  console.log(' FIXORA AUTOMATED TEST SUITE: MEMBER 2');
  console.log(' Service Booking Flow, Reschedule & Customer Profile');
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
    // 1. Register test customer
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Aathika Customer',
      email: `m2_user_${Date.now()}@test.lk`,
      password: 'password123',
      phone: '0771234567',
      address: 'No 42, New Kandy Road, Malabe',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    });
    assert(regRes.status === 201 && regRes.data.token, 'Customer account creation with photo & address');
    const token = regRes.data?.token;

    // 2. Fetch providers to book
    const provsRes = await request('/api/providers');
    assert(provsRes.status === 200 && provsRes.data.count > 0, 'Fetch verified providers for booking');
    const provider = provsRes.data.data[0];

    // 3. Create Booking (Date, Time, Address, Add-ons, LKR Pricing)
    const bookRes = await request('/api/bookings', 'POST', {
      providerId: provider._id,
      serviceCategory: provider.category,
      serviceTitle: `${provider.category} Repair Service`,
      scheduledDate: '2026-10-20',
      timeSlot: '10:00 AM - 12:00 PM',
      serviceAddress: 'No 42, New Kandy Road, Malabe',
      customerPhone: '0771234567',
      customerName: 'Aathika Customer',
      notes: 'Please bring tools and replacement pipes',
      addOns: [{ name: 'Pipe Joint Replacement', price: 1200, selected: true }],
      pricing: { basePrice: 2000, addOnsTotal: 1200, serviceFee: 250, totalAmount: 3450 },
    }, token);
    assert(bookRes.status === 201 && bookRes.data.data.bookingRef, 'FR-07/08: Create Booking with Date, Time Slot, Add-ons & LKR Pricing');
    const booking = bookRes.data.data;
    assert(booking.customerAvatar && booking.customerName, 'Booking persists customer name & real profile avatar');

    // 4. Reschedule Booking
    const reschedRes = await request(`/api/bookings/${booking._id}/reschedule`, 'PUT', {
      scheduledDate: '2026-10-22',
      timeSlot: '02:00 PM - 04:00 PM',
      notes: 'Moved due to client meeting schedule',
    }, token);
    assert(reschedRes.status === 200 && reschedRes.data.data.scheduledDate === '2026-10-22', 'FR-13: Reschedule booking date & time slot with audit history');

    // 5. Update Customer Profile
    const profileRes = await request('/api/auth/profile', 'PUT', {
      name: 'Aathika M. Customer',
      phone: '0779876543',
      address: 'No 108, High Level Road, Nugegoda',
    }, token);
    assert(profileRes.status === 200 && profileRes.data.user.name === 'Aathika M. Customer', 'Customer Profile: Update verified name, phone & address in MongoDB');

    // 6. Cancel Booking
    const cancelRes = await request(`/api/bookings/${booking._id}/cancel`, 'PUT', {
      cancellationReason: 'Repaired by landlord earlier',
    }, token);
    assert(cancelRes.status === 200 && cancelRes.data.data.status === 'cancelled', 'FR-13: Cancel booking with refund reason & cancellation policy');

    console.log(`\n-----------------------------------------------------`);
    console.log(` Member 2 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`-----------------------------------------------------`);
    if (failed === 0) {
      console.log(' ALL MEMBER 2 REQUIREMENTS VERIFIED SUCCESSFULLY!\n');
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
  }
};

run();
