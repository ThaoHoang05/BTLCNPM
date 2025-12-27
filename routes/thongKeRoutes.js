const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/thongKeController');

/**
 * Endpoint: GET /api/reports/summary
 * Query params: type, period, time
 */
router.get('/summary', thongKeController.getSummaryReport);
router.get('/details', thongKeController.getDetailsReport);

module.exports = router;