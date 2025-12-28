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
                    phongid,
                    lydo, 
                    thoigianbatdau, 
                    thoigianketthuc,
                    trangthai
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Chờ duyệt')
            `;
        
            const values = [
                d.hoten,
                d.cccd,
                d.phone,
                d.email,
                d.loai,
                d.tenSuKien,
                d.phongId,
                d.lydo,
                d.batdau,
                d.ketthuc
            ];

        return poolQuanLiNhaVanHoa.query(query, values);
    },

    // 1. Lấy danh sách đơn chờ duyệt
    getPendingList: async (from, to) => {
        try {
            let query = `
                SELECT 
                    dangkyid as "id",
                    hotennguoidangky as "hoTen",
                    tensukien as "tenHD",
                    thoigianbatdau as "tu",
                    thoigianketthuc as "den",
                    loaihinhthue as "loaiHinh",
                    trangthai as "trangThai"
                FROM dangkysudung
                WHERE trangthai = 'Chờ duyệt'
            `;
            const params = [];

            // lọc ngày
            if (from && to) {
                query += ` AND DATE(thoigianbatdau) >= $1 AND DATE(thoigianbatdau) <= $2`;
                params.push(from, to);
            }

            query += ` ORDER BY thoigianbatdau ASC`; // Sắp xếp theo ngày tăng dần cho dễ nhìn
            const { rows } = await poolQuanLiNhaVanHoa.query(query, params);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getPendingList:", error);
            throw error;
        }
    },

    // 2. Lấy ds đơn đã duyệt
    getHistoryList: async (from, to) => {
        try {
            let query = `
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
            `;
            const params = [];
        // lọc ngày
        if (from && to) {
            query += ` AND DATE(thoigianbatdau) >= $1 AND DATE(thoigianbatdau) <= $2`;
            params.push(from, to);
        }
        query += ` ORDER BY thoigianbatdau DESC`;
            const { rows } = await poolQuanLiNhaVanHoa.query(query, params);
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
                    dk.cccd AS "cccd",
                    dk.dienthoai AS "sdt",
                    dk.email AS "email",
                    dk.loaihinhthue AS "loaiHinh",
                    
                    -- Lấy tên phòng mong muốn từ bảng phong (dựa trên phongid người dân chọn)
                    p_req.tenphong AS "diaDiemMongMuon", 
                    
                    dk.tensukien AS "tenHD",
                    dk.lydo AS "lyDo",
                    dk.thoigianbatdau AS "tu",
                    dk.thoigianketthuc AS "den",
                    dk.phisudung AS "phi",
                    dk.trangthai AS "trangThai",
                    
                    -- Lấy tên phòng thực tế được duyệt (nếu có trong lịch sử sử dụng)
                    p_alloc.tenphong AS "phongDuocDuyet"
                    
                FROM dangkysudung dk
                -- Join lần 1: Lấy tên phòng NGƯỜI DÂN chọn lúc đăng ký
                LEFT JOIN phong p_req ON dk.phongid = p_req.phongid
                
                -- Join lần 2: Lấy tên phòng CÁN BỘ duyệt (nếu đã duyệt và xếp lịch)
                LEFT JOIN lichsudungphong l ON dk.dangkyid = l.dangkyid
                LEFT JOIN phong p_alloc ON l.phongid = p_alloc.phongid
                
                WHERE dk.dangkyid = $1
            `;
            const { rows } = await poolQuanLiNhaVanHoa.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model getHistoryDetail:", error);
            throw error;
        }
    },
    // File: dangKySuDungModel.js
    getRequestsByCCCD: async (cccd) => {
        try {
            const query = `
                SELECT 
                    dk.tensukien AS "TenHD",
                    COALESCE(p.tenphong, 'Chưa chọn phòng') AS "Diadiem",
                    
                    -- QUAN TRỌNG: Giữ nguyên tên cột, KHÔNG dùng AS "tu" để tránh nhầm lẫn
                    dk.thoigianbatdau, 
                    dk.thoigianketthuc,
                    
                    dk.trangthai AS "TrangThai",
                    dk.phisudung
                FROM dangkysudung dk
                LEFT JOIN phong p ON dk.phongid = p.phongid
                WHERE dk.cccd = $1
                ORDER BY dk.dangkyid DESC
            `;
            const { rows } = await poolQuanLiNhaVanHoa.query(query, [cccd]);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getRequestsByCCCD:", error);
            throw error;
        }
    },

    // Duyệt đơn (Approve)
    approve: async (id, data) => {
        const client = await poolQuanLiNhaVanHoa.connect();
        try {
            await client.query('BEGIN');

            // Lấy thời gian của đơn đăng ký đang xét duyệt
            const timeQuery = `SELECT thoigianbatdau, thoigianketthuc FROM dangkysudung WHERE dangkyid = $1`;
            const timeResult = await client.query(timeQuery, [id]);
            
            if (timeResult.rows.length === 0) {
                throw new Error("Không tìm thấy đơn đăng ký.");
            }
            
            const { thoigianbatdau, thoigianketthuc } = timeResult.rows[0];

            // Kiểm tra trùng lịch trong bảng lichsudungphong
            const conflictQuery = `
                SELECT lichid 
                FROM lichsudungphong 
                WHERE phongid = $1 
                AND (thoigianbatdau < $2 AND thoigianketthuc > $3)
            `;

            const conflictCheck = await client.query(conflictQuery, [
                data.phong, 
                thoigianketthuc, 
                thoigianbatdau
            ]);

            if (conflictCheck.rows.length > 0) {
                // Nếu tìm thấy dòng nào trùng -> Hủy bỏ
                throw new Error("Phòng này đã có lịch đặt trong khoảng thời gian trên!");
            }

            // Nếu không trùng, tiến hành Update trạng thái
            const updateQuery = `
                UPDATE dangkysudung 
                SET 
                    phisudung = $1, 
                    trangthai = 'Đã duyệt', 
                    canbopheduyet = $2, 
                    phongid = $3
                WHERE dangkyid = $4
            `;
            await client.query(updateQuery, [data.phi, data.canbo, data.phong, id]);

            await client.query('COMMIT');
            return { message: "Duyệt thành công" };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Từ chối đơn (Reject)
    reject: async (id, lyDo) => {
        try {
            const query = `
                UPDATE dangkysudung 
                SET trangthai = 'Từ chối', lydo = $1
                WHERE dangkyid = $2
            `;
            await poolQuanLiNhaVanHoa.query(query, [lyDo, id]);
            return { message: "Đã từ chối đơn" };
        } catch (error) {
            console.error("Lỗi Model reject:", error);
            throw error;
        }
    },

};

module.exports = dangKySuDungModel;