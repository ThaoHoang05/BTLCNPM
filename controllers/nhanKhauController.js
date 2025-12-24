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

    // Xóa nhân khẩu
    deleteNhanKhau: async (req, res) => {
        const { id } = req.params;
        try {
            const rowsDeleted = await NhanKhauModel.delete(id);
            if (rowsDeleted === 0) {
                return res.status(404).json({ message: "Không tìm thấy nhân khẩu để xóa." });
            }
            res.status(200).json({ message: "Xóa nhân khẩu thành công." });
        } catch (error) {
            console.error("Lỗi xóa nhân khẩu:", error.message);
            res.status(500).json({ message: error.message || "Lỗi hệ thống khi xóa nhân khẩu" });
        }
    },

};

module.exports = nhanKhauController;