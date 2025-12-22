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
    
    // Truy vấn chi tiết hộ khẩu theo số hộ khẩu
    getDetail: async (sohokhau) => {
        try {
            // 1. Lấy thông tin chung của hộ và tên chủ hộ
            const infoQuery = `
                SELECT hk.sohokhau, nk.hoten as "HoTen", 
                       hk.sonha || ', ' || hk.duong || ', ' || hk.phuong || ', ' || hk.quan || ', ' || hk.tinh as "DiaChi",
                       hk.ngaylap as "NgayLap",
                       hk.ghichu as "GhiChu"
                FROM hokhau hk
                LEFT JOIN nhankhau nk ON hk.chuhocccd = nk.cccd
                WHERE hk.sohokhau = $1`;
            
            // 2. Lấy danh sách nhân khẩu trong hộ
            const membersQuery = `
                SELECT hoten as "HoTenTV", 
                   ngaysinh as "NgaySinh", 
                   quanhevoichuho as "QuanHeChuHo",
                   cccd as "CCCD",
                   trangthai as "TrangThai"
                FROM nhankhau 
                WHERE sohokhau = $1`;

            // 3. Lấy lịch sử biến động
            const historyQuery = `
                        SELECT ngaythaydoi as "NgayBienDoi", 
                            noidungthaydoi as "NoiDung", 
                            'Cả hộ' as "TenNguoiThayDoi"
                        FROM biendonghokhau 
                        WHERE sohokhau = $1

                        UNION ALL

                        SELECT bd.ngaybiendong as "NgayBienDoi", 
                            bd.loaibiendong as "NoiDung", 
                            nk.hoten as "TenNguoiThayDoi"
                        FROM biendongnhankhau bd
                        JOIN nhankhau nk ON bd.cccd = nk.cccd
                        WHERE nk.sohokhau = $1

                        ORDER BY "NgayBienDoi" DESC`; // Sắp xếp cái mới nhất lên đầu

            const info = await poolQuanLiHoKhau.query(infoQuery, [sohokhau]);
            const members = await poolQuanLiHoKhau.query(membersQuery, [sohokhau]);
            const history = await poolQuanLiHoKhau.query(historyQuery, [sohokhau]);

            if (info.rows.length === 0) return null;

            return {
                HoTen: info.rows[0].HoTen,
                DiaChi: info.rows[0].DiaChi,
                NgayLap: info.rows[0].NgayLap,
                danhSachNhanKhau: members.rows,
                lichSuBienDong: history.rows
            };
        } catch (error) {
            console.error("Lỗi Model getDetail:", error);
            throw error;
        }
    },


};

module.exports = HoKhauModel;