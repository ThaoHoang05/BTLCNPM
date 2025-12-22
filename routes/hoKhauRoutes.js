const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
router.get('/dashboard', adminController.getDashboardStats);
router.get('/show', adminController.getHoKhauList);
router.get('/show/:id', adminController.getHouseholdDetail);



module.exports = router;