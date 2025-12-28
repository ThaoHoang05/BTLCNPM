const NhaVanHoaModel = require('../models/nhaVanHoaModel');

const nhaVanHoaController = {
// ==============================================
// QUẢN LÝ TÀI SẢN
// ==============================================

    getAssets: async (req, res) => {
        try {
            const assets = await NhaVanHoaModel.getAllAssets();

            return res.status(200).json({
                status: "success",
                data: assets
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Lỗi khi lấy danh sách tài sản"
            });
        }
    },

    updateAsset: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ message: "Không có dữ liệu cập nhật" });
            }

            const result = await NhaVanHoaModel.updateAsset(id, updateData);

            if (!result) {
                return res.status(404).json({ message: "Không tìm thấy tài sau có mã này" });
            }

            res.status(200).json({
                status: "success",
                message: "Đã cập nhật thông tin tài sản",
                data: result
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    },

    deleteAsset: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedAsset = await NhaVanHoaModel.deleteAsset(id);

            if (!deletedAsset) {
                return res.status(404).json({
                    status: "error",
                    message: "Không tìm thấy tài sản để xóa"
                });
            }

            res.status(200).json({
                status: "success",
                message: `Xóa thành công tài sản: ${deletedAsset.tentaisan}. Các bản ghi kiểm tra đã được lưu trữ dưới dạng lịch sử (ID ẩn).`,
                data: deletedAsset
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Lỗi khi xóa tài sản: " + error.message
            });
        }
    },

    addAsset: async (req, res) => {
        try {
            const { tenTS, SL, TinhTrang, viTri } = req.body;
            const phongId = await NhaVanHoaModel.getPhongIdByName(viTri);

            if (!phongId) return res.status(400).json({ message: "Tên phòng không tồn tại" });

            const newAsset = await NhaVanHoaModel.addAsset({ tenTS, SL, TinhTrang, phongId });
            res.status(201).json({ status: "success", data: newAsset });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

// ==============================================
// QUẢN LÝ LỊCH CHUNG
// ==============================================

    // API: GET /nvh/HDchung
    getUpcomingActivities: async (req, res) => {
        try {
            const data = await NhaVanHoaModel.getUpcomingActivities();

            // Format dữ liệu trả về theo payload yêu cầu
            const response = data.map(item => ({
                tenHD: item.tenHD,
                phong: item.phong,
                thoiGian: {
                    tu: item.tu,
                    den: item.den
                }
            }));

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ message: "Lỗi tải lịch hoạt động" });
        }
    },

    // API: POST /nvh/HDchung/new
    addCommonActivity: async (req, res) => {
        try {
            // Payload: { tenHD, phong, thoiGian: {tu, den}, ghiChu }
            const { tenHD, phong, thoiGian, ghiChu } = req.body;

            if (!tenHD || !phong || !thoiGian || !thoiGian.tu || !thoiGian.den) {
                return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
            }

            await NhaVanHoaModel.addCommonActivity({
                tenHD,
                phong: parseInt(phong), // Đảm bảo ID phòng là số
                tu: thoiGian.tu,
                den: thoiGian.den,
                ghiChu: ghiChu || ""
            });

            res.status(200).json({ message: "Thêm lịch hoạt động thành công" });
        } catch (error) {
            console.error(error);
            // Trả về lỗi cụ thể (ví dụ: trùng lịch) cho Frontend hiển thị
            res.status(400).json({ message: error.message || "Lỗi khi thêm lịch" });
        }
    },

    getRooms: async (req, res) => {
        try {
            const rooms = await NhaVanHoaModel.getAllRooms();
            res.status(200).json(rooms);
        } catch (error) {
            res.status(500).json({ message: "Lỗi tải danh sách phòng" });
        }
    },

    getReport: async (req, res) => {
        try {
            // Lấy tháng/năm từ URL (VD: ?month=12&year=2025)
            const { month, year } = req.query;

            // Validate dữ liệu đầu vào
            if (!month || !year) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "Vui lòng cung cấp tháng và năm (month, year)" 
                });
            }

            // Gọi Model lấy dữ liệu
            const data = await NhaVanHoaModel.getReportStats(month, year);

            // Trả về kết quả
            res.status(200).json({
                status: "success",
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                status: "error", 
                message: "Lỗi server khi lấy báo cáo thống kê" 
            });
        }
    },
    createInspection: async (req, res) => {
        try {
            // Lấy dữ liệu từ body (do Frontend gửi lên)
            const { id, sl, tinhTrang, ghiChu } = req.body;
            
            // Kiểm tra dữ liệu đầu vào
            if (!id || sl === undefined || !tinhTrang) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "Thiếu thông tin bắt buộc (Mã TS, Số lượng, Tình trạng)" 
                });
            }

            // Gọi Model để lưu
            await NhaVanHoaModel.addInspection({ 
                id, 
                sl: parseInt(sl), // Đảm bảo số lượng là số nguyên
                tinhTrang, 
                ghiChu: ghiChu || '' 
            });
            
            res.status(200).json({ 
                status: "success", 
                message: "Đã lưu kết quả kiểm kê thành công" 
            });

        } catch (error) {
            // Nếu lỗi do trùng lặp (đã bắt ở Model) thì trả về 400 để Frontend hiện thông báo
            const statusCode = error.message.includes("đã được kiểm kê") ? 400 : 500;
            
            res.status(statusCode).json({ 
                status: "error", 
                message: error.message 
            });
        }
    },
    getDashboardStats: async (req, res) => {
        try {
            const pendingCount = await NhaVanHoaModel.countPendingRequestsThisMonth();
            
            res.status(200).json({
                status: 'success',
                data: {
                    pendingRequests: pendingCount
                }
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Lỗi lấy thống kê dashboard NVH" });
        }
    },
};

module.exports = nhaVanHoaController;