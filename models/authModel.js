const { poolDangNhapPhanQuyen } = require('../config/db');

const AuthModel = {
    // Hàm lấy danh sách tất cả người dùng kèm vai trò
    getAllUsers: async () => {
        const query = `
            SELECT u.tendangnhap, u.trangthai, v.tenvaitro 
            FROM nguoidung u 
            JOIN vaitro v ON u.vaitroid = v.vaitroid`;
        const result = await poolDangNhapPhanQuyen.query(query);
        return result.rows;
    },

    // Hàm tìm user và lấy tên vai trò (role)
    findUserForLogin: async (username) => {
        const query = `
            SELECT u.tendangnhap, 
            u.matkhauhash, 
            u.canboid,
            v.tenvaitro as role 
            FROM nguoidung u 
            JOIN vaitro v ON u.vaitroid = v.vaitroid 
            WHERE u.tendangnhap = $1`;
        const result = await poolDangNhapPhanQuyen.query(query, [username]);
        return result.rows[0];
    },

    // Đổi mật khẩu
    changePassword: async (username, newPassword) => {
        const query = `
            UPDATE nguoidung 
            SET matkhauhash = $1 
            WHERE tendangnhap = $2
        `;
        const result = await poolDangNhapPhanQuyen.query(query, [newPassword, username]);
        return result.rowCount;
    },
};

module.exports = AuthModel;