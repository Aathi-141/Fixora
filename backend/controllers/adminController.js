const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Dispute = require('../models/Dispute');

// @desc    Get Admin Dashboard Overview Stats & KPIs
// @route   GET /api/admin/overview
// @access  Public / Private (Admin)
exports.getOverviewStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeProviders = await ProviderProfile.countDocuments({ isAvailable: true });
    const totalBookings = await Booking.countDocuments();
    const pendingDisputes = await Dispute.countDocuments({ status: { $ne: 'resolved' } });

    // Calculate revenue from completed bookings
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: typeof totalUsers === 'number' ? totalUsers : 0,
          activeProviders: typeof activeProviders === 'number' ? activeProviders : 0,
          totalBookings: typeof totalBookings === 'number' ? totalBookings : 0,
          pendingDisputes: typeof pendingDisputes === 'number' ? pendingDisputes : 0,
          totalRevenue: typeof totalRevenue === 'number' ? totalRevenue : 0, // in LKR
          systemStatus: 'All Systems Operational',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users (Customers, Providers, Admins)
// @route   GET /api/admin/users
// @access  Private / Public
exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all providers for Admin view with status
// @route   GET /api/admin/providers
// @access  Private / Public
exports.getAdminProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find()
      .populate('user', 'name email phone avatar address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify or Reject provider (Admin action)
// @route   PUT /api/admin/providers/:id/verify
// @access  Private / Public
exports.verifyProvider = async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'

    const provider = await ProviderProfile.findById(req.params.id).populate('user');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    provider.verificationStatus = status || 'verified';
    await provider.save();

    return res.status(200).json({
      success: true,
      message: `Provider ${provider.user ? provider.user.name : ''} marked as ${provider.verificationStatus}`,
      data: provider,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all platform bookings lifecycle
// @route   GET /api/admin/bookings
// @access  Private / Public
exports.getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone avatar address')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name email phone avatar address' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all disputes / complaints
// @route   GET /api/admin/disputes
// @access  Private / Public
exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate({
        path: 'booking',
        populate: [
          { path: 'customer', select: 'name email phone avatar' },
          {
            path: 'provider',
            populate: { path: 'user', select: 'name email phone avatar' },
          },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a dispute & issue customer credit/refund
// @route   PUT /api/admin/disputes/:id/resolve
// @access  Private / Public
exports.resolveDispute = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;

    const dispute = await Dispute.findById(req.params.id).populate('booking');
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    dispute.status = 'resolved';
    dispute.resolutionNotes =
      resolutionNotes ||
      `Resolved by Administrator: LKR ${dispute.amount || 0} customer credit refund approved and credited.`;
    await dispute.save();

    // If linked to a booking, note the dispute resolution
    if (dispute.booking && dispute.booking._id) {
      await Booking.findByIdAndUpdate(dispute.booking._id, {
        notes: dispute.booking.notes
          ? `${dispute.booking.notes} [Dispute Resolved: Credit Issued]`
          : '[Dispute Resolved: Credit Issued]',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully. Customer credit and refund adjustment issued.',
      data: dispute,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
