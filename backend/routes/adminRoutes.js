const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getAdminProviders,
  verifyProvider,
  getDisputes,
  resolveDispute,
} = require('../controllers/adminController');

router.get('/overview', getOverviewStats);
router.get('/providers', getAdminProviders);
router.put('/providers/:id/verify', verifyProvider);
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

module.exports = router;
