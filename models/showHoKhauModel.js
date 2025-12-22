const { poolQuanLiHoKhau } = require('../config/db');

const getHoKhauData = async () => {
    // Sử dụng tên bảng viết thường: hokhau, nhankhau để khớp với Database
    const query = `
        SELECT
            hk.sohokhau AS "Mã hộ khẩu",
            nk.hoten AS "Chủ hộ",
            CONCAT(hk.sonha, ' ', hk.duong, ', ', hk.phuong, ', ', hk.quan, ', ', hk.tinh) AS "Địa chỉ",
            hk.ngaylap AS "Ngày lập sổ"
        FROM hokhau hk
                 LEFT JOIN nhankhau nk ON hk.chuhocccd = nk.cccd;
    `;

    // Thực thi truy vấn
    const { rows } = await poolQuanLiHoKhau.query(query);
    return rows;
};

module.exports = { getHoKhauData };