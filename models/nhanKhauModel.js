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

    // Thêm mới nhân khẩu (API /nhankhau/new)
    create: async (data) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // 1. Thêm vào bảng nhankhau (Chấp nhận CCCD null cho trẻ em/mới sinh)
            const insertNK = `
                INSERT INTO nhankhau (
                    cccd, hoten, bidanh, gioitinh, ngaysinh, 
                    noisinh, nguyenquan, dantoc, nghenghiep, noilamviec, 
                    ngaycapcccd, noicapcccd, ngaydkthuongtru, 
                    quanhevoichuho, sohokhau, trangthai
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE, $13, $14, $15)
                RETURNING id, hoten;
            `;

            const resNK = await client.query(insertNK, [
                data.cccd || null,
                data.hoTen,
                data.bietDanh || null,
                data.gioiTinh,
                data.ngaySinh,
                data.noiSinh,
                data.nguyenQuan,
                data.danToc,
                data.ngheNghiep || null,
                data.noiLamViec || null,
                data.ngayCap || null,
                data.noiCap || null,
                data.quanheChuHo || null,
                data.maHK || null,
                data.trangThai
            ]);

            const newId = resNK.rows[0].id;
            const hoTen = resNK.rows[0].hoten;

            // 2. Ghi vào bảng biendongnhankhau bằng nhankhau_id
            const insertBDNK = `
                INSERT INTO biendongnhankhau (nhankhau_id, cccd, loaibiendong, ngaybiendong, noiden, ghichu)
                VALUES ($1, $2, 'Thêm mới', CURRENT_DATE, $3, $4)
            `;
            await client.query(insertBDNK, [
                newId,
                data.cccd || null,
                data.maHK || 'Khai báo tự do',
                `Đăng ký nhân khẩu mới: ${hoTen} (Trạng thái: ${data.trangThai})`
            ]);

            // 3. Tự động ghi vào biendonghokhau nếu không phải Tạm trú
            if (data.trangThai !== 'Tạm trú' && data.maHK) {
                const insertBDHK = `
                    INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi)
                    VALUES ($1, $2, CURRENT_DATE)
                `;
                const noiDung = `Thêm thành viên mới: ${hoTen} (ID: ${newId})`;
                await client.query(insertBDHK, [data.maHK, noiDung]);
            }

            await client.query('COMMIT');
            return { id: newId, hoTen: hoTen };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Lỗi Model create NhanKhau:", error);
            throw error;
        } finally {
            client.release();
        }
    }
    
};

module.exports = NhanKhauModel;