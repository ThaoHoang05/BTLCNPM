const {poolDangNhapPhanQuyen} = require('../config/db');
const {poolQuanLiHoKhau} = require('../config/db');

const accountModel = {
    getAll: async () => {
        const query = 'select * from nguoidung left join vaitro on nguoidung.vaitroid = vaitro.vaitroid';
        const { rows } = await poolDangNhapPhanQuyen.query(query);
        return rows;
    },
    getNameByUsername: async (username) => {
        const query = 'SELECT hoten FROM nhankhau WHERE cccd = $1';
        const values = [username];
        const { rows } = await poolQuanLiHoKhau.query(query, values);
        return rows[0] ? rows[0].hoten : null;
    },
    // Giả định đặt trong accountModel.js hoặc tương đương
countAccountStats: async () => {
    try {
        const query = `
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN trangthai = 'HoatDong' THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN trangthai = 'Khoa' THEN 1 ELSE 0 END) AS locked
            FROM nguoidung
        `;
        const { rows } = await poolDangNhapPhanQuyen.query(query);
        return {
            total: parseInt(rows[0].total) || 0,
            active: parseInt(rows[0].active) || 0,
            locked: parseInt(rows[0].locked) || 0
        };
    } catch (error) {
        console.error("Lỗi Model countAccountStats:", error);
        throw error;
    }
},
create: async (data) => {
    const query = `
        INSERT INTO nguoidung (tendangnhap, matkhauhash, trangthai, vaitroid, cccd)
        VALUES ($1, $2, 'HoatDong', $3, $4)
        RETURNING *`;
    const values = [data.username, data.password, data.vaitroid, data.username];
    const { rows } = await poolDangNhapPhanQuyen.query(query, values);
    return rows[0];
},

// Sửa tài khoản (PATCH - Cập nhật linh hoạt)
update: async (username, updateData) => {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    const values = Object.values(updateData);
    values.push(username);

    const query = `
        UPDATE nguoidung 
        SET ${setClause} 
        WHERE tendangnhap = $${values.length}
        RETURNING *`;
    const { rows } = await poolDangNhapPhanQuyen.query(query, values);
    return rows[0];
},

// Khóa/Mở tài khoản
updateStatus: async (username, newStatus) => {
    const query = 'UPDATE nguoidung SET trangthai = $1 WHERE tendangnhap = $2 RETURNING *';
    const { rows } = await poolDangNhapPhanQuyen.query(query, [newStatus, username]);
    return rows[0];
},

// Reset mật khẩu
resetPassword: async (username, newPassHash) => {
    const query = 'UPDATE nguoidung SET matkhauhash = $1 WHERE tendangnhap = $2';
    await poolDangNhapPhanQuyen.query(query, [newPassHash, username]);
},
getNameBycccd: async (cccd) => {
    // Truy vấn lấy họ tên từ bảng nhankhau ở pool hộ khẩu dựa trên số CCCD
    const query = 'SELECT hoten FROM nhankhau WHERE cccd = $1';
    const values = [cccd];
    const { rows } = await poolQuanLiHoKhau.query(query, values);
    return rows[0] ? rows[0].hoten : null; // Trả về họ tên hoặc null nếu không thấy
},
}

module.exports = accountModel;