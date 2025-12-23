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
    },

    getHoKhauList: async (req, res) => {
    try {
        const data = await HoKhauModel.getHoKhauData();
        // Trả về dữ liệu với mã 200 (Thành công)
        res.status(200).json(data);
    } catch (err) {
        // Log lỗi chi tiết ra console của terminal để kiểm tra nếu còn lỗi
        console.error("Lỗi tại showHoKhauController:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi tải danh sách hộ khẩu" });
    }
    },

    createHousehold: async (req, res) => {
        try {
            const result = await HoKhauModel.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("Lỗi Controller createHousehold:", error.message);
            res.status(500).json({ message: "Lỗi Server khi tạo hộ khẩu" });
        }
    },

    splitHousehold: async (req, res) => {
        const { id } = req.params; // ID hộ cũ
        try {
            const result = await HoKhauModel.split(id, req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("Lỗi tách hộ:", error.message);
            res.status(500).json({ message: error.message || "Lỗi khi tách hộ" });
        }
    },
    
};

module.exports = adminController;