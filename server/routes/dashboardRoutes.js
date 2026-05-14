const express = require('express');
const { getStats, getChartData, getRecentActivity } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', verifyToken, getStats);
router.get('/chart-data', verifyToken, getChartData);
router.get('/recent-activity', verifyToken, getRecentActivity);

module.exports = router;
