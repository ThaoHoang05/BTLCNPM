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

};

module.exports = nhaVanHoaController;