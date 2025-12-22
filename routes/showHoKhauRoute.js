const express = require('express');
const router = express.Router();
const showHoKhauController = require('../controllers/showHoKhauController');

// Định nghĩa endpoint GET /api/hokhau
router.get('/', showHoKhauController.getHoKhauList);

module.exports = router;