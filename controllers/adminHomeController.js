const HoKhauModel = require('../models/hoKhauModel');

const adminHomeController = {
    getDashboardStats: async (req, res) => {
        try {
            const stats = await HoKhauModel.getDashboardStats();
            res.status(200).json(stats); // Trả về kết quả cho home.js
        } catch (error) {
            res.status(500).json({ message: "Lỗi Server" });
        }
    }
};

module.exports = adminHomeController;