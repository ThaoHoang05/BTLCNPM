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
            SELECT u.tendangnhap, u.matkhauhash, v.tenvaitro as role 
            FROM nguoidung u 
            JOIN vaitro v ON u.vaitroid = v.vaitroid 
            WHERE u.tendangnhap = $1`;
        const result = await poolDangNhapPhanQuyen.query(query, [username]);
        return result.rows[0];
    },
};

module.exports = AuthModel;