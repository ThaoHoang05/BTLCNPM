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


// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM VẮNG)
// ==============================================

};

module.exports = tamVangTamTruController;