const Review = require('../models/Review');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');

// @desc    Submit rating and review
// @route   POST /api/reviews
// @access  Private / Public
exports.createReview = async (req, res) => {
  try {
    const {
      bookingId,
      providerId,
      rating,
      praiseTags = [],
      reviewText = '',
      tipAmount = 0,
      photos = [],
      customerName,
    } = req.body;

    if (!providerId || !rating) {
      return res.status(400).json({ success: false, message: 'Provider and rating (1-5) are required' });
    }

    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const customerId = req.user ? req.user.id : (req.body.customerId || provider.user);

    const review = await Review.create({
      booking: bookingId || provider._id,
      customer: customerId,
      customerName: customerName || (req.user ? req.user.name : 'Verified Customer'),
      provider: provider._id,
      rating: Number(rating),
      praiseTags,
      reviewText,
      tipAmount: Number(tipAmount) || 0,
      photos,
    });

    // Recalculate provider rating and review count
    const allReviews = await Review.find({ provider: provider._id });
    const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);

    provider.rating = parseFloat(avgRating);
    provider.reviewCount = allReviews.length;
    await provider.save();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
      updatedProviderRating: provider.rating,
    });
  } catch (error) {
    console.error('createReview error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
