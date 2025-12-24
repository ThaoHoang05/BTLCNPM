const { poolQuanLiHoKhau } = require('../config/db');

const NhanKhauModel = {
    // Query lấy ds nhân khẩu thường trú và tạm trú
    getNhanKhauList: async () => {
        try {
            const query = `
                SELECT 
                    nk.id AS "ID",
                    nk.hoten AS "hoTen",
                    nk.ngaysinh AS "ngaySinh",
                    nk.cccd AS "cccd",
                    nk.trangthai AS "trangThai",
                    CASE 
                        WHEN nk.trangthai IN ('Tạm trú') THEN 
                            COALESCE(
                                CONCAT_WS(', ', 
                                    NULLIF(hk_host.sonha, ''), 
                                    NULLIF(hk_host.duong, ''), 
                                    NULLIF(hk_host.phuong, ''), 
                                    NULLIF(hk_host.quan, ''), 
                                    NULLIF(hk_host.tinh, '')
                                ),
                                'Địa chỉ chưa xác định'
                            )
                        ELSE 
                            CONCAT_WS(', ', 
                                NULLIF(hk_goc.sonha, ''), 
                                NULLIF(hk_goc.duong, ''), 
                                NULLIF(hk_goc.phuong, ''), 
                                NULLIF(hk_goc.quan, ''), 
                                NULLIF(hk_goc.tinh, '')
                            )
                    END AS "diaChi"
                FROM nhankhau nk
                LEFT JOIN hokhau hk_goc ON nk.sohokhau = hk_goc.sohokhau
                
                LEFT JOIN LATERAL (
                    SELECT * FROM tamtru 
                    WHERE nhankhau_id = nk.id 
                    AND trangthai = 'Còn hạn'
                    ORDER BY denngay DESC 
                    LIMIT 1
                ) tt_active ON true

                LEFT JOIN nhankhau host ON (tt_active.chuho_id = host.id OR (tt_active.chuho_id IS NULL AND tt_active.chuhocccd = host.cccd))
                LEFT JOIN hokhau hk_host ON host.sohokhau = hk_host.sohokhau

                WHERE nk.trangthai IN ('Thường trú', 'Tạm trú')
                ORDER BY nk.id ASC
            `;
            
            const { rows } = await poolQuanLiHoKhau.query(query);
            return rows;
        } catch (error) {
            console.error("Lỗi Model getNhanKhauList:", error);
            throw error;
        }
    },

    // Xóa nhân khẩu
    delete: async (id) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // 1. Kiểm tra xem người này có đang là chủ hộ của hộ nào không
            const checkOwnerQuery = 'SELECT sohokhau FROM hokhau WHERE chuho_id = $1';
            const ownerRes = await client.query(checkOwnerQuery, [id]);
            if (ownerRes.rows.length > 0) {
                throw new Error(`Không thể xóa vì người này đang là chủ hộ của hộ ${ownerRes.rows[0].sohokhau}. Hãy thay đổi chủ hộ trước.`);
            }

            // 2. Xóa các bản ghi liên quan ở các bảng phụ (Tạm trú, Tạm vắng, Biến động)
            await client.query('DELETE FROM tamtru WHERE nhankhau_id = $1', [id]);
            await client.query('DELETE FROM tamvang WHERE nhankhau_id = $1', [id]);
            await client.query('DELETE FROM biendongnhankhau WHERE nhankhau_id = $1', [id]);

            // 3. Xóa bản ghi chính trong bảng nhankhau
            const result = await client.query('DELETE FROM nhankhau WHERE id = $1', [id]);

            await client.query('COMMIT');
            return result.rowCount;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
};

module.exports = NhanKhauModel;