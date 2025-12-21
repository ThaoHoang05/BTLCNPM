const HoKhauModel = require('../models/hoKhauModel');

const adminController = {
    getDashboardStats: async (req, res) => {
        try {
            const stats = await HoKhauModel.getDashboardStats();
            res.status(200).json(stats); // Trả về kết quả cho home.js
        } catch (error) {
            res.status(500).json({ message: "Lỗi Server" });
        }
    },

    getHouseholdDetail: async (req, res) => {
        const { id } = req.params; // Lấy :id từ URL
        try {
            const data = await HoKhauModel.getDetail(id);
            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy hộ khẩu này" });
            }
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy chi tiết hộ khẩu" });
        }
    }
};

module.exports = adminController;