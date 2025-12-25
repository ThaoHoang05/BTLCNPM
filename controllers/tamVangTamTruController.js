const TamVangTamTruModel = require('../models/tamVangTamTruModel');

const tamVangTamTruController = {
// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM TRÚ)
// ==============================================

    getTamTruList: async (req, res) => {
        try {
            // 1. Lấy số trang từ URL (ví dụ: /api/tamtru?page=2)
            const page = parseInt(req.query.page) || 1; 

            // 2. Truyền số trang vào Model
            const data = await TamVangTamTruModel.getTamTruList(page);
            
            res.status(200).json(data);
        } catch (error) {
            console.error(error); // Nên log lỗi để debug
            res.status(500).json({ message: "Lỗi hệ thống khi tải danh sách tạm trú" });
        }
    },

    endTamTru: async (req, res) => {
    const { id } = req.params; // ID của phiếu tạm trú
    try {
        await TamVangTamTruModel.endTamTru(id);
        res.status(200).json({ message: "Đã xác nhận công dân chuyển đi." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật trạng thái chuyển đi." });
    }
    },

    createTamTru: async (req, res) => {
        try {
            const { hoTenNguoiDK, hoTenChuHo, cccdChuHo, thoiGian } = req.body;
            if (!hoTenNguoiDK || !hoTenChuHo || !cccdChuHo || !thoiGian?.tu || !thoiGian?.den) {
                return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Tên người ĐK, Chủ hộ, Thời gian)" });
            }

            const result = await TamVangTamTruModel.addTamTru(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("Lỗi đăng ký tạm trú:", error);
            res.status(500).json({ message: error.message || "Lỗi server" });
        }
    },

// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM VẮNG)
// ==============================================

    getTamVangList: async (req, res) => {
        try {
            // Lấy số trang từ URL (ví dụ: /api/tamvang?page=2), mặc định là trang 1
            const page = parseInt(req.query.page) || 1;

            // Gọi Model để lấy dữ liệu theo trang
            const result = await TamVangTamTruModel.getTamVangList(page);

            // Trả về dữ liệu kèm theo status 200
            res.status(200).json(result);
        } catch (error) {
            console.error("Lỗi tại Controller getTamVangList:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tải danh sách tạm vắng" });
        }
    },

    createTamVang: async (req, res) => {
        try {
            const { hoTenTamVang, maHK, thoiGianTamVang, lyDo } = req.body;

            // Kiểm tra các trường bắt buộc theo Form Đăng ký Tạm Vắng
            if (!hoTenTamVang || !maHK || !thoiGianTamVang?.tu || !thoiGianTamVang?.den) {
                return res.status(400).json({
                    message: "Thiếu thông tin bắt buộc (Họ tên, Mã HK, Thời gian tạm vắng)"
                });
            }

            // Gọi Model xử lý: Xác thực nhân khẩu -> Cập nhật trạng thái 'Tạm vắng' -> Lưu phiếu -> Ghi biến động
            const result = await TamVangTamTruModel.addTamVang(req.body);

            res.status(201).json({
                message: "Khai báo tạm vắng thành công",
                data: result
            });
        } catch (error) {
            console.error("Lỗi đăng ký tạm vắng:", error);
            res.status(500).json({ message: error.message || "Lỗi hệ thống khi xử lý tạm vắng" });
        }
    },

    handleTroVe: async (req, res) => {
        const { id } = req.params; // ID của bản ghi tạm vắng
        const { trangThai } = req.body; // Payload: { "trangThai": "Đã về" }

        try {
            // Kiểm tra giá trị trạng thái đúng như yêu cầu
            if (trangThai !== "Đã về") {
                return res.status(400).json({ message: "Trạng thái báo cáo không chính xác (phải là 'Đã về')." });
            }

            const result = await TamVangTamTruModel.reportPresence(id);

            res.status(200).json({
                success: true,
                message: "Xác nhận công dân đã trở về địa phương thành công."
            });
        } catch (error) {
            console.error("Lỗi Controller handleTroVe:", error);
            res.status(500).json({ message: error.message || "Lỗi khi cập nhật trạng thái trở về." });
        }
    },

};

module.exports = tamVangTamTruController;