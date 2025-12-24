const { poolQuanLiHoKhau } = require('../config/db');

const TamVangTamTruModel = {
// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM TRÚ)
// ==============================================

    // Lấy danh sách tạm trú
    getTamTruList: async () => {
        try {
            const query = `
                SELECT 
                    nk.hoten AS "HoTen",
                    nk.cccd AS "CCCD",
                    CONCAT(hk.sonha, ' ', hk.duong, ', ', hk.phuong, ', ', hk.quan, ', ', hk.tinh) AS "DiaChi",
                    tt.tungay AS "Tu",
                    tt.denngay AS "Den",
                    tt.trangthai AS "TrangThai",
                    tt.tamtruid AS "ID"
                FROM tamtru tt
                JOIN nhankhau nk ON tt.nhankhau_id = nk.id
                LEFT JOIN nhankhau host ON tt.chuho_id = host.id
                LEFT JOIN hokhau hk ON host.sohokhau = hk.sohokhau
                ORDER BY tt.denngay DESC;
            `;
            const { rows } = await poolQuanLiHoKhau.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getTamTruList:", error);
            throw error;
        }
    },



// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM VẮNG)
// ==============================================


};

module.exports = TamVangTamTruModel;