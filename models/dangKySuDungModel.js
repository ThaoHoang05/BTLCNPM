/** @type {import('../config/db')} */
const { poolQuanLiNhaVanHoa } = require('../config/db'); // Lấy đúng pool này ra

/**
 * @param {Object} d
 * @param {string} d.hoten
 * @param {string} d.phone
 * @param {string} d.email
 * @param {string} d.loai
 * @param {string} d.lydo
 * @param {string | Date} d.batdau
 * @param {string | Date} d.ketthuc
 */
exports.guiDangKy = (d) => {
    // Thay db.query bằng poolQuanLiNhaVanHoa.query
    return poolQuanLiNhaVanHoa.query(`
        INSERT INTO DangKySuDung
        (HoTenNguoiDangKy, DienThoai, Email, LoaiHinhThue, LyDo, ThoiGianBatDau, ThoiGianKetThuc)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
        d.hoten,   // $1
        d.phone,   // $2
        d.email,   // $3
        d.loai,    // $4
        d.lydo,    // $5
        d.batdau,  // $6
        d.ketthuc  // $7
    ]);
};