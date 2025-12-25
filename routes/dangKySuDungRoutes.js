const express = require('express');
const router = express.Router();

const dangKySuDungController = require('../controllers/dangKySuDungController');

router.post('/submit-form', dangKySuDungController.guiDangKy);
router.get('/pending', dangKySuDungController.getPendingList);
router.get('/history', dangKySuDungController.getHistoryList);

module.exports = router;
