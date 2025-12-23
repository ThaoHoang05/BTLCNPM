const NhanKhauModel = require('../models/nhanKhauModel');

const nhanKhauController = {
    // Lấy danh sách nhân khẩu
    getNhanKhauList: async (req, res) => {
            try {
                const data = await NhanKhauModel.getNhanKhauList();
                res.status(200).json(data);
            } catch (error) {
                console.error("Lỗi Controller:", error);
                res.status(500).json({ message: "Lỗi Server khi tải danh sách nhân khẩu" });
            }
    },

};

module.exports = nhanKhauController;