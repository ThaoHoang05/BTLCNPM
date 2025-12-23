const { poolQuanLiHoKhau } = require('../config/db');

const HoKhauModel = {
    // Truy vấn tổng hợp số liệu cho Dashboard
    getDashboardStats: async () => {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM hokhau) AS "totalHouseholds",
                (SELECT COUNT(*) FROM nhankhau) AS "totalResidents",
                -- Gom nhóm 'Mới sinh' và 'Tạm trú' (nếu có trong bảng tamtru)
                (SELECT COUNT(*) FROM nhankhau WHERE trangthai = 'Mới sinh') 
                    + (SELECT COUNT(*) FROM tamtru) AS "totalBirths",
                -- Gom nhóm 'Tạm vắng' và 'Qua đời'
                (SELECT COUNT(*) FROM nhankhau WHERE trangthai IN ('Tạm vắng', 'Qua đời')) AS "totalDeaths"
        `;
        try {
            const { rows } = await poolQuanLiHoKhau.query(query);
            return rows[0]; // Trả về object chứa 4 con số
        } catch (error) {
            console.error("Lỗi truy vấn SQL tại HoKhauModel:", error);
            throw error;
        }
    },
    
    // Truy vấn chi tiết hộ khẩu theo số hộ khẩu
    getDetail: async (sohokhau) => {
        try {
            // 1. Lấy thông tin chung của hộ và tên chủ hộ
            const infoQuery = `
                SELECT hk.sohokhau, nk.hoten as "HoTen", 
                       hk.sonha || ', ' || hk.duong || ', ' || hk.phuong || ', ' || hk.quan || ', ' || hk.tinh as "DiaChi",
                       hk.ngaylap as "NgayLap",
                       hk.ghichu as "GhiChu"
                FROM hokhau hk
                LEFT JOIN nhankhau nk ON hk.chuhocccd = nk.cccd
                WHERE hk.sohokhau = $1`;
            
            // 2. Lấy danh sách nhân khẩu trong hộ
            const membersQuery = `
                SELECT hoten as "HoTenTV", 
                   ngaysinh as "NgaySinh", 
                   quanhevoichuho as "QuanHeChuHo",
                   cccd as "CCCD",
                   trangthai as "TrangThai"
                FROM nhankhau 
                WHERE sohokhau = $1`;

            // 3. Biến động NHÂN KHẨU 
            const historyResidentQuery = `
                SELECT nk.hoten as "hoTen", bd.loaibiendong as "loaiBienDong", 
                    bd.ngaybiendong as "ngayThayDoi", bd.noiden as "noiDen", bd.ghichu as "ghiChu"
                FROM biendongnhankhau bd
                JOIN nhankhau nk ON bd.cccd = nk.cccd
                WHERE nk.sohokhau = $1
                ORDER BY bd.ngaybiendong DESC`;

            // 4. Biến động HỘ KHẨU
            const historyHouseholdQuery = `
                SELECT ngaythaydoi as "ngayThayDoi", noidungthaydoi as "noiDung"
                FROM biendonghokhau 
                WHERE sohokhau = $1
                ORDER BY ngaythaydoi DESC`;

            const info = await poolQuanLiHoKhau.query(infoQuery, [sohokhau]);
            const members = await poolQuanLiHoKhau.query(membersQuery, [sohokhau]);
            const resHistory = await poolQuanLiHoKhau.query(historyResidentQuery, [sohokhau]);
            const hkHistory = await poolQuanLiHoKhau.query(historyHouseholdQuery, [sohokhau]);

            if (info.rows.length === 0) return null;

            return {
                HoTen: info.rows[0].HoTen,
                DiaChi: info.rows[0].DiaChi,
                NgayLap: info.rows[0].NgayLap,
                GhiChu: info.rows[0].GhiChu,
                danhSachNhanKhau: members.rows,
                lichSu: {
                    nhanKhau: resHistory.rows,
                    hoKhau: hkHistory.rows
                }
            };
        } catch (error) {
            console.error("Lỗi Model getDetail:", error);
            throw error;
        }
    },

    // Truy vấn list hộ khẩu cho tab hộ khẩu
    getHoKhauData: async () => {
    const query = `
        SELECT
            hk.sohokhau AS "Mã hộ khẩu",
            nk.hoten AS "Chủ hộ",
            CONCAT(hk.sonha, ' ', hk.duong, ', ', hk.phuong, ', ', hk.quan, ', ', hk.tinh) AS "Địa chỉ",
            hk.ngaylap AS "Ngày lập sổ",
            hk.chuhocccd AS "CCCD"
        FROM hokhau hk
        LEFT JOIN nhankhau nk ON hk.chuhocccd = nk.cccd;
    `;
        const { rows } = await poolQuanLiHoKhau.query(query);
        return rows;
    },

    // Tạo hộ khẩu mới
    create: async (data) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // BƯỚC 1: Kiểm tra trạng thái "Thường trú" của chủ hộ
            const checkStatusQuery = 'SELECT trangthai FROM nhankhau WHERE cccd = $1';
            const statusRes = await client.query(checkStatusQuery, [data.ChuHo.CCCD]);

            if (statusRes.rows.length === 0) {
                throw new Error("Không tìm thấy CCCD chủ hộ trong hệ thống nhân khẩu.");
            }
            if (statusRes.rows[0].trangthai !== 'Thường trú') {
                throw new Error("Chủ hộ phải có trạng thái 'Thường trú' mới được phép lập hộ khẩu.");
            }

            // BƯỚC 2: Tự động sinh mã hộ khẩu mới (Lấy mã lớn nhất + 1)
            const maxIdQuery = `SELECT MAX(CAST(SUBSTRING(sohokhau, 3) AS INTEGER)) as "maxNum" FROM hokhau WHERE sohokhau LIKE 'HK%'`;
            const maxIdRes = await client.query(maxIdQuery);
            const nextNum = (maxIdRes.rows[0].maxNum || 0) + 1;
            // Định dạng lại thành HKxxx
            const nextHkId = 'HK' + nextNum.toString().padStart(3, '0');

            // BƯỚC 3: INSERT vào bảng hộ khẩu
            const insertHK = `
                INSERT INTO hokhau (sohokhau, chuhocccd, sonha, duong, phuong, quan, tinh, ngaylap, ghichu)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            await client.query(insertHK, [
                nextHkId,
                data.ChuHo.CCCD, 
                data.DiaChi.sonha,
                data.DiaChi.duong, 
                'La Khê', 
                'Hà Đông',
                'Hà Nội', 
                data.NgayLap, 
                data.GhiChu
            ]);

            // BƯỚC 4: Cập nhật nhân khẩu và lịch sử
            await client.query(
                'UPDATE nhankhau SET sohokhau = $1, quanhevoichuho = $2 WHERE cccd = $3',
                [nextHkId, 'Chủ hộ', data.ChuHo.CCCD]
            );

            await client.query(
                'INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, $3)',
                [nextHkId, 'Đăng ký hộ khẩu mới', data.NgayLap]
            );

            await client.query('COMMIT');
            return { message: "Tạo hộ khẩu thành công", sohokhau: nextHkId };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Lỗi Model create:", error.message);
            throw error;
        } finally {
            client.release();
        }
    },

    // Thực hiện tách hộ
    split: async (oldHkId, data) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // 1. Tạo Mã hộ khẩu mới (có thể sẽ cần sửa lại sau)
            // Ở đây giả định tạo mã mới dựa trên hộ cũ để test, ví dụ: HK_NEW_123
            const newHkId = 'HK' + Date.now().toString().slice(-3); 

            // 2. Tìm CCCD của chủ hộ mới dựa trên Họ tên (vì Payload FE gửi Họ tên)
            // Lưu ý: Tốt nhất FE nên gửi CCCD để tránh trùng tên
            const ownerRes = await client.query(
                'SELECT cccd FROM nhankhau WHERE hoten = $1 AND sohokhau = $2',
                [data.HoTen, oldHkId]
            );
            if (ownerRes.rows.length === 0) throw new Error("Không tìm thấy chủ hộ mới trong hộ cũ");
            const newOwnerCCCD = ownerRes.rows[0].cccd;

            // 3. Thêm hộ mới vào bảng hokhau
            const insertHK = `
                INSERT INTO hokhau (sohokhau, chuhocccd, sonha, duong, phuong, quan, tinh, ngaylap, ghichu)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
            await client.query(insertHK, [
                newHkId, newOwnerCCCD, '', data.DiaChi, 'La Khê', 'Hà Đông', 'Hà Nội', data.NgayTach, data.LyDo
            ]);

            // 4. Cập nhật mã hộ khẩu mới cho Chủ hộ và các Thành viên tách cùng
            const allMovingCCCDs = [newOwnerCCCD, ...data.ThanhVien];
            const updateNK = 'UPDATE nhankhau SET sohokhau = $1 WHERE cccd = ANY($2)';
            await client.query(updateNK, [newHkId, allMovingCCCDs]);

            // 5. Cập nhật quan hệ chủ hộ cho người đứng đầu hộ mới
            await client.query('UPDATE nhankhau SET quanhevoichuho = $1 WHERE cccd = $2', ['Chủ hộ', newOwnerCCCD]);

            // 6. Ghi nhận vào bảng tách hộ (lưu vết hộ cũ - hộ mới)
            await client.query(
                'INSERT INTO tachho (sohokhaucu, sohokhaumoi, ngaytach, ghichu) VALUES ($1, $2, $3, $4)',
                [oldHkId, newHkId, data.NgayTach, data.LyDo]
            );

            // 7. Ghi lịch sử biến động cho cả 2 hộ
            await client.query(
                'INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, $3)',
                [oldHkId, `Tách hộ: Chuyển ${allMovingCCCDs.length} người sang hộ ${newHkId}`, data.NgayTach]
            );

            await client.query('COMMIT');
            return { message: "Tách hộ thành công", newHkId };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Xóa hộ khẩu
    deleteHoKhau: async (sohokhau) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');
    
            // BƯỚC 1: Gỡ bỏ mối quan hệ chủ hộ trong bảng hokhau
            await client.query('UPDATE hokhau SET chuhocccd = NULL WHERE sohokhau = $1', [sohokhau]);
    
            // Chuẩn bị danh sách CCCD sắp bị xóa
            const queryParams = [sohokhau];
            const subQueryCCCD = '(SELECT cccd FROM nhankhau WHERE sohokhau = $1)';
    
            // BƯỚC 2: Xóa dữ liệu liên kết ở bảng con
            // Lưu ý: Dùng dấu backtick (`) để chèn biến subQueryCCCD
    
            // 2.1. Xóa tạm trú (FIX LỖI CỦA BẠN TẠI ĐÂY)
            // Xóa khi thành viên là người đi ở tạm trú
            await client.query(`DELETE FROM tamtru WHERE cccd IN ${subQueryCCCD}`, queryParams);
            
            // --- QUAN TRỌNG: Xóa khi thành viên là CHỦ HỘ bảo lãnh cho người khác tạm trú ---
            // (Bạn kiểm tra lại trong DB xem cột này tên là 'cccdchuho' hay 'idchuho' nhé, mình đang để mặc định là 'cccdchuho')
            // Dòng này sẽ gỡ bỏ ràng buộc fk_chuho_tamtru
            try {
                 // Thử xóa theo cột cccdchuho (thường gặp trong thiết kế này)
                 await client.query(`DELETE FROM tamtru WHERE cccdchuho IN ${subQueryCCCD}`, queryParams);
            } catch (err) {
                 // Nếu DB của bạn không có cột cccdchuho, có thể nó tên là ma_chu_ho, bạn hãy sửa lại tên cột cho đúng
                 console.log("Lưu ý: Kiểm tra lại tên cột chủ hộ trong bảng tamtru");
            }
    
            // 2.2. Xóa tạm vắng
            await client.query(`DELETE FROM tamvang WHERE cccd IN ${subQueryCCCD}`, queryParams);
            
            // 2.3. Xóa biến động nhân khẩu
            await client.query(`DELETE FROM biendongnhankhau WHERE cccd IN ${subQueryCCCD}`, queryParams);
    
            // BƯỚC 3: Xóa các bảng phụ thuộc vào số hộ khẩu
            await client.query('DELETE FROM biendonghokhau WHERE sohokhau = $1', queryParams);
            await client.query('DELETE FROM tachho WHERE sohokhaucu = $1 OR sohokhaumoi = $1', queryParams);
    
            // BƯỚC 4: Xóa nhân khẩu
            await client.query('DELETE FROM nhankhau WHERE sohokhau = $1', queryParams);
    
            // BƯỚC 5: Xóa hộ khẩu
            const result = await client.query('DELETE FROM hokhau WHERE sohokhau = $1', queryParams);
    
            await client.query('COMMIT');
            return result.rowCount;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Lỗi xóa dữ liệu liên kết:", error.message);
            throw error;
        } finally {
            client.release();
        }
    },
};

module.exports = HoKhauModel;