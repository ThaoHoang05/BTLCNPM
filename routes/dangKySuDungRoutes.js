const router = require('express').Router();
const ctrl = require('../controllers/dangKySuDungController');

router.post('/gui', ctrl.guiDangKy);

module.exports = router;
