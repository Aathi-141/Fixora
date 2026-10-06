const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getAdminUsers,
  getAdminProviders,
  verifyProvider,
  getAdminBookings,
  getDisputes,
  resolveDispute,
} = require('../controllers/adminController');

router.get('/overview', getOverviewStats);
router.get('/users', getAdminUsers);
router.get('/providers', getAdminProviders);
router.put('/providers/:id/verify', verifyProvider);
router.get('/bookings', getAdminBookings);
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

module.exports = router;
