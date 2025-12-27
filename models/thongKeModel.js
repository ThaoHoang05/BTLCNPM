const { poolThongKeBaoCao, poolQuanLiHoKhau } = require('../config/db');

const ThongKeModel = {
    getSummary: async (type, period, time) => {
        if (type === 'cu_tru') {
            // 1. Xác định khoảng thời gian (Start - End)
            let startDate = "";
            let endDate = "";
            if (period === 'Năm') {
                startDate = `${time}-01-01`;
                endDate = `${time}-12-31`;
            } else if (period === 'Tháng') {
                const [m, y] = time.split('/');
                const lastDay = new Date(y, m, 0).getDate();
                startDate = `${y}-${m}-01`;
                endDate = `${y}-${m}-${lastDay}`;
            } else if (period === 'Quý') {
                const [qStr, y] = time.split('/');
                const q = parseInt(qStr.replace('Q', ''));
                const startM = (q - 1) * 3 + 1;
                const endM = q * 3;
                const lastDay = new Date(y, endM, 0).getDate();
                startDate = `${y}-${String(startM).padStart(2,'0')}-01`;
                endDate = `${y}-${String(endM).padStart(2,'0')}-${lastDay}`;
            }

            // 2. Query đếm trực tiếp (Logic Overlap giống hệt getDetails)
            // Đếm Tạm trú/Tạm vắng có thời gian giao thoa với kỳ báo cáo
            const query = `
                SELECT 
                    (SELECT COUNT(*) FROM tamtru WHERE tungay <= $2 AND (denngay >= $1 OR denngay IS NULL))::int AS dang_tam_tru,
                    (SELECT COUNT(*) FROM tamvang WHERE tungay <= $2 AND (denngay >= $1 OR denngay IS NULL))::int AS dang_tam_vang,
                    (SELECT COUNT(*) FROM nhankhau WHERE trangthai = 'Thường trú')::int AS thuong_tru
            `;
            
            try {
                // $1 = StartDate, $2 = EndDate
                const { rows } = await poolQuanLiHoKhau.query(query, [startDate, endDate]);
                // Trả về object đúng format frontend cần
                return {
                    dang_tam_tru: rows[0].dang_tam_tru,
                    dang_tam_vang: rows[0].dang_tam_vang,
                    thuong_tru: rows[0].thuong_tru,
                    ngay_cap_nhat: new Date() // Fake ngày cập nhật vì đây là realtime
                };
            } catch (error) { throw error; }
        }

        // --- CÁC CASE KHÁC (GIỚI TÍNH, ĐỘ TUỔI...) ---
        // Vẫn lấy từ bảng thống kê lưu trữ (Snapshot)
        const tableMap = {
            'gioi_tinh': 'thong_ke_gioi_tinh',
            'do_tuoi': 'thong_ke_do_tuoi',
            'bien_dong': 'thong_ke_bien_dong'
        };

        const tableName = tableMap[type];
        if (!tableName) throw new Error("Loại thống kê không hợp lệ.");

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
        let queryParams = [];
        let countParams = [];

        try {
            // =========================================================
            // CASE 1: CƯ TRÚ (Tạm trú / Tạm vắng) - LOGIC MỚI (OVERLAP)
            // =========================================================
            if (type === 'cu_tru') {
                // 1. Tính toán ngày bắt đầu và kết thúc của kỳ báo cáo
                let startDate = "";
                let endDate = "";
                
                if (period === 'Năm') {
                    // time = "2025"
                    startDate = `${time}-01-01`;
                    endDate = `${time}-12-31`;
                } else if (period === 'Tháng') {
                    // time = "12/2025"
                    const [m, y] = time.split('/');
                    const lastDay = new Date(y, m, 0).getDate();
                    startDate = `${y}-${m}-01`;
                    endDate = `${y}-${m}-${lastDay}`;
                } else if (period === 'Quý') {
                    // time = "Q1/2025"
                    const [qStr, y] = time.split('/');
                    const q = parseInt(qStr.replace('Q', ''));
                    const startM = (q - 1) * 3 + 1;
                    const endM = q * 3;
                    const lastDay = new Date(y, endM, 0).getDate();
                    startDate = `${y}-${String(startM).padStart(2,'0')}-01`;
                    endDate = `${y}-${String(endM).padStart(2,'0')}-${lastDay}`;
                }

                // 2. Query lọc những hồ sơ CÓ HIỆU LỰC trong khoảng thời gian này
                // Điều kiện: (tungay <= endDate) AND (denngay >= startDate OR denngay IS NULL)
                const overlapCondition = `(tungay <= $1 AND (denngay >= $2 OR denngay IS NULL))`;

                query = `
                    SELECT
                        n.hoten as ho_ten,
                        'Tạm trú' as loai_hinh,
                        TO_CHAR(t.tungay, 'DD/MM/YYYY') as tu_ngay,
                        TO_CHAR(t.denngay, 'DD/MM/YYYY') as den_ngay
                    FROM tamtru t
                    JOIN nhankhau n ON t.nhankhau_id = n.id
                    WHERE ${overlapCondition}
                    
                    UNION ALL
                    
                    SELECT
                        n.hoten as ho_ten,
                        'Tạm vắng' as loai_hinh,
                        TO_CHAR(v.tungay, 'DD/MM/YYYY') as tu_ngay,
                        TO_CHAR(v.denngay, 'DD/MM/YYYY') as den_ngay
                    FROM tamvang v
                    JOIN nhankhau n ON v.nhankhau_id = n.id
                    WHERE ${overlapCondition}
                    
                    ORDER BY tu_ngay DESC
                    LIMIT $3 OFFSET $4`;

                countQuery = `
                    SELECT (
                       (SELECT COUNT(*) FROM tamtru WHERE ${overlapCondition}) +
                       (SELECT COUNT(*) FROM tamvang WHERE ${overlapCondition})
                    ) as total`;

                // Params cho case này khác biệt (dùng startDate, endDate)
                queryParams = [endDate, startDate, limit, offset]; // $1=End, $2=Start
                countParams = [endDate, startDate];
            }
            
            // =========================================================
            // CASE 2: BIẾN ĐỘNG (Vẫn giữ logic theo thời điểm xảy ra)
            // =========================================================
            else if (type === 'bien_dong') {
                const buildTimeCondition = (col) => {
                    if (period === 'Tháng') return `TO_CHAR(${col}, 'MM/YYYY') = $1`;
                    if (period === 'Năm') return `TO_CHAR(${col}, 'YYYY') = $1`;
                    if (period === 'Quý') return `'Q' || TO_CHAR(${col}, 'Q/YYYY') = $1`;
                    return `TO_CHAR(${col}, 'YYYY') = $1`;
                };
                const timeCond = buildTimeCondition('b.ngaybiendong');

                query = `
                    SELECT
                        n.hoten as ho_ten,
                        b.loaibiendong as loai_bien_dong,
                        TO_CHAR(b.ngaybiendong, 'DD/MM/YYYY') as ngay_bien_dong,
                        b.ghichu as noi_dung
                    FROM biendongnhankhau b
                    JOIN nhankhau n ON b.nhankhau_id = n.id
                    WHERE ${timeCond}
                    ORDER BY b.ngaybiendong DESC
                    LIMIT $2 OFFSET $3`;

                countQuery = `SELECT COUNT(*) as total FROM biendongnhankhau b WHERE ${timeCond}`;
                
                queryParams = [time, limit, offset];
                countParams = [time];
            }
            
            // =========================================================
            // CASE 3: MẶC ĐỊNH (Giới tính, Độ tuổi...)
            // =========================================================
            else {
                query = `
                    SELECT 
                        n.hoten as ho_ten, 
                        TO_CHAR(n.ngaysinh, 'DD/MM/YYYY') as ngay_sinh, 
                        n.gioitinh as gioi_tinh, 
                        COALESCE(
                            CONCAT(h.sonha, ' ', h.duong, ', ', h.phuong, ', ', h.quan, ', ', h.tinh),
                            n.nguyenquan
                        ) as dia_chi
                    FROM nhankhau n
                    LEFT JOIN hokhau h ON n.sohokhau = h.sohokhau
                    ORDER BY n.id ASC 
                    LIMIT $1 OFFSET $2`;
                
                countQuery = `SELECT COUNT(*) as total FROM nhankhau`;
                
                queryParams = [limit, offset];
                countParams = [];
            }

            // --- THỰC THI ---
            if (!query) return { total_rows: 0, list: [] };

            const { rows } = await poolQuanLiHoKhau.query(query, queryParams);
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
    }
};

module.exports = ThongKeModel;