const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const ChatMessage = require('../models/ChatMessage');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixora_db';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding Fixora database...');

    // Clear existing collections
    await User.deleteMany();
    await ProviderProfile.deleteMany();
    await Booking.deleteMany();
    await ChatMessage.deleteMany();
    await Review.deleteMany();
    await Dispute.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 1. Create Users
    console.log('Seeding Users...');
    const customerKasun = await User.create({
      name: 'Kasun Perera',
      email: 'kasun@gmail.com',
      password: defaultPassword,
      phone: '+94 77 123 4567',
      role: 'customer',
      address: 'No 42, New Kandy Road, Malabe',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
    });

    const customerLakmini = await User.create({
      name: 'Lakmini S.',
      email: 'lakmini@gmail.com',
      password: defaultPassword,
      phone: '+94 71 889 0011',
      role: 'customer',
      address: 'No 15, Station Road, Beliyatta',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop',
    });

    const userRamesh = await User.create({
      name: 'Ramesh Mendis',
      email: 'ramesh@fixora.lk',
      password: defaultPassword,
      phone: '+94 70 334 5566',
      role: 'provider',
      address: 'Colombo 05, Sri Lanka',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop',
    });

    const userSunil = await User.create({
      name: 'Sunil Perera',
      email: 'sunil@fixora.lk',
      password: defaultPassword,
      phone: '+94 77 990 1122',
      role: 'provider',
      address: 'Gothatuwa, Colombo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop',
    });

    const userChaminda = await User.create({
      name: 'Chaminda Wickramasinghe',
      email: 'chaminda@fixora.lk',
      password: defaultPassword,
      phone: '+94 76 555 4433',
      role: 'provider',
      address: 'Malabe, Colombo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop',
    });

    const userNuwan = await User.create({
      name: 'Nuwan Pradeep',
      email: 'nuwan@fixora.lk',
      password: defaultPassword,
      phone: '+94 72 444 8899',
      role: 'provider',
      address: 'Rajagiriya, Colombo',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop',
    });

    const userRohan = await User.create({
      name: 'Rohan Wickramasinghe',
      email: 'rohan@fixora.lk',
      password: defaultPassword,
      phone: '+94 71 222 3344',
      role: 'provider',
      address: 'Nugegoda, Colombo',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop',
    });

    const userBandara = await User.create({
      name: 'Bandara Wijethunga',
      email: 'bandara@fixora.lk',
      password: defaultPassword,
      phone: '+94 75 888 9900',
      role: 'provider',
      address: 'Moratuwa, Western Province',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop',
    });

    const adminUser = await User.create({
      name: 'M. Shibly (Admin Coordinator)',
      email: 'admin@fixora.lk',
      password: defaultPassword,
      phone: '+94 11 234 5678',
      role: 'admin',
      address: 'Headquarters, Colombo 03',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop',
    });

    // 2. Create Provider Profiles
    console.log('Seeding Provider Profiles...');
    const providerRamesh = await ProviderProfile.create({
      user: userRamesh._id,
      category: 'Electrician',
      specialization: 'Senior Certified Electrician & Specialist',
      experienceYears: 15,
      hourlyRate: 700,
      rating: 4.8,
      reviewCount: 124,
      onTimeRate: 99.4,
      jobsCompleted: 840,
      isAvailable: true,
      weeklySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: { start: '08:00 AM', end: '06:00 PM' },
      serviceRadiusKm: 15,
      city: 'Colombo',
      about:
        'Certified Master Electrician with 15+ years specializing in residential user-center appliances, EV chargers, commercial wiring, and safety inspections.',
      skills: ['Wiring Repairs', 'Circuit Breakers', 'EV Chargers', 'Lighting Design', 'Generator Setup'],
      verificationStatus: 'verified',
      licenseNumber: 'LK-ELEC-4402',
      avatar: userRamesh.avatar,
    });

    const providerSunil = await ProviderProfile.create({
      user: userSunil._id,
      category: 'Plumber',
      specialization: 'Master High-Pressure Plumber',
      experienceYears: 12,
      hourlyRate: 650,
      rating: 4.9,
      reviewCount: 168,
      onTimeRate: 98.7,
      jobsCompleted: 910,
      isAvailable: true,
      weeklySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      workingHours: { start: '07:30 AM', end: '08:00 PM' },
      serviceRadiusKm: 20,
      city: 'Gothatuwa',
      about:
        'Specialist in high-pressure water systems, emergency leak resolutions, pipe re-routing, and modern bath fixtures.',
      skills: ['Leaking Pipe Repair', 'Drain Cleaning', 'Heater Installation', 'Fixture Replacement'],
      verificationStatus: 'verified',
      licenseNumber: 'LK-PLUMB-1092',
      avatar: userSunil.avatar,
    });

    const providerChaminda = await ProviderProfile.create({
      user: userChaminda._id,
      category: 'Cleaner',
      specialization: 'Deep Home Botanical & Floor Cleaning',
      experienceYears: 8,
      hourlyRate: 500,
      rating: 4.9,
      reviewCount: 204,
      onTimeRate: 100,
      jobsCompleted: 620,
      isAvailable: true,
      weeklySchedule: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: { start: '08:00 AM', end: '05:00 PM' },
      serviceRadiusKm: 12,
      city: 'Malabe',
      about:
        'Eco-friendly deep cleaning specialists using natural botanical sanitizers, allergen-free solutions, and commercial grade steamers.',
      skills: ['Full Home Sanitization', 'Oven Deep Clean', 'Window Polish', 'Carpet Steaming'],
      verificationStatus: 'verified',
      licenseNumber: 'LK-CLN-8831',
      avatar: userChaminda.avatar,
    });

    const providerNuwan = await ProviderProfile.create({
      user: userNuwan._id,
      category: 'AC Technician',
      specialization: 'Inverter AC & Refrigeration Expert',
      experienceYears: 10,
      hourlyRate: 850,
      rating: 4.8,
      reviewCount: 92,
      onTimeRate: 97.5,
      jobsCompleted: 430,
      isAvailable: true,
      weeklySchedule: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: { start: '09:00 AM', end: '06:00 PM' },
      serviceRadiusKm: 25,
      city: 'Rajagiriya',
      about: 'Licensed refrigeration technician with deep expertise in multi-split VRV and eco-gas servicing.',
      skills: ['Gas Refilling', 'Compressor Diagnostic', 'Deep Coil Cleaning', 'Duct Sealing'],
      verificationStatus: 'verified',
      licenseNumber: 'LK-HVAC-3301',
      avatar: userNuwan.avatar,
    });

    const providerRohan = await ProviderProfile.create({
      user: userRohan._id,
      category: 'Painter',
      specialization: 'Interior Weather-Shield & Wall Artisan',
      experienceYears: 11,
      hourlyRate: 600,
      rating: 4.7,
      reviewCount: 88,
      onTimeRate: 98.0,
      jobsCompleted: 310,
      isAvailable: true,
      weeklySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: { start: '08:30 AM', end: '05:30 PM' },
      serviceRadiusKm: 15,
      city: 'Nugegoda',
      about: 'Professional interior and exterior painting with moisture barrier primer and precision edging.',
      skills: ['Anti-Fungal Primer', 'Wall Putty', 'Spray Finishing', 'Waterproof Coating'],
      verificationStatus: 'verified',
      licenseNumber: 'LK-PNT-9921',
      avatar: userRohan.avatar,
    });

    const providerBandara = await ProviderProfile.create({
      user: userBandara._id,
      category: 'Carpenter',
      specialization: 'Master Furniture & Timber Specialist',
      experienceYears: 16,
      hourlyRate: 750,
      rating: 4.9,
      reviewCount: 142,
      onTimeRate: 99.1,
      jobsCompleted: 580,
      isAvailable: true,
      weeklySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: { start: '08:00 AM', end: '06:00 PM' },
      serviceRadiusKm: 18,
      city: 'Moratuwa',
      about: 'Moratuwa-trained wood craftsman specializing in custom timber cabinetry, teak finishes, and lock fittings.',
      skills: ['Mortise Locks', 'Teak Sanding', 'Cabinet Repair', 'Hydraulic Dampers'],
      verificationStatus: 'verified',
      licenseNumber: 'LK-CRP-1120',
      avatar: userBandara.avatar,
    });

    // 3. Create Bookings
    console.log('Seeding Bookings...');
    const bookingOngoing = await Booking.create({
      bookingRef: 'FX-88431',
      customer: customerKasun._id,
      provider: providerSunil._id,
      serviceCategory: 'Plumber',
      serviceTitle: 'Plumbing Repair - Leaking Pipe',
      scheduledDate: '2026-10-02',
      timeSlot: '10:00 AM',
      serviceAddress: 'No 42, New Kandy Road, Malabe',
      customerPhone: '+94 77 123 4567',
      notes: 'Water pipe leaking under kitchen sink, please bring sealing tape and replacement valves.',
      addOns: [
        { name: 'Pipe Joint Replacement', price: 1200, selected: true },
        { name: 'Pressure Valve Check', price: 800, selected: true },
      ],
      pricing: {
        basePrice: 2000,
        addOnsTotal: 2000,
        serviceFee: 250,
        discount: 0,
        totalAmount: 4250,
      },
      status: 'on_the_way',
      etaMinutes: 15,
      etaTime: '10:00 AM',
      isPaid: false,
      paymentBreakdown: [
        { description: 'Master Diagnostic & Inspection', amount: 2000 },
        { description: 'Pipe Joint Replacement & Valve Check', amount: 2000 },
        { description: 'Trust & Safety Assurance Fee', amount: 250 },
      ],
    });

    const bookingCompleted = await Booking.create({
      bookingRef: 'FX-76210',
      customer: customerKasun._id,
      provider: providerChaminda._id,
      serviceCategory: 'Cleaner',
      serviceTitle: 'Deep Home Botanical Cleaning',
      scheduledDate: '2026-09-25',
      timeSlot: '09:00 AM',
      serviceAddress: 'No 42, New Kandy Road, Malabe',
      customerPhone: '+94 77 123 4567',
      notes: 'Regular scheduled monthly botanical cleaning with oven sanitization.',
      addOns: [
        { name: 'Kitchen Oven Degreasing', price: 1200, selected: true },
        { name: 'Double-Door Fridge Sanitization', price: 1100, selected: true },
      ],
      pricing: {
        basePrice: 1450,
        addOnsTotal: 2300,
        serviceFee: 250,
        discount: 0,
        totalAmount: 4000,
      },
      status: 'completed',
      isPaid: true,
      paymentMethod: 'visa',
      paidAt: new Date('2026-09-25T12:30:00Z'),
      transactionId: 'TXN-98432100',
      paymentBreakdown: [
        { description: 'Full Residence Botanical Deep Clean', amount: 2650 },
        { description: 'Degreasing & Sanitization Extras', amount: 1100 },
        { description: 'Fixora Platform Guarantee Fee', amount: 250 },
      ],
    });

    // 4. Create Chat Messages
    console.log('Seeding Chat Messages...');
    await ChatMessage.create([
      {
        booking: bookingOngoing._id,
        sender: userSunil._id,
        senderRole: 'provider',
        senderName: 'Sunil Perera',
        text: 'Hello Kasun, I am on the way to Malabe. ETA is around 15 minutes.',
        createdAt: new Date(Date.now() - 1000 * 60 * 12),
      },
      {
        booking: bookingOngoing._id,
        sender: customerKasun._id,
        senderRole: 'customer',
        senderName: 'Kasun Perera',
        text: 'Great, thank you! The gate is open, you can park in the driveway.',
        createdAt: new Date(Date.now() - 1000 * 60 * 8),
      },
      {
        booking: bookingOngoing._id,
        sender: userSunil._id,
        senderRole: 'provider',
        senderName: 'Sunil Perera',
        text: 'Noted! I have the pressure valves ready.',
        createdAt: new Date(Date.now() - 1000 * 60 * 3),
      },
    ]);

    // 5. Create Reviews
    console.log('Seeding Reviews...');
    await Review.create([
      {
        booking: bookingCompleted._id,
        customer: customerKasun._id,
        customerName: 'Kasun Perera',
        provider: providerChaminda._id,
        rating: 5,
        praiseTags: ['Punctual & On Time', 'Clean Work Area', 'Professional & Polite'],
        reviewText: 'Exceptional work by Chaminda! The kitchen and oven look brand new. Will definitely book again.',
        tipAmount: 500,
        photos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop'],
      },
      {
        booking: bookingCompleted._id,
        customer: customerLakmini._id,
        customerName: 'Lakmini S.',
        provider: providerRamesh._id,
        rating: 5,
        praiseTags: ['Fair & Transparent', 'Punctual & On Time'],
        reviewText: 'Ramesh is extremely knowledgeable. Fixed the power surge safely in less than an hour.',
        tipAmount: 200,
      },
      {
        booking: bookingOngoing._id,
        customer: customerLakmini._id,
        customerName: 'Dinesh M.',
        provider: providerSunil._id,
        rating: 5,
        praiseTags: ['Punctual & On Time', 'Clean Work Area'],
        reviewText: 'Fast diagnosis and cleanly replaced the bathroom faucet pipe.',
        tipAmount: 300,
      },
    ]);

    // 6. Create Disputes (for Admin)
    console.log('Seeding Disputes...');
    await Dispute.create({
      booking: bookingOngoing._id,
      customerName: 'Ajith Kumara',
      providerName: 'Sunil Perera',
      serviceTitle: 'Plumbing - Overcharge Claim',
      amount: 450,
      reason: 'Additional valve charge was unclear before work started.',
      status: 'pending',
      resolutionNotes: '',
    });

    console.log(' Database successfully seeded with all 6 Sri Lankan trades & Admin test data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
