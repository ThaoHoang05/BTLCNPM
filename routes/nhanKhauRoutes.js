const express = require('express');
const router = express.Router();

const nhanKhauController = require('../controllers/nhanKhauController');

router.get('/show', nhanKhauController.getNhanKhauList);

module.exports = router;