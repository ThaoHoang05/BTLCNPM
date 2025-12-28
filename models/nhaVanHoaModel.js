const { poolQuanLiNhaVanHoa } = require('../config/db');

const NhaVanHoaModel = {
// ==============================================
// QUẢN LÝ TÀI SẢN
// ==============================================

    //Hàm bla bla...


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

};

module.exports = NhaVanHoaModel;