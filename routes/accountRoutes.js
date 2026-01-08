const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/dashboard/stats', accountController.getAccountDashboardStats);
router.get('/', accountController.getAccountsWithFullInfo);
router.post('/create', accountController.createAccount);
// Sửa tài khoản (PATCH)
router.patch('/update/:username', accountController.patchAccount);

// Khóa tài khoản (PATCH)
router.patch('/toggle-lock/:username', accountController.toggleLock);

// Reset mật khẩu (PATCH)
router.patch('/reset-password/:username', accountController.resetPassword);

router.get('/check-resident/:cccd', accountController.checkResident);

module.exports = router;