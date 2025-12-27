const { poolThongKeBaoCao, poolQuanLiHoKhau } = require('../config/db');

const ThongKeModel = {
    getSummary: async (type, period, time) => {
        // Ánh xạ type từ API sang tên bảng thực tế bạn đã tạo trong SQL
        const tableMap = {
            'gioi_tinh': 'thong_ke_gioi_tinh',
            'do_tuoi': 'thong_ke_do_tuoi',
            'cu_tru': 'thong_ke_cu_tru',
            'bien_dong': 'thong_ke_bien_dong'
        };

        const tableName = tableMap[type];
        if (!tableName) throw new Error("Loại thống kê (type) không hợp lệ.");

        // Query lấy bản ghi mới nhất theo thời gian chốt
        const query = `
            SELECT * FROM ${tableName}
            WHERE loai_thoi_gian = $1 AND gia_tri_thoi_gian = $2
            ORDER BY ngay_cap_nhat DESC
                LIMIT 1`;

        try {
            const { rows } = await poolThongKeBaoCao.query(query, [period, time]);
            return rows[0];
        } catch (error) {
            console.error(`Lỗi Model ThongKe tại bảng ${tableName}:`, error.message);
            throw error;
        }
    },

    getDetails: async (type, period, time, page, limit) => {
        const offset = (page - 1) * limit;
        let query = "";
        let countQuery = "";
        let params = [];

        // Lưu ý: time truyền vào từ API là "MM/YYYY" (Ví dụ: 05/2025)
        if (type === 'bien_dong') {
            query = `
                SELECT
                    n.hoten as ho_ten,
                    n.ngaysinh as ngay_sinh,
                    b.loaibiendong as loai_bien_dong,
                    b.ngaybiendong as ngay_bien_dong,
                    b.ghichu as noi_dung
                FROM biendongnhankhau b
                         JOIN nhankhau n ON b.nhankhau_id = n.id
                WHERE TO_CHAR(b.ngaybiendong, 'MM/YYYY') = $1
                ORDER BY b.ngaybiendong DESC
                    LIMIT $2 OFFSET $3`;

            countQuery = `SELECT COUNT(*) FROM biendongnhankhau WHERE TO_CHAR(ngaybiendong, 'MM/YYYY') = $1`;
            params = [time, limit, offset];
        }
        else if (type === 'cu_tru') {
            query = `
                SELECT
                    n.hoten as ho_ten,
                    n.cccd as cccd,
                    'Tạm trú' as loai_hinh,
                    t.tungay as tu_ngay,
                    t.denngay as den_ngay,
                    t.lydo as ly_do
                FROM tamtru t
                         JOIN nhankhau n ON t.nhankhau_id = n.id
                WHERE TO_CHAR(t.tungay, 'MM/YYYY') = $1
                UNION ALL
                SELECT
                    n.hoten as ho_ten,
                    n.cccd as cccd,
                    'Tạm vắng' as loai_hinh,
                    v.tungay as tu_ngay,
                    v.denngay as den_ngay,
                    v.lydo as ly_do
                FROM tamvang v
                         JOIN nhankhau n ON v.nhankhau_id = n.id
                WHERE TO_CHAR(v.tungay, 'MM/YYYY') = $1
                ORDER BY tu_ngay DESC
                    LIMIT $2 OFFSET $3`;

            countQuery = `
                SELECT (
                           (SELECT COUNT(*) FROM tamtru WHERE TO_CHAR(tungay, 'MM/YYYY') = $1) +
                           (SELECT COUNT(*) FROM tamvang WHERE TO_CHAR(tungay, 'MM/YYYY') = $1)
                           ) as total`;
            params = [time, limit, offset];
        }

        try {
            const { rows } = await poolQuanLiHoKhau.query(query, params);
            const countRes = await poolQuanLiHoKhau.query(countQuery, [time]);

            return {
                total_rows: parseInt(countRes.rows[0].total || countRes.rows[0].count || 0),
                list: rows
            };
        } catch (error) {
            throw error;
        }
    },
};

module.exports = ThongKeModel;