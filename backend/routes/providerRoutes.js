const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProviderById,
  updateAvailability,
  updateProviderProfile,
  getProviderRequests,
} = require('../controllers/providerController');
const { protect } = require('../middleware/auth');

router.get('/', getProviders);
router.get('/requests', getProviderRequests);
router.put('/availability', updateAvailability);
router.put('/profile', updateProviderProfile);
router.get('/:id', getProviderById);

module.exports = router;
