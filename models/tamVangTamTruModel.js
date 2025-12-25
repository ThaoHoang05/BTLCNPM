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

    // Đăng ký tạm trú
    addTamTru: async (data) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // BƯỚC 1: XÁC THỰC CHỦ HỘ & LẤY ĐỊA CHỈ
            const hostQuery = `
                SELECT nk.id, hk.sonha, hk.duong, hk.phuong, hk.quan, hk.tinh
                FROM nhankhau nk
                JOIN hokhau hk ON nk.id = hk.chuho_id
                WHERE nk.cccd = $1 AND nk.hoten = $2
            `;
            const hostRes = await client.query(hostQuery, [data.cccdChuHo, data.hoTenChuHo]);

            if (hostRes.rows.length === 0) {
                throw new Error("Thông tin Chủ hộ không chính xác hoặc người này không đứng tên hộ khẩu nào.");
            }
            const hostId = hostRes.rows[0].id;
            const hostAddress = `${hostRes.rows[0].sonha} ${hostRes.rows[0].duong}, ${hostRes.rows[0].phuong}, ${hostRes.rows[0].quan}, ${hostRes.rows[0].tinh}`;

            // BƯỚC 2: XỬ LÝ NHÂN KHẨU NGƯỜI ĐĂNG KÝ
            let registrantId = null;
            
            // Lấy dữ liệu từ Payload
            const hoTen = data.hoTenNguoiDK;
            const ngaySinh = data.ngaySinhNguoiDK;
            const gioiTinh = data.gioiTinhNguoiDK;

            // Trường hợp 1: Có CCCD -> Kiểm tra tồn tại
            if (data.cccdNguoiDK && data.cccdNguoiDK.trim() !== "") {
                const checkExist = await client.query('SELECT id FROM nhankhau WHERE cccd = $1', [data.cccdNguoiDK]);
                
                if (checkExist.rows.length > 0) {
                    // Đã có trong hệ thống -> Lấy ID người cũ
                    registrantId = checkExist.rows[0].id;
                } else {
                    // Chưa có -> Insert mới với đầy đủ thông tin
                    const insertNK = `
                        INSERT INTO nhankhau (hoten, cccd, trangthai, ngaysinh, gioitinh, dantoc, nguyenquan)
                        VALUES ($1, $2, 'Tạm trú', $3, $4, 'Kinh', 'Chưa rõ')
                        RETURNING id
                    `;
                    const newNk = await client.query(insertNK, [hoTen, data.cccdNguoiDK, ngaySinh, gioiTinh]); 
                    registrantId = newNk.rows[0].id;
                }
            } 
            // Trường hợp 2: Không có CCCD (Trẻ em) -> Luôn tạo mới
            else {
                const insertNK = `
                    INSERT INTO nhankhau (hoten, cccd, trangthai, ngaysinh, gioitinh)
                    VALUES ($1, NULL, 'Tạm trú', $2, $3) 
                    RETURNING id
                `;
                const newNk = await client.query(insertNK, [hoTen, ngaySinh, gioiTinh]);
                registrantId = newNk.rows[0].id;
            }

            // BƯỚC 3: TẠO PHIẾU TẠM TRÚ
            const insertTamTru = `
                INSERT INTO tamtru (nhankhau_id, chuho_id, diaphuong, tungay, denngay, lydo, trangthai, chuhocccd, chuho)
                VALUES ($1, $2, $3, $4, $5, $6, 'Còn hạn', $7, $8)
            `;
            
            await client.query(insertTamTru, [
                registrantId,
                hostId,
                hostAddress,
                data.thoiGian.tu,
                data.thoiGian.den,
                data.lyDo,
                data.cccdChuHo,
                data.hoTenChuHo
            ]);

            await client.query('COMMIT');
            return { message: "Đăng ký tạm trú thành công" };

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