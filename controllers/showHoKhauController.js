const showHoKhauModel = require('../models/showHoKhauModel');

exports.getHoKhauList = async (req, res) => {
    try {
        const data = await showHoKhauModel.getHoKhauData();
        // Trả về dữ liệu với mã 200 (Thành công)
        res.status(200).json(data);
    } catch (err) {
        // Log lỗi chi tiết ra console của terminal để kiểm tra nếu còn lỗi
        console.error("Lỗi tại showHoKhauController:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi tải danh sách hộ khẩu" });
    }
};