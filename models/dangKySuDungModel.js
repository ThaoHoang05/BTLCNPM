const { poolQuanLiNhaVanHoa } = require('../config/db');

const dangKySuDungModel = {
    guiDangKy: (d) => {
        return poolQuanLiNhaVanHoa.query(`
            INSERT INTO DangKySuDung
            (HoTenNguoiDangKy, DienThoai, Email, LoaiHinhThue, LyDo, ThoiGianBatDau, ThoiGianKetThuc)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            d.hoten,   // $1
            d.phone,   // $2
            d.email,   // $3
            d.loai,    // $4
            d.lydo,    // $5
            d.batdau,  // $6
            d.ketthuc  // $7
        ]);
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