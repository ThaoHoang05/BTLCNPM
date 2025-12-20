const { poolQuanLiHoKhau } = require('../config/db');

const HoKhauModel = {
    //Truy vấn tổng hợp số liệu cho Dashboard
    getDashboardStats: async () => {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM hokhau) AS "totalHouseholds",
                (SELECT COUNT(*) FROM nhankhau) AS "totalResidents",
                -- Gom nhóm 'Mới sinh' và 'Tạm trú' (nếu có trong bảng tamtru)
                (SELECT COUNT(*) FROM nhankhau WHERE trangthai = 'Mới sinh') 
                    + (SELECT COUNT(*) FROM tamtru) AS "totalBirths",
                -- Gom nhóm 'Tạm vắng' và 'Qua đời'
                (SELECT COUNT(*) FROM nhankhau WHERE trangthai IN ('Tạm vắng', 'Qua đời')) AS "totalDeaths"
        `;
        try {
            const { rows } = await poolQuanLiHoKhau.query(query);
            return rows[0]; // Trả về object chứa 4 con số
        } catch (error) {
            console.error("Lỗi truy vấn SQL tại HoKhauModel:", error);
            throw error;
        }
    },
    
};

module.exports = HoKhauModel;