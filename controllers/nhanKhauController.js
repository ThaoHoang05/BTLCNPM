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

    // Đăng ký nhân khẩu mới (POST /nhankhau/new)
    createNhanKhau: async (req, res) => {
        try {
            // Nhận payload từ Frontend
            const result = await NhanKhauModel.create(req.body);

            res.status(201).json({
                success: true,
                message: "Đăng ký nhân khẩu thành công.",
                data: result
            });
        } catch (error) {
            console.error("Lỗi Controller createNhanKhau:", error.message);

            // Xử lý các lỗi ràng buộc dữ liệu từ Database
            if (error.code === '23505') {
                return res.status(400).json({ message: "Số CCCD này đã tồn tại trên hệ thống." });
            }
            if (error.code === '23503') {
                return res.status(400).json({ message: "Mã hộ khẩu (SoHoKhau) không tồn tại." });
            }

            res.status(500).json({ message: "Lỗi hệ thống khi đăng ký nhân khẩu mới." });
        }
    },

    // Lấy thông tin chi tiết nhân khẩu
    getNhanKhauDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await NhanKhauModel.getById(id);
            
            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy nhân khẩu" });
            }
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi lấy chi tiết nhân khẩu" });
        }
    },

    // Sửa thông tin nhân khẩu
    updateNhanKhau: async (req, res) => {
        try {
            const { id } = req.params;
            await NhanKhauModel.update(id, req.body);
            
            res.status(200).json({ message: "Cập nhật thông tin thành công" });
        } catch (error) {
            console.error("Lỗi update:", error);
            if (error.code === '23505') { 
                return res.status(400).json({ message: "Số CCCD này đã tồn tại trên hệ thống. Vui lòng kiểm tra lại!" });
            }
            res.status(500).json({ message: "Lỗi hệ thống khi cập nhật" });
        }
    },

};

module.exports = nhanKhauController;