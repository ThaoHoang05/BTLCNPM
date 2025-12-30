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
                    noisinh, nguyenquan, dantoc, tongiao, -- Thêm tongiao ở đây
                    nghenghiep, noilamviec,
                    ngaycapcccd, noicapcccd, ngaydkthuongtru,
                    quanhevoichuho, sohokhau, trangthai
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_DATE, $14, $15, $16)
                    RETURNING id, hoten;
            `;

// 2. Cập nhật mảng tham số
            const resNK = await client.query(insertNK, [
                data.cccd || null,       // $1
                data.hoTen,              // $2
                data.bietDanh || null,   // $3
                data.gioiTinh,           // $4
                data.ngaySinh,           // $5
                data.noiSinh,            // $6
                data.nguyenQuan,         // $7
                data.danToc,             // $8
                data.tonGiao || 'Không', // $9
                data.ngheNghiep || null, // $10
                data.noiLamViec || null, // $11
                data.ngayCap || null,    // $12
                data.noiCap || null,     // $13
                data.quanheChuHo || null,// $14
                data.maHK || null,       // $15
                data.trangThai           // $16
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
    },

    // Lấy chi tiết nhân khẩu theo ID
    getById: async (id) => {
        try {
            const query = `
                SELECT 
                    hoten AS "hoTen",
                    bidanh AS "biDanh",
                    ngaysinh AS "ngaySinh",
                    gioitinh AS "gioiTinh",
                    dantoc AS "danToc",
                    nguyenquan AS "nguyenQuan",
                    noisinh AS "noiSinh",
                    cccd AS "cccd",
                    ngaycapcccd AS "ngayCap",
                    noicapcccd AS "noiCap",
                    nghenghiep AS "ngheNghiep",
                    noilamviec AS "noiLamViec",
                    sohokhau AS "maHoKhau",
                    quanhevoichuho AS "quanHeVoiChuHo",
                    trangthai AS "trangThai",
                    tongiao AS "tonGiao"
                FROM nhankhau
                WHERE id = $1
            `;
            const { rows } = await poolQuanLiHoKhau.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model getById:", error);
            throw error;
        }
    },

    // Cập nhật thông tin nhân khẩu
    update: async (id, data) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // 1. Định nghĩa ánh xạ: Key Frontend gửi lên -> Tên cột trong Database
            const dbMap = {
                hoTen: 'hoten',
                biDanh: 'bidanh',
                ngaySinh: 'ngaysinh',
                gioiTinh: 'gioitinh',
                danToc: 'dantoc',
                nguyenQuan: 'nguyenquan',
                noiSinh: 'noisinh',
                ngheNghiep: 'nghenghiep',
                noiLamViec: 'noilamviec',
                quanHeVoiChuHo: 'quanhevoichuho',
                maHoKhau: 'sohokhau',
                trangThai: 'trangthai',
                ngayCapCCCD: 'ngaycapcccd',
                noiCapCCCD: 'noicapcccd',
                cccd: 'cccd',
                tonGiao: 'tongiao'
            };

            // 2. Xây dựng câu lệnh SQL động
            const updates = [];
            const values = [];
            let paramIndex = 1;

            Object.keys(data).forEach(key => {
                // Chỉ xử lý nếu key có trong bảng ánh xạ và giá trị không undefined
                if (dbMap[key] && data[key] !== undefined) {
                    updates.push(`${dbMap[key]} = $${paramIndex}`);
                    values.push(data[key]);
                    paramIndex++;
                }
            });

            // Nếu không có trường nào hợp lệ để update
            if (updates.length === 0) {
                await client.query('ROLLBACK');
                return { message: "Không có trường dữ liệu hợp lệ để cập nhật" };
            }

            // Thêm ID vào cuối mảng values để làm điều kiện WHERE
            values.push(id);
            
            const query = `
                UPDATE nhankhau
                SET ${updates.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING hoten, cccd; -- Lấy lại thông tin mới nhất để ghi log
            `;

            const resUpdate = await client.query(query, values);

            // 3. Ghi log biến động
            // Cần thông tin họ tên và CCCD (có thể vừa sửa hoặc giữ nguyên)
            // Nếu update thành công, resUpdate.rows[0] sẽ chứa dữ liệu mới nhất của dòng đó
            if (resUpdate.rowCount > 0) {
                const currentData = resUpdate.rows[0];
                
                const logQuery = `
                    INSERT INTO biendongnhankhau (nhankhau_id, cccd, loaibiendong, ngaybiendong, ghichu)
                    VALUES ($1, $2, 'Thay đổi thông tin', CURRENT_DATE, $3)
                `;
                
                // Tạo ghi chú: Liệt kê các trường đã thay đổi để dễ theo dõi
                const changedFields = Object.keys(data).filter(k => dbMap[k]).join(', ');
                
                await client.query(logQuery, [
                    id, 
                    currentData.cccd, 
                    `Cập nhật (PATCH) các trường: ${changedFields}. Họ tên: ${currentData.hoten}`
                ]);
            }

            await client.query('COMMIT');
            return { message: "Cập nhật thành công" };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};

module.exports = NhanKhauModel;