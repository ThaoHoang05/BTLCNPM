const express = require('express');
const router = express.Router();

const tamVangTamTruController = require('../controllers/tamVangTamTruController');

router.get('/tamtru', tamVangTamTruController.getTamTruList);
router.post('/tamtru/new', tamVangTamTruController.createTamTru);

router.post('/tamtru/:id/chuyendi', tamVangTamTruController.endTamTru);

module.exports = router;