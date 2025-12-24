const express = require('express');
const router = express.Router();

const nhanKhauController = require('../controllers/nhanKhauController');

router.get('/show', nhanKhauController.getNhanKhauList);

router.delete('/delete/:id', nhanKhauController.deleteNhanKhau);

module.exports = router;