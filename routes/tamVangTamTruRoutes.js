const express = require('express');
const router = express.Router();

const tamVangTamTruController = require('../controllers/tamVangTamTruController');

router.get('/tamtru', tamVangTamTruController.getTamTruList);

module.exports = router;