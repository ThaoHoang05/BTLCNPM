const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

router.get('/dashboard', adminController.getDashboardStats);
router.post('/new', adminController.createHousehold);
router.get('/show', adminController.getHoKhauList);

router.get('/show/:id', adminController.getHouseholdDetail);
router.post('/:id/new', adminController.splitHousehold);



module.exports = router;