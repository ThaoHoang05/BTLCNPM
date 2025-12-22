const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
router.get('/dashboard', adminController.getDashboardStats);
router.get('/all/:id', adminController.getHouseholdDetail);

module.exports = router;