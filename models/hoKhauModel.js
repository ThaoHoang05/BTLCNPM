const { poolQuanLiHoKhau } = require('../config/db');

const HoKhauModel = {
    // Truy vấn tổng hợp số liệu cho Dashboard
    getDashboardStats: async () => {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM hokhau) AS "totalHouseholds",
                (SELECT COUNT(*) FROM nhankhau) AS "totalResidents",
                (SELECT COUNT(*) FROM nhankhau WHERE trangthai = 'Mới sinh') 
                    + (SELECT COUNT(*) FROM tamtru) AS "totalBirths",
                (SELECT COUNT(*) FROM nhankhau WHERE trangthai IN ('Tạm vắng', 'Qua đời')) AS "totalDeaths"
        `;
        try {
            const { rows } = await poolQuanLiHoKhau.query(query);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model getDashboardStats!", error);
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
                LEFT JOIN nhankhau nk ON hk.chuho_id = nk.id
                WHERE hk.sohokhau = $1`;
            
            // 2. Lấy danh sách nhân khẩu trong hộ
            const membersQuery = `
                SELECT id,
                    hoten as "HoTenTV", 
                    ngaysinh as "NgaySinh", 
                    quanhevoichuho as "QuanHeChuHo",
                    cccd as "CCCD",
                    trangthai as "TrangThai"
                FROM nhankhau 
                WHERE sohokhau = $1
                ORDER BY id ASC`;

            // 3. Biến động NHÂN KHẨU 
            const historyResidentQuery = `
                SELECT nk.hoten as "hoTen", bd.loaibiendong as "loaiBienDong", 
                    bd.ngaybiendong as "ngayThayDoi", bd.noiden as "noiDen", bd.ghichu as "ghiChu"
                FROM biendongnhankhau bd
                JOIN nhankhau nk ON bd.nhankhau_id = nk.id
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
        LEFT JOIN nhankhau nk ON hk.chuho_id = nk.id
        ORDER BY hk.sohokhau ASC;
    `;
        const { rows } = await poolQuanLiHoKhau.query(query);
        return rows;
    },

    // Tạo hộ khẩu mới
    create: async (data) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');

            // TÌM ID TỪ CCCD 
            const findIdQuery = 'SELECT id, trangthai FROM nhankhau WHERE cccd = $1';
            const findIdRes = await client.query(findIdQuery, [data.ChuHo.CCCD]);

            if (findIdRes.rows.length === 0) {
                throw new Error("CCCD Chủ hộ không tồn tại trong hệ thống nhân khẩu!");
            }
            if (findIdRes.rows[0].trangthai !== 'Thường trú') {
                throw new Error("Chủ hộ phải có trạng thái 'Thường trú'.");
            }
            const chuHoId = findIdRes.rows[0].id; 

            // Tự động sinh mã hộ khẩu mới
            const maxIdQuery = `SELECT MAX(CAST(SUBSTRING(sohokhau, 3) AS INTEGER)) as "maxNum" FROM hokhau WHERE sohokhau LIKE 'HK%'`;
            const maxIdRes = await client.query(maxIdQuery);
            const nextNum = (maxIdRes.rows[0].maxNum || 0) + 1;
            const nextHkId = 'HK' + nextNum.toString().padStart(3, '0');

            // INSERT dùng chuHoId vừa tìm được
            const insertHK = `
                INSERT INTO hokhau (sohokhau, chuho_id, chuhocccd, sonha, duong, phuong, quan, tinh, ngaylap, ghichu)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;
            await client.query(insertHK, [
                nextHkId, 
                chuHoId,
                data.ChuHo.CCCD,
                data.DiaChi.sonha, data.DiaChi.duong, 'La Khê', 'Hà Đông', 'Hà Nội', 
                data.NgayLap, data.GhiChu
            ]);

            // Cập nhật nhân khẩu theo ID
            await client.query(
                'UPDATE nhankhau SET sohokhau = $1, quanhevoichuho = $2 WHERE id = $3',
                [nextHkId, 'Chủ hộ', chuHoId]
            );

            // Ghi lịch sử
            await client.query(
                'INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, $3)',
                [nextHkId, 'Đăng ký hộ khẩu mới', data.NgayLap]
            );

            await client.query('COMMIT');
            return { message: "Tạo hộ khẩu thành công", sohokhau: nextHkId };
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

            //  Kiểm tra xem người dùng có đang cố tách Chủ hộ hiện tại đi không?
            const currentOwnerRes = await client.query('SELECT chuho_id FROM hokhau WHERE sohokhau = $1', [oldHkId]);
            if (currentOwnerRes.rows.length === 0) throw new Error("Hộ khẩu cũ không tồn tại.");
            
            const currentOwnerId = currentOwnerRes.rows[0].chuho_id;

            const allMovingIDs = [data.HoTenID, ...data.ThanhVienIDs];

            const isOwnerMoving = allMovingIDs.some(id => id == currentOwnerId);
            
            if (isOwnerMoving) {
                throw new Error("Không thể tách Chủ hộ hiện tại ra khỏi hộ. Vui lòng chuyển quyền Chủ hộ cho người khác trước khi tách!");
            };

            // 1. Sinh mã hộ mới 
            const maxIdRes = await client.query(`SELECT MAX(CAST(SUBSTRING(sohokhau, 3) AS INTEGER)) as "maxNum" FROM hokhau`);
            const nextHkId = 'HK' + ((maxIdRes.rows[0].maxNum || 0) + 1).toString().padStart(3, '0');

            // 2. data.HoTenID là ID của chủ hộ mới được chọn
            const ownerInfo = await client.query('SELECT cccd FROM nhankhau WHERE id = $1', [data.HoTenID]);
            if (ownerInfo.rows.length === 0) throw new Error("Không tìm thấy chủ hộ mới.");

            // 3. Thêm hộ mới
            await client.query(`
                INSERT INTO hokhau (sohokhau, chuho_id, chuhocccd, sonha, duong, phuong, quan, tinh, ngaylap, ghichu)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
                [
                    nextHkId, 
                    data.HoTenID, 
                    ownerInfo.rows[0].cccd, 
                    data.DiaChi.sonha,
                    data.DiaChi.duong,
                    'La Khê',
                    'Hà Đông',  
                    'Hà Nội',   
                    data.NgayTach, 
                    data.LyDo
                ]
            );

            // 4. Di chuyển chủ hộ và thành viên đi kèm qua ID
            await client.query('UPDATE nhankhau SET sohokhau = $1 WHERE id = ANY($2)', [nextHkId, allMovingIDs]);
            await client.query('UPDATE nhankhau SET quanhevoichuho = $1 WHERE id = $2', ['Chủ hộ', data.HoTenID]);

            // 5. Ghi nhận bảng tách hộ và biến động
            await client.query('INSERT INTO tachho (sohokhaucu, sohokhaumoi, ngaytach, ghichu) VALUES ($1, $2, $3, $4)',
                [oldHkId, nextHkId, data.NgayTach, data.LyDo]);

            await client.query('INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, $3)',
                [oldHkId, `Tách hộ sang ${nextHkId}`, data.NgayTach]);

            await client.query('COMMIT');
            return { message: "Tách hộ thành công", newHkId: nextHkId };
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

            // BƯỚC 1: Lấy thông tin chủ hộ trước khi gỡ liên kết để ghi log chính xác
            const infoQuery = `
            SELECT h.sohokhau, n.hoten as ten_chu_ho 
            FROM hokhau h 
            LEFT JOIN nhankhau n ON h.chuho_id = n.id 
            WHERE h.sohokhau = $1`;
            const resInfo = await client.query(infoQuery, [sohokhau]);

            if (resInfo.rows.length === 0) {
                throw new Error("Hộ khẩu không tồn tại.");
            }
            const tenChuHo = resInfo.rows[0].ten_chu_ho || "Không rõ";

            // BƯỚC 2: Ghi vào bảng biến động hộ khẩu trước
            // Lưu ý: Nếu bảng biendonghokhau của bạn có khóa ngoại tham chiếu đến hokhau,
            // bạn nên lưu nội dung này vào một bảng log hệ thống khác hoặc thiết kế bảng biến động
            // không bị xóa theo cascade.
            await client.query(
                `INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) 
             VALUES ($1, $2, CURRENT_DATE)`,
                [sohokhau, `Xóa hộ khẩu. Chủ hộ: ${tenChuHo}. Các thành viên trở thành nhân khẩu tự do.`]
            );

            // BƯỚC 3: Gỡ liên kết ở bảng Nhân Khẩu
            await client.query(
                'UPDATE nhankhau SET sohokhau = NULL, quanhevoichuho = NULL WHERE sohokhau = $1',
                [sohokhau]
            );

            // BƯỚC 4: Gỡ các bảng liên quan khác (trừ biendonghokhau nếu muốn giữ lại lịch sử)
            await client.query('DELETE FROM tachho WHERE sohokhaucu = $1 OR sohokhaumoi = $1', [sohokhau]);

            // BƯỚC 5: Gỡ khóa ngoại tại bảng HoKhau
            await client.query(
                'UPDATE hokhau SET chuhocccd = NULL, chuho_id = NULL WHERE sohokhau = $1',
                [sohokhau]
            );

            // BƯỚC 6: Xóa bản ghi Hộ khẩu cuối cùng
            const result = await client.query('DELETE FROM hokhau WHERE sohokhau = $1', [sohokhau]);

            await client.query('COMMIT');
            return result.rowCount;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Xóa thành viên khỏi hộ (Set NULL)
    removeMember: async (hkId, memberId) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');
            // 1. Kiểm tra xem thành viên này có phải là Chủ hộ không
            const checkOwner = `SELECT chuho_id FROM hokhau WHERE sohokhau = $1`;
            const resOwner = await client.query(checkOwner, [hkId]);

            if (resOwner.rows.length === 0) {
                throw new Error("Hộ khẩu không tồn tại.");
            }
            // Lưu ý: memberId truyền vào là string/number, cần so sánh lỏng hoặc ép kiểu
            if (resOwner.rows[0].chuho_id == memberId) {
                throw new Error("Không thể xóa Chủ hộ khỏi danh sách. Vui lòng chuyển quyền chủ hộ trước hoặc xóa cả hộ khẩu.");
            }
            // 2. Lấy tên thành viên để ghi log (Tùy chọn)
            const resName = await client.query('SELECT hoten FROM nhankhau WHERE id = $1', [memberId]);
            const memberName = resName.rows[0]?.hoten || 'Thành viên';
            // 3. Thực hiện Xóa (Update sohokhau = NULL)
            const updateQuery = `
                UPDATE nhankhau 
                SET sohokhau = NULL, quanhevoichuho = NULL 
                WHERE id = $1 AND sohokhau = $2
            `;
            const resUpdate = await client.query(updateQuery, [memberId, hkId]);

            if (resUpdate.rowCount === 0) {
                throw new Error("Thành viên này không thuộc hộ khẩu đã chọn.");
            }
            // 4. Ghi lại lịch sử biến động hộ khẩu
            await client.query(
                `INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, CURRENT_DATE)`,
                [hkId, `Xóa thành viên: ${memberName} (ID: ${memberId}) khỏi hộ`]
            );

            await client.query('COMMIT');
            return { message: "Đã xóa thành viên khỏi hộ thành công." };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Lấy thông tin hộ khẩu theo ID
    getById: async (sohokhau) => {
        try {
            const query = `
                SELECT 
                    hk.sohokhau AS "soHoKhau",
                    hk.chuhocccd AS "cccdChuHo",
                    nk.hoten AS "tenChuHo",
                    hk.sonha AS "soNha",
                    hk.duong AS "duong",
                    hk.phuong AS "phuong",
                    hk.quan AS "quan",
                    hk.tinh AS "tinh",
                    hk.ngaylap AS "ngayLap",
                    hk.ghichu AS "ghiChu"
                FROM hokhau hk
                LEFT JOIN nhankhau nk ON hk.chuho_id = nk.id
                WHERE hk.sohokhau = $1
            `;
            const { rows } = await poolQuanLiHoKhau.query(query, [sohokhau]);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model getById:", error);
            throw error;
        }
    },
    
    // Cập nhật thông tin chung hộ khẩu
    updateGeneralInfo: async (hkId, data) => {
        const client = await poolQuanLiHoKhau.connect();
        try {
            await client.query('BEGIN');
            // 1. Lấy thông tin hộ khẩu hiện tại
            const currentHkRes = await client.query('SELECT * FROM hokhau WHERE sohokhau = $1', [hkId]);
            if (currentHkRes.rows.length === 0) throw new Error("Hộ khẩu không tồn tại.");
            const currentHk = currentHkRes.rows[0];
            // 2. Cập nhật các thông tin cơ bản (Địa chỉ, Ngày lập, Ghi chú)
            const updateBasicQuery = `
                UPDATE hokhau 
                SET sonha = $1, duong = $2, phuong = $3, quan = $4, tinh = $5, ngaylap = $6, ghichu = $7
                WHERE sohokhau = $8
            `;
            await client.query(updateBasicQuery, [
                data.DiaChi.SoNha, 
                data.DiaChi.Duong, 
                data.DiaChi.Phuong, 
                data.DiaChi.Quan, 
                data.DiaChi.Tinh, 
                data.NgayLap, 
                data.GhiChu,
                hkId
            ]);
            // 3. Xử lý logic CHỦ HỘ
            // Nếu CCCD gửi lên KHÁC với CCCD chủ hộ hiện tại -> Có sự thay đổi chủ hộ
            if (data.CCCD && data.CCCD !== currentHk.chuhocccd) {
                // a. Tìm người chủ hộ mới trong bảng nhân khẩu
                const newHeadRes = await client.query('SELECT id, hoten, sohokhau FROM nhankhau WHERE cccd = $1', [data.CCCD]);
                if (newHeadRes.rows.length === 0) {
                    throw new Error("Không tìm thấy nhân khẩu với số CCCD này trong hệ thống.");
                }
                const newHead = newHeadRes.rows[0];
                // b. Giáng chức chủ hộ cũ -> Thành viên
                if (currentHk.chuho_id) {
                    await client.query(
                        `UPDATE nhankhau SET quanhevoichuho = 'Thành viên' WHERE id = $1`,
                        [currentHk.chuho_id]
                    );
                }
                // c. Thăng chức chủ hộ mới
                // - Cập nhật quan hệ thành 'Chủ hộ'
                // - Nếu người này đang ở hộ khác, chuyển họ về hộ này luôn
                await client.query(
                    `UPDATE nhankhau SET quanhevoichuho = 'Chủ hộ', sohokhau = $1 WHERE id = $2`,
                    [hkId, newHead.id]
                );
                // d. Cập nhật bảng Hộ khẩu trỏ đến chủ hộ mới
                await client.query(
                    `UPDATE hokhau SET chuho_id = $1, chuhocccd = $2 WHERE sohokhau = $3`,
                    [newHead.id, data.CCCD, hkId]
                );
                // e. Ghi log biến động thay đổi chủ hộ
                await client.query(
                    `INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, CURRENT_DATE)`,
                    [hkId, `Thay đổi chủ hộ: Từ ${currentHk.chuhocccd} sang ${data.CCCD} (${newHead.hoten})`]
                );
            } else {
                // Nếu CCCD vẫn như cũ, chỉ kiểm tra xem có cần cập nhật tên không (Sửa lỗi chính tả tên chủ hộ)
                if (data.HoTen && currentHk.chuho_id) {
                    await client.query('UPDATE nhankhau SET hoten = $1 WHERE id = $2', [data.HoTen, currentHk.chuho_id]);
                }
                // Ghi log thay đổi thông tin thường
                await client.query(
                    `INSERT INTO biendonghokhau (sohokhau, noidungthaydoi, ngaythaydoi) VALUES ($1, $2, CURRENT_DATE)`,
                    [hkId, `Cập nhật thông tin chung.`]
                );
            }
            await client.query('COMMIT');
            return { message: "Cập nhật thông tin hộ khẩu thành công." };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

};

module.exports = HoKhauModel;