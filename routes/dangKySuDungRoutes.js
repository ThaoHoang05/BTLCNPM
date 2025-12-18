const router = require('express').Router();
const ctrl = require('../controllers/dangKySuDungController');

router.post('/submit-form', ctrl.guiDangKy);

module.exports = router;
