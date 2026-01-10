const RequestModel = require('../models/requestModel');

const hoKhauModel = require('../models/hoKhauModel');

const requestController = {
    
    // 1. POST /resident/hokhau/:id (Sửa thông tin hộ khẩu)
    // requestController.js

requestEditHoKhau: async (req, res) => {
    try {
        const { id } = req.params; 
        
        // --- SỬA ĐOẠN NÀY ---
        // Lấy luôn cả 3 trường từ req.body
        const { status, data, senderCCCD } = req.body; 

        // Xử lý giá trị mặc định cho senderCCCD nếu frontend quên gửi (phòng hờ)
        const finalSender = senderCCCD || 'UNKNOWN';

        await RequestModel.create({
            nguoiYeuCau: finalSender, // Dùng biến đã lấy ở trên
            doiTuongId: id,
            loaiYeuCau: 'Sửa Hộ Khẩu',
            thongTin: data, 
            status: status || 'Chờ duyệt'
        });

        res.status(200).json({ message: "Gửi yêu cầu sửa Hộ khẩu thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
},

    // 2. POST /resident/nhankhau/:id (Sửa thông tin nhân khẩu)
    // File: requestController.js

requestEditNhanKhau: async (req, res) => {
    try {
        const { id } = req.params; // CCCD nhân khẩu cần sửa
        
        // [SỬA ĐOẠN NÀY] Lấy cả 3 biến giống hệt logic HoKhau
        const { status, data, senderCCCD } = req.body;
        
        const finalSender = senderCCCD || 'UNKNOWN';

        await RequestModel.create({
            nguoiYeuCau: finalSender,
            doiTuongId: id,
            loaiYeuCau: 'Sửa Nhân Khẩu',
            thongTin: data, 
            status: status || 'Chờ duyệt' // Nhận status từ frontend
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
    },
    // API lấy chi tiết hộ khẩu với id hộ khẩu
    getAllResidentwithHKID: async (req, res) => {
        try {
            const cccd = req.query.cccd; // Lấy từ query parameter
            const HKID = await RequestModel.getHoKhauId(cccd);
            const household = await hoKhauModel.getDetail(HKID);
            res.status(200).json(household);
        } catch (error) {
            res.status(500).json({ message: "Lỗi tải danh sách nhân khẩu với mã hộ khẩu" });
        }
    },
    // Lấy toàn bộ danh sách cho Admin
    getAllAdminRequests: async (req, res) => {
        try {
            const data = await RequestModel.getAllForAdmin();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // Xử lý Duyệt/Từ chối
    processRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, note } = req.body;
            const updated = await RequestModel.updateStatus(id, status, note);
            
            res.status(200).json({ 
                status: 'success', 
                message: `Đã cập nhật trạng thái: ${status}`,
                data: updated 
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },
    getRequestStats: async (req, res) => {
        try {
            const stats = await RequestModel.getStats();
            res.status(200).json({ status: 'success', data: stats });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

module.exports = requestController;