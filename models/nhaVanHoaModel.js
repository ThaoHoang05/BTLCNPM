const { poolQuanLiNhaVanHoa } = require('../config/db');

const NhaVanHoaModel = {
// ==============================================
// QUẢN LÝ TÀI SẢN
// ==============================================

    // Lấy danh sách tài sản với vị trí là tên phòng
    getAllAssets: async () => {
        const query = `
            SELECT t.taisanid as "maTS", t.tentaisan as "tenTS", t.soluong as "SL",
                   t.tinhtrang as "tinhTrang", COALESCE(p.tenphong, 'Chưa xác định') as "viTri"
            FROM taisan t
                     LEFT JOIN phong p ON t.phongid = p.phongid
            ORDER BY t.taisanid ASC`;
        const { rows } = await poolQuanLiNhaVanHoa.query(query);
        return rows;
    },

    // Cập nhật chi tiết tài sản dựa trên ID
    updateAsset: async (id, updateData) => {
        const fields = Object.keys(updateData);
        if (fields.length === 0) return null;

        // Tạo chuỗi SQL động: "tentaisan" = $1, "soluong" = $2...
        const setClause = fields
            .map((field, index) => `"${field}" = $${index + 1}`)
            .join(', ');

        const values = Object.values(updateData);
        values.push(id); // Thêm ID vào cuối mảng giá trị cho WHERE

        const query = `
            UPDATE taisan 
            SET ${setClause} 
            WHERE taisanid = $${values.length}
            RETURNING *`;

        try {
            const { rows } = await poolQuanLiNhaVanHoa.query(query, values);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model updateAsset:", error.message);
            throw error;
        }
    },

    // Xóa tài sản
    deleteAsset: async (id) => {
        // Lệnh DELETE này sẽ kích hoạt ON DELETE SET NULL trong DB
        const query = 'DELETE FROM taisan WHERE taisanid = $1 RETURNING *';
        try {
            const { rows } = await poolQuanLiNhaVanHoa.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model deleteAsset:", error.message);
            throw error;
        }
    },

    // Tìm ID phòng dựa trên tên phòng (Hỗ trợ cho việc Thêm/Sửa bằng tên)
    getPhongIdByName: async (tenPhong) => {
        const query = 'SELECT phongid FROM phong WHERE tenphong = $1 LIMIT 1';
        const { rows } = await poolQuanLiNhaVanHoa.query(query, [tenPhong]);
        return rows.length > 0 ? rows[0].phongid : null;
    },

    // Thêm mới tài sản
    addAsset: async (data) => {
        const query = `
            INSERT INTO TaiSan (TenTaiSan, SoLuong, TinhTrang, NhaID, PhongID)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [data.tenTS, data.SL, data.TinhTrang, 1, data.phongId];
        const { rows } = await poolQuanLiNhaVanHoa.query(query, values);
        return rows[0];
    },

// ==============================================
// QUẢN LÝ LỊCH CHUNG
// ==============================================

    // 1. Lấy danh sách lịch hoạt động sắp tới
    getUpcomingActivities: async () => {
        try {
            // Lấy các hoạt động có thời gian kết thúc > hiện tại
            const query = `
                SELECT 
                    hdc.tenhoatdong AS "tenHD",
                    p.tenphong AS "phong",
                    hdc.thoigianbatdau AS "tu",
                    hdc.thoigianketthuc AS "den"
                FROM hoatdongchung hdc
                JOIN lichsudungphong l ON hdc.hdchungid = l.hdchungid
                JOIN phong p ON l.phongid = p.phongid
                WHERE hdc.thoigianketthuc >= NOW()
                ORDER BY hdc.thoigianbatdau ASC
                LIMIT 10
            `;
            const { rows } = await poolQuanLiNhaVanHoa.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getUpcomingActivities:", error);
            throw error;
        }
    },

    // 2. Thêm mới hoạt động chung
    addCommonActivity: async (data) => {
        const client = await poolQuanLiNhaVanHoa.connect();
        try {
            await client.query('BEGIN');

            // BƯỚC 1: Kiểm tra trùng lịch (Logic giống duyệt đơn)
            const conflictQuery = `
                SELECT lichid FROM lichsudungphong 
                WHERE phongid = $1 
                AND (thoigianbatdau < $3 AND thoigianketthuc > $2)
            `;
            const conflictCheck = await client.query(conflictQuery, [data.phong, data.tu, data.den]);
            
            if (conflictCheck.rows.length > 0) {
                throw new Error("Phòng này đã kín lịch trong khung giờ chọn!");
            }

            // BƯỚC 2: Thêm vào bảng hoatdongchung
            const insertHDC = `
                INSERT INTO hoatdongchung (tenhoatdong, thoigianbatdau, thoigianketthuc, ghichu)
                VALUES ($1, $2, $3, $4)
                RETURNING hdchungid
            `;
            const resHDC = await client.query(insertHDC, [data.tenHD, data.tu, data.den, data.ghiChu]);
            const newId = resHDC.rows[0].hdchungid;

            // BƯỚC 3: Thêm vào bảng lichsudungphong (Mapping phòng)
            const insertLich = `
                INSERT INTO lichsudungphong (phongid, hdchungid, thoigianbatdau, thoigianketthuc, loaihoatdong)
                VALUES ($1, $2, $3, $4, 'Chung')
            `;
            await client.query(insertLich, [data.phong, newId, data.tu, data.den]);

            await client.query('COMMIT');
            return { message: "Thêm lịch thành công", id: newId };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    getAllRooms: async () => {
        try {
            const query = `SELECT phongid, tenphong FROM phong ORDER BY phongid ASC`;
            const { rows } = await poolQuanLiNhaVanHoa.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getAllRooms:", error);
            throw error;
        }
    },

    getReportStats: async (month, year) => {
        try {
            // QUERY 1: Thống kê tổng quan hiện tại (Snapshot toàn bộ kho)
            // Đếm tổng số, số lượng Tốt, và số lượng Hỏng (Khác Tốt)
            const queryStats = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN tinhtrang = 'Tốt' THEN 1 ELSE 0 END) as tot,
                    SUM(CASE WHEN tinhtrang != 'Tốt' THEN 1 ELSE 0 END) as hong
                FROM taisan
            `;
            
            // QUERY 2: Lấy nhật ký kiểm tra trong tháng/năm được chọn
            // Join 3 bảng: kiemtrataisan - taisan - canbo để lấy đủ tên
            const queryHistory = `
                SELECT 
                    k.ngaykiemtra, 
                    t.tentaisan, 
                    k.soluongthucte, 
                    k.tinhtrang, 
                    k.ghichu, 
                    COALESCE(c.hoten, 'Admin') as canbo
                FROM kiemtrataisan k
                LEFT JOIN taisan t ON k.taisanid = t.taisanid
                LEFT JOIN canbo c ON k.canboid = c.canboid
                WHERE EXTRACT(MONTH FROM k.ngaykiemtra) = $1 
                  AND EXTRACT(YEAR FROM k.ngaykiemtra) = $2
                ORDER BY k.ngaykiemtra DESC
            `;

            // Thực hiện cả 2 truy vấn
            const statsRes = await poolQuanLiNhaVanHoa.query(queryStats);
            const historyRes = await poolQuanLiNhaVanHoa.query(queryHistory, [month, year]);

            // Trả về object chứa cả 2 loại dữ liệu
            return {
                summary: statsRes.rows[0], // { total: 100, tot: 80, hong: 20 }
                history: historyRes.rows   // [Danh sách các lần kiểm tra...]
            };
        } catch (error) {
            console.error("Lỗi Model getReportStats:", error.message);
            throw error;
        }
    },

    addInspection: async (data) => {
        const query = `
            INSERT INTO kiemtrataisan (taisanid, canboid, ngaykiemtra, soluongthucte, tinhtrang, ghichu)
            VALUES ($1, $2, NOW(), $3, $4, $5)
            RETURNING *
        `;
        
        // Lưu ý: canboid tạm để là 1 (Admin) vì hệ thống chưa có đăng nhập
        const values = [data.id, 1, data.sl, data.tinhTrang, data.ghiChu];
        
        try {
            const { rows } = await poolQuanLiNhaVanHoa.query(query, values);
            return rows[0];
        } catch (error) {
            // Mã lỗi 23505 trong PostgreSQL nghĩa là vi phạm ràng buộc Unique
            // (Tức là tài sản này + ngày hôm nay đã có trong bảng rồi)
            if (error.code === '23505') {
                throw new Error("Tài sản này đã được kiểm kê trong ngày hôm nay rồi.");
            }
            console.error("Lỗi Model addInspection:", error.message);
            throw error;
        }
    },
};

module.exports = NhaVanHoaModel;