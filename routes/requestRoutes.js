const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// ===============================================================
// ROUTE YÊU CẦU TỪ CƯ DÂN (User Side)
// ===============================================================

// 1. Gửi yêu cầu sửa thông tin Hộ Khẩu
// POST /api/resident/hokhau/:id (id = Mã hộ khẩu)
router.post('/resident/hokhau/:id', requestController.requestEditHoKhau);

// 2. Gửi yêu cầu sửa thông tin Nhân Khẩu
// POST /api/resident/nhankhau/:id (id = CCCD người cần sửa)
router.post('/resident/nhankhau/:id', requestController.requestEditNhanKhau);

// 3. Gửi yêu cầu Đăng ký Tạm Trú
// POST /api/resident/tamtru/:id (id = CCCD người gửi yêu cầu)
router.post('/resident/tamtru/:id', requestController.requestTamTru);

// 4. Gửi yêu cầu Khai báo Tạm Vắng
// POST /api/resident/tamvang/:id (id = CCCD người gửi yêu cầu)
router.post('/resident/tamvang/:id', requestController.requestTamVang);

// 5. Xem lịch sử yêu cầu của cá nhân
// GET /api/requests/history/:cccd
router.get('/requests/history/:cccd', requestController.getHistory);

module.exports = router;