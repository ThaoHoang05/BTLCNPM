const { poolQuanLiNhaVanHoa } = require('../config/db');

const dangKySuDungModel = {
    guiDangKy: (d) => {
        // Câu lệnh SQL Insert cập nhật đầy đủ cột
        const query = `
            INSERT INTO dangkysudung (
                hotennguoidangky, 
                cccd, 
                dienthoai, 
                email, 
                loaihinhthue, 
                tensukien, 
                diadiem, 
                lydo, 
                thoigianbatdau, 
                thoigianketthuc,
                trangthai
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Chờ duyệt')
        `;
        
        const values = [
            d.hoten,        // $1
            d.cccd,         // $2
            d.phone,        // $3
            d.email,        // $4
            d.loai,         // $5 (personal/organization)
            d.tenSuKien,    // $6
            d.diaDiem,      // $7 (main-hall, meeting-room-1...)
            d.lydo,         // $8
            d.batdau,       // $9
            d.ketthuc       // $10
        ];

        return poolQuanLiNhaVanHoa.query(query, values);
    },

    // 1. Lấy danh sách đơn chờ duyệt
    getPendingList: async () => {
        try {
            const query = `
                SELECT 
                    dangkyid as "id",
                    hotennguoidangky as "hoTen",
                    tensukien as "tenHD",
                    thoigianbatdau as "tu",
                    thoigianketthuc as "den",
                    loaihinhthue as "loaiHinh"
                FROM dangkysudung
                WHERE trangthai = 'Chờ duyệt'
                ORDER BY id ASC
            `;
            const { rows } = await poolQuanLiNhaVanHoa.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getPendingList:", error);
            throw error;
        }
    },

    // 2. Lấy ds đơn đã duyệt
    getHistoryList: async () => {
        try {
            const query = `
                SELECT 
                    dangkyid as "id",
                    hotennguoidangky as "hoTen",
                    tensukien as "tenHD",
                    thoigianbatdau as "tu",
                    thoigianketthuc as "den",
                    loaihinhthue as "loaiHinh",
                    trangthai as "trangThai" 
                FROM dangkysudung
                WHERE trangthai = 'Đã duyệt'
                ORDER BY id DESC
            `;
            const { rows } = await poolQuanLiNhaVanHoa.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getHistoryList:", error);
            throw error;
        }
    },

    // Lấy chi tiết lịch sử đơn (kèm tên phòng nếu đã duyệt)
    getHistoryDetail: async (id) => {
        try {
            const query = `
                SELECT 
                    dk.hotennguoidangky AS "hoTen",
                    dk.dienthoai AS "sdt",
                    dk.email AS "email",
                    dk.loaihinhthue AS "loaiHinh",
                    dk.thoigianbatdau AS "tu",
                    dk.thoigianketthuc AS "den",
                    dk.phisudung AS "phi",
                    dk.tensukien AS "tenHD",
                    p.tenphong AS "phong"
                FROM dangkysudung dk
                LEFT JOIN lichsudungphong l ON dk.dangkyid = l.dangkyid
                LEFT JOIN phong p ON l.phongid = p.phongid
                WHERE dk.dangkyid = $1
            `;
            const { rows } = await poolQuanLiNhaVanHoa.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model getHistoryDetail:", error);
            throw error;
        }
    },

};

module.exports = dangKySuDungModel;