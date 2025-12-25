const express = require('express');
const router = express.Router();

const tamVangTamTruController = require('../controllers/tamVangTamTruController');

router.get('/tamtru', tamVangTamTruController.getTamTruList);
router.post('/tamtru/new', tamVangTamTruController.createTamTru);

router.post('/tamtru/:id/chuyendi', tamVangTamTruController.endTamTru);

//Tạm vắng
router.get('/tamvang', tamVangTamTruController.getTamVangList);
router.post('/tamvang/new', tamVangTamTruController.createTamVang);
router.post('/tamvang/:id/trove', tamVangTamTruController.handleTroVe);

module.exports = router;