const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews } = require('../controllers/reviewController');

router.post('/', createReview);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
