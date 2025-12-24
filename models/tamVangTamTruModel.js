const { poolQuanLiHoKhau } = require('../config/db');

const TamVangTamTruModel = {
// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM TRÚ)
// ==============================================

    // Lấy danh sách tạm trú
    getTamTruList: async (page = 1) => {
        const limit = 10;
        const offset = (page - 1) * limit;
        try {
            // Lấy dữ liệu 10 người kèm theo tổng số trang
            const query = `
                SELECT 
                    nk.hoten AS "HoTen",
                    nk.cccd AS "CCCD",
                    CONCAT(hk.sonha, ' ', hk.duong, ', ', hk.phuong, ', ', hk.quan, ', ', hk.tinh) AS "DiaChi",
                    tt.tungay AS "Tu",
                    tt.denngay AS "Den",
                    tt.trangthai AS "TrangThai",
                    tt.tamtruid AS "ID",
                    COUNT(*) OVER() AS "total_count"
                FROM tamtru tt
                JOIN nhankhau nk ON tt.nhankhau_id = nk.id
                LEFT JOIN nhankhau host ON tt.chuho_id = host.id
                LEFT JOIN hokhau hk ON host.sohokhau = hk.sohokhau
                WHERE tt.trangthai = 'Còn hạn'
                ORDER BY tt.nhankhau_id ASC
                LIMIT $1 OFFSET $2;
            `;
            const { rows } = await poolQuanLiHoKhau.query(query, [limit, offset]);
            return {
                data: rows,
                total: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    },

    // Kết thúc tạm trú (công dân chuyển đi)
    endTamTru: async (tamtruId) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // 1. Cập nhật trạng thái bảng tamtru thành 'Chuyển đi'
            const updateTT = await client.query(
                `UPDATE tamtru SET trangthai = 'Chuyển đi' WHERE tamtruid = $1 RETURNING nhankhau_id`,
                [tamtruId]
            );

            if (updateTT.rows.length > 0) {
                const nhanKhauId = updateTT.rows[0].nhankhau_id;
                // 2. Cập nhật trạng thái bảng nhankhau thành 'Chuyển đi'
                await client.query(
                    `UPDATE nhankhau SET trangthai = 'Chuyển đi', sohokhau = NULL WHERE id = $1`,
                    [nhanKhauId]
                );
            }

            await client.query('COMMIT');
            return updateTT.rowCount;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

// ==============================================
// QUẢN LÝ CƯ TRÚ (TẠM VẮNG)
// ==============================================


};

module.exports = TamVangTamTruModel;