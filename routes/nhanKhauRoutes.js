const express = require('express');
const router = express.Router();

const nhanKhauController = require('../controllers/nhanKhauController');

router.get('/show', nhanKhauController.getNhanKhauList);

router.post('/new', nhanKhauController.createNhanKhau);

router.get('/detail/:id', nhanKhauController.getNhanKhauDetail);
router.delete('/delete/:id', nhanKhauController.deleteNhanKhau);
router.put('/update/:id', nhanKhauController.updateNhanKhau);

module.exports = router;