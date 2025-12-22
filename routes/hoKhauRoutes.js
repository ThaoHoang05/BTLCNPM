const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const showHoKhauController = require('../controllers/showHoKhauController');

router.get('/dashboard', adminController.getDashboardStats);
router.get('/show', showHoKhauController.getHoKhauList);
router.get('/show/:id', adminController.getHouseholdDetail);



module.exports = router;