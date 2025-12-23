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

            // INSERT vào bảng hộ khẩu
            const insertHK = `
                INSERT INTO hokhau (sohokhau, chuhocccd, sonha, duong, phuong, quan, tinh, ngaylap, ghichu)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            
            await client.query(insertHK, [
                data.Ma, 
                data.ChuHo.CCCD, 
                data.DiaChi.sonha,
                data.DiaChi.duong, 
                'La Khê', 
                'Hà Đông',
                'Hà Nội', 
                data.NgayLap, 
                data.GhiChu
            ]);

            // Cập nhật số hộ khẩu cho chủ hộ trong bảng nhân khẩu
            await client.query(
                'UPDATE nhankhau SET sohokhau = $1, quanhevoichuho = $2 WHERE cccd = $3',
                [data.Ma, 'Chủ hộ', data.ChuHo.CCCD]
            );

            // Ghi lịch sử biến động
            await client.query(
                'INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, $3)',
                [data.Ma, 'Đăng ký hộ khẩu mới', data.NgayLap]
            );

            await client.query('COMMIT');
            return { message: "Tạo hộ khẩu thành công" };
        } catch (error) {
            await client.query('ROLLBACK');
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

    //Xóa hộ khẩu (Transaction)
    deleteHoKhau: async (sohokhau) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // Bước 1: Xóa nhân khẩu thuộc hộ này trước để tránh lỗi Foreign Key
            await client.query('DELETE FROM nhankhau WHERE sohokhau = $1', [sohokhau]);

            // Bước 2: Xóa lịch sử biến động hộ khẩu (nếu có)
            await client.query('DELETE FROM biendonghokhau WHERE sohokhau = $1', [sohokhau]);

            // Bước 3: Xóa chính hộ khẩu
            const result = await client.query('DELETE FROM hokhau WHERE sohokhau = $1', [sohokhau]);

            await client.query('COMMIT');
            return result.rowCount; // Trả về 1 nếu xóa thành công, 0 nếu không tìm thấy
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Lỗi tại HoKhauModel.deleteHoKhau:", error);
            throw error;
        } finally {
            client.release();
        }
    },

};

module.exports = HoKhauModel;