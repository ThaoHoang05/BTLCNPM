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

        // 1. BIẾN ĐỘNG
        if (type === 'bien_dong') {
            query = `
                SELECT
                    n.hoten as ho_ten,
                    TO_CHAR(n.ngaysinh, 'DD/MM/YYYY') as ngay_sinh, -- Format ngày sinh đẹp hơn
                    b.loaibiendong as loai_bien_dong,
                    TO_CHAR(b.ngaybiendong, 'DD/MM/YYYY') as ngay_bien_dong,
                    b.ghichu as noi_dung
                FROM biendongnhankhau b
                JOIN nhankhau n ON b.nhankhau_id = n.id
                WHERE TO_CHAR(b.ngaybiendong, 'MM/YYYY') = $1
                ORDER BY b.ngaybiendong DESC
                LIMIT $2 OFFSET $3`;

            countQuery = `SELECT COUNT(*) as total FROM biendongnhankhau WHERE TO_CHAR(ngaybiendong, 'MM/YYYY') = $1`;
            params = [time, limit, offset];
        }
        // 2. CƯ TRÚ
        else if (type === 'cu_tru') {
            query = `
                SELECT
                    n.hoten as ho_ten,
                    n.cccd as cccd,
                    'Tạm trú' as loai_hinh,
                    TO_CHAR(t.tungay, 'DD/MM/YYYY') as tu_ngay,
                    TO_CHAR(t.denngay, 'DD/MM/YYYY') as den_ngay,
                    t.lydo as ly_do
                FROM tamtru t
                JOIN nhankhau n ON t.nhankhau_id = n.id
                WHERE TO_CHAR(t.tungay, 'MM/YYYY') = $1
                UNION ALL
                SELECT
                    n.hoten as ho_ten,
                    n.cccd as cccd,
                    'Tạm vắng' as loai_hinh,
                    TO_CHAR(v.tungay, 'DD/MM/YYYY') as tu_ngay,
                    TO_CHAR(v.denngay, 'DD/MM/YYYY') as den_ngay,
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
        // 3. [SỬA LỖI TẠI ĐÂY] Các trường hợp khác (Giới tính, Độ tuổi...)
        else {
            // Thay vì gọi diachi_hientai (không tồn tại), ta JOIN bảng hokhau để ghép địa chỉ
            query = `
                SELECT 
                    n.hoten as ho_ten, 
                    TO_CHAR(n.ngaysinh, 'DD/MM/YYYY') as ngay_sinh, 
                    n.gioitinh as gioi_tinh, 
                    -- Ghép địa chỉ từ bảng hộ khẩu (Nếu không có hộ khẩu thì lấy nguyên quán)
                    COALESCE(
                        CONCAT(h.sonha, ' ', h.duong, ', ', h.phuong, ', ', h.quan, ', ', h.tinh),
                        n.nguyenquan
                    ) as dia_chi
                FROM nhankhau n
                LEFT JOIN hokhau h ON n.sohokhau = h.sohokhau
                ORDER BY n.id ASC 
                LIMIT $1 OFFSET $2`;
            
            countQuery = `SELECT COUNT(*) as total FROM nhankhau`;
            params = [limit, offset];
        }

        try {
            if (!query) return { total_rows: 0, list: [] };

            const { rows } = await poolQuanLiHoKhau.query(query, params);
            
            // Xử lý đếm số lượng
            let countParams = [time];
            if (type !== 'bien_dong' && type !== 'cu_tru') {
                countParams = [];
            }
            const countRes = await poolQuanLiHoKhau.query(countQuery, countParams);

            let totalRows = 0;
            if (countRes.rows && countRes.rows.length > 0) {
                totalRows = parseInt(countRes.rows[0].total || countRes.rows[0].count || 0);
            }

            return {
                total_rows: totalRows,
                list: rows
            };
        } catch (error) {
            console.error("Lỗi Model getDetails:", error.message);
            throw error;
        }
    },
};

module.exports = ThongKeModel;