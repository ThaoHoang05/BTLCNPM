const { poolQuanLiHoKhau } = require('../config/db');

const NhanKhauModel = {
    getNhanKhauList: async () => {
        try {
            const query = `
                SELECT 
                    nk.id AS "ID",
                    nk.hoten AS "hoTen",
                    nk.ngaysinh AS "ngaySinh",
                    nk.cccd AS "cccd",
                    nk.trangthai AS "trangThai",
                    CASE 
                        WHEN nk.trangthai = 'Tạm trú' THEN tt.diaphuong 
                        ELSE CONCAT(hk.sonha, ' ', hk.duong, ', ', hk.phuong, ', ', hk.quan, ', ', hk.tinh)
                    END AS "diaChi"
                FROM nhankhau nk
                LEFT JOIN hokhau hk ON nk.sohokhau = hk.sohokhau
                LEFT JOIN tamtru tt ON nk.id = tt.nhankhau_id AND tt.denngay >= CURRENT_DATE
                ORDER BY nk.id ASC
            `;
            
            const { rows } = await poolQuanLiHoKhau.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getNhanKhauList:", error);
            throw error;
        }
    },
    
};

module.exports = NhanKhauModel;