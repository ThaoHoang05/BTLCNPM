const express = require('express');
const router = express.Router();

const adminHomeController = require('../controllers/adminHomeController');
router.get('/dashboard', adminHomeController.getDashboardStats);

module.exports = router;