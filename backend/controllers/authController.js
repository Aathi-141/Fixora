const mongoose = require('mongoose');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fixora_super_secret_jwt_key_2026_it3060_hci', {
    expiresIn: '30d',
  });
};

// @desc    Register a new customer or provider
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, category, city, hourlyRate, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'customer',
      avatar: avatar || null,
      address: city ? `${city}, Sri Lanka` : 'Colombo, Sri Lanka',
    });

    let providerProfile = null;
    if (role === 'provider') {
      providerProfile = await ProviderProfile.create({
        user: user._id,
        category: category || 'Electrician',
        specialization: `${category || 'Home Service'} Specialist`,
        city: city || 'Colombo',
        hourlyRate: hourlyRate || 700,
        avatar: avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop',
        isAvailable: true,
      });
    }

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
        providerProfileId: providerProfile ? providerProfile._id : null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ProviderProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
        providerProfileId: providerProfile ? providerProfile._id : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth login or registration
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar, role = 'customer' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required from Google OAuth' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId: googleId || 'google_' + Date.now(),
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
        role,
        address: 'Colombo, Sri Lanka',
      });

      if (role === 'provider') {
        await ProviderProfile.create({
          user: user._id,
          category: 'Electrician',
          specialization: 'Certified Specialist',
          city: 'Colombo',
          hourlyRate: 700,
        });
      }
    }

    const token = signToken(user._id);
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ProviderProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
        providerProfileId: providerProfile ? providerProfile._id : null,
      },
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ProviderProfile.findOne({ user: user._id });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
        providerProfile,
        providerProfileId: providerProfile ? providerProfile._id : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently disconnected. Please retry shortly.',
      });
    }

    const { name, phone, address, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 2 characters long.',
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || !phone.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Phone number cannot be empty.',
        });
      }
      const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');
      if (!/^\+?[0-9]{8,15}$/.test(cleaned)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number (e.g. 077 123 4567 or +94 77 123 4567).',
        });
      }
      user.phone = phone.trim();
    }

    if (address !== undefined) {
      if (typeof address !== 'string' || address.trim().length < 4) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid street address (minimum 4 characters).',
        });
      }
      user.address = address.trim();
    }

    if (avatar !== undefined) {
      user.avatar = avatar; // accepts image string or null to reset to default initials
    }

    await user.save();

    if (user.role === 'provider' && avatar !== undefined) {
      await ProviderProfile.updateOne({ user: user._id }, { $set: { avatar } });
    }

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ProviderProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
        providerProfileId: providerProfile ? providerProfile._id : null,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
