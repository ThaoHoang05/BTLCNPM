const TamVangTamTruModel = require('../models/tamVangTamTruModel');

const tamVangTamTruController = {
// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM TRÚ)
// ==============================================

    getTamTruList: async (req, res) => {
        try {
            const data = await TamVangTamTruModel.getTamTruList();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống khi tải danh sách tạm trú" });
        }
    },


// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM VẮNG)
// ==============================================

};

module.exports = tamVangTamTruController;