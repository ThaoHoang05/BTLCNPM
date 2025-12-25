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

    // 2. Lấy ds đơn đã duyệt (Đã duyệt hoặc Từ chối)
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
                WHERE trangthai IN ('Đã duyệt', 'Từ chối')
                ORDER BY id DESC
            `;
            const { rows } = await poolQuanLiNhaVanHoa.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getHistoryList:", error);
            throw error;
        }
    },

};

module.exports = dangKySuDungModel;