const { poolPhanQuyen } = require('../config/db');

const AuthModel = {
    // Hàm lấy danh sách tất cả người dùng kèm vai trò
    getAllUsers: async () => {
        const query = `
            SELECT u.tendangnhap, u.trangthai, v.tenvaitro 
            FROM nguoidung u 
            JOIN vaitro v ON u.vaitroid = v.vaitroid`;
        const result = await poolPhanQuyen.query(query);
        return result.rows;
    }
};

module.exports = AuthModel;