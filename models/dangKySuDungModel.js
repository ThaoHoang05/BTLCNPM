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
                    phongid,        -- Đổi từ diadiem thành phongid
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
                d.phongId,      // Truyền ID phòng (số nguyên)
                d.lydo,
                d.batdau,
                d.ketthuc
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

    // Duyệt đơn (Approve)
    approve: async (id, data) => {
        const client = await poolQuanLiNhaVanHoa.connect();
        try {
            await client.query('BEGIN');
            const query = `
                UPDATE dangkysudung 
                SET 
                    phisudung = $1, 
                    trangthai = 'Đã duyệt', 
                    canbopheduyet = $2, 
                    phongid = $3
                WHERE dangkyid = $4
            `;
            await client.query(query, [data.phi, data.canbo, data.phong, id]);
            const insertLich = `
                INSERT INTO lichsudungphong (phongid, dangkyid, thoigianbatdau, thoigianketthuc, loaihoatdong)
                SELECT $1, dangkyid, thoigianbatdau, thoigianketthuc, 'Rieng'
                FROM dangkysudung WHERE dangkyid = $2
            `;
            await client.query(insertLich, [data.phong, id]);
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