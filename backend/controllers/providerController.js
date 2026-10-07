const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all providers with filters and search
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
  try {
    const { category, search, minRating, maxPrice, city, availableOnly } = req.query;

    let query = {};

    if (category && category !== 'All') {
      const catList = category.split(',').map((c) => c.trim()).filter(Boolean);
      const catRegexes = [];
      for (const c of catList) {
        if (/ac|hvac/i.test(c)) {
          catRegexes.push(/ac/i, /hvac/i);
        } else if (/carpent/i.test(c)) {
          catRegexes.push(/carpent/i);
        } else if (/paint/i.test(c)) {
          catRegexes.push(/paint/i);
        } else if (/clean/i.test(c)) {
          catRegexes.push(/clean/i);
        } else if (/electr/i.test(c)) {
          catRegexes.push(/electr/i);
        } else if (/plumb/i.test(c)) {
          catRegexes.push(/plumb/i);
        } else {
          catRegexes.push(new RegExp(c, 'i'));
        }
      }
      query.category = { $in: catRegexes };
    }

    if (minRating && !isNaN(parseFloat(minRating))) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      query.hourlyRate = { $lte: parseFloat(maxPrice) };
    }

    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    let providers = await ProviderProfile.find(query).populate('user', 'name email phone avatar address');

    // Multi-token city & area search matching against provider city and user address
    if (city && city.trim()) {
      const cityTokens = city
        .trim()
        .split(/[,;\-\/]+/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 1);

      if (cityTokens.length > 0) {
        providers = providers.filter((p) => {
          const pCity = (p.city || '').toLowerCase();
          const pAddress = (p.user?.address || '').toLowerCase();
          return cityTokens.some(
            (t) =>
              pCity.includes(t) ||
              pAddress.includes(t) ||
              (pCity.length > 2 && t.includes(pCity))
          );
        });
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      providers = providers.filter((p) => {
        const nameMatch = p.user?.name && searchRegex.test(p.user.name);
        const catMatch = p.category && searchRegex.test(p.category);
        const specMatch = p.specialization && searchRegex.test(p.specialization);
        const skillsMatch = p.skills && p.skills.some((s) => searchRegex.test(s));
        const cityMatch = (p.city && searchRegex.test(p.city)) || (p.user?.address && searchRegex.test(p.user.address));
        return nameMatch || catMatch || specMatch || skillsMatch || cityMatch;
      });
    }

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    console.error('getProviders error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single provider by ID with details and reviews
// @route   GET /api/providers/:id
// @access  Public
exports.getProviderById = async (req, res) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id).populate('user', 'name email phone avatar address');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const reviews = await Review.find({ provider: provider._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...provider.toObject(),
        reviews,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update provider availability & schedule
// @route   PUT /api/provider/availability
// @access  Private / Public
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, weeklySchedule, workingHours, serviceRadiusKm, providerId } = req.body;

    let provider = null;
    if (req.user && req.user.id) {
      provider = await ProviderProfile.findOne({ user: req.user.id });
    }
    if (!provider && providerId) {
      provider = await ProviderProfile.findById(providerId);
    }
    if (!provider) {
      provider = await ProviderProfile.findOne();
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    if (typeof isAvailable !== 'undefined') provider.isAvailable = isAvailable;
    if (weeklySchedule) provider.weeklySchedule = weeklySchedule;
    if (workingHours) provider.workingHours = workingHours;
    if (serviceRadiusKm) provider.serviceRadiusKm = serviceRadiusKm;

    await provider.save();

    return res.status(200).json({
      success: true,
      message: 'Provider availability updated successfully',
      data: provider,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update provider profile details
// @route   PUT /api/provider/profile
// @access  Private / Public
exports.updateProviderProfile = async (req, res) => {
  try {
    const { specialization, hourlyRate, about, skills, licenseNumber, providerId, avatar } = req.body;

    let provider = null;
    if (req.user && req.user.id) {
      provider = await ProviderProfile.findOne({ user: req.user.id });
    }
    if (!provider && providerId) {
      provider = await ProviderProfile.findById(providerId);
    }
    if (!provider) {
      provider = await ProviderProfile.findOne();
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    if (specialization) provider.specialization = specialization;
    if (hourlyRate) provider.hourlyRate = hourlyRate;
    if (about) provider.about = about;
    if (skills) provider.skills = skills;
    if (licenseNumber) provider.licenseNumber = licenseNumber;
    if (avatar) {
      provider.avatar = avatar;
      if (provider.user) {
        await User.findByIdAndUpdate(provider.user, { avatar });
      }
    }

    await provider.save();

    return res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully',
      data: provider,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get incoming service requests for provider
// @route   GET /api/provider/requests
// @access  Public / Private (Provider)
exports.getProviderRequests = async (req, res) => {
  try {
    // Check MongoDB connection readiness
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is currently disconnected. Please verify database connectivity.',
      });
    }

    let providerProfileId = null;

    // 1. Direct query param if provided
    if (req.query.providerId) {
      providerProfileId = req.query.providerId;
    }

    // 2. Resolve provider from req.user or Authorization Bearer token header
    if (!providerProfileId) {
      let userId = req.user ? (req.user._id || req.user.id) : null;

      if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fixora_super_secret_jwt_key_2026_it3060_hci'
          );
          userId = decoded.id;
        } catch (e) {
          // Token invalid or expired
        }
      }

      if (userId) {
        // Find ProviderProfile for this user
        const profile = await ProviderProfile.findOne({ user: userId });
        if (profile) {
          providerProfileId = profile._id;
        } else {
          // Check if userId itself is a ProviderProfile ID
          const directProfile = await ProviderProfile.findById(userId);
          if (directProfile) {
            providerProfileId = directProfile._id;
          }
        }
      }
    }

    // If still no providerProfileId could be identified
    if (!providerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Provider profile is not linked to this account. Please complete your provider profile setup.',
      });
    }

    // Build query scoped strictly to this provider
    let query = { provider: providerProfileId };

    // Support status filter (e.g. ?status=pending or ?status=pending,accepted,on_the_way)
    if (req.query.status) {
      if (req.query.status.includes(',')) {
        query.status = { $in: req.query.status.split(',').map((s) => s.trim()) };
      } else {
        query.status = req.query.status.trim();
      }
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name phone email avatar address')
      .populate('provider')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      providerProfileId,
      data: bookings,
    });
  } catch (error) {
    console.error('getProviderRequests error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
