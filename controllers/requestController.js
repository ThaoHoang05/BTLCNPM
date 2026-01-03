const RequestModel = require('../models/requestModel');

const requestController = {
    
    // 1. POST /resident/hokhau/:id (Sửa thông tin hộ khẩu)
    requestEditHoKhau: async (req, res) => {
        try {
            const { id } = req.params; // Mã Hộ Khẩu (VD: HK001)
            const { status, data } = req.body;
            
            // Lấy CCCD người gửi từ token hoặc session (Giả sử middleware đã gắn vào req.user)
            // Nếu không có middleware, bạn có thể gửi kèm trong body hoặc lấy tạm từ data nếu logic cho phép
            const senderCCCD = req.body.senderCCCD || 'UNKNOWN'; 

            await RequestModel.create({
                nguoiYeuCau: senderCCCD,
                doiTuongId: id,
                loaiYeuCau: 'Sửa Hộ Khẩu',
                thongTin: data, // { thongtin, GTcu, GTmoi, ghiChu }
                status: status || 'Chờ duyệt'
            });

            res.status(200).json({ message: "Gửi yêu cầu sửa Hộ khẩu thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server: " + error.message });
        }
    },

    // 2. POST /resident/nhankhau/:id (Sửa thông tin nhân khẩu)
    requestEditNhanKhau: async (req, res) => {
        try {
            const { id } = req.params; // CCCD nhân khẩu cần sửa
            const { status, data } = req.body;
            const senderCCCD = req.body.senderCCCD || 'UNKNOWN';

            await RequestModel.create({
                nguoiYeuCau: senderCCCD,
                doiTuongId: id,
                loaiYeuCau: 'Sửa Nhân Khẩu',
                thongTin: data, // { thongtin, GTcu, GTmoi, ghiChu }
                status: status || 'Chờ duyệt'
            });

            res.status(200).json({ message: "Gửi yêu cầu sửa Nhân khẩu thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server: " + error.message });
        }
    },

    // 3. POST /resident/tamtru/:id (Đăng ký tạm trú)
    requestTamTru: async (req, res) => {
        try {
            const { id } = req.params; // ID người dùng gửi yêu cầu (CCCD)
            
            // Dữ liệu form tạm trú gửi lên (mahokhau, cccd_tamtru, tungay, denngay...)
            const formData = req.body; 

            await RequestModel.create({
                nguoiYeuCau: id,
                doiTuongId: formData.cccd, // CCCD người cần tạm trú
                loaiYeuCau: 'Đăng ký Tạm Trú',
                thongTin: formData,
                status: 'Chờ duyệt'
            });

            res.status(200).json({ message: "Gửi yêu cầu Tạm trú thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server: " + error.message });
        }
    },

    // 4. POST /resident/tamvang/:id (Khai báo tạm vắng)
    requestTamVang: async (req, res) => {
        try {
            const { id } = req.params; // ID người dùng gửi (CCCD)
            const formData = req.body;

            await RequestModel.create({
                nguoiYeuCau: id,
                doiTuongId: formData.cccd, // Người tạm vắng
                loaiYeuCau: 'Khai báo Tạm Vắng',
                thongTin: formData,
                status: 'Chờ duyệt'
            });

            res.status(200).json({ message: "Gửi yêu cầu Tạm vắng thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server: " + error.message });
        }
    },

    // API lấy lịch sử (GET /requests/history/:cccd)
    getHistory: async (req, res) => {
        try {
            const { cccd } = req.params;
            const data = await RequestModel.getHistoryByCCCD(cccd);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: "Lỗi tải lịch sử" });
        }
    }
};

module.exports = requestController;