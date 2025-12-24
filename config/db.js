require('dotenv').config(); //nạp dữ liệu từ file .env
const { Pool } = require('pg');

// Cấu hình kết nối chung
const commonConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

// Tạo 3 pool cho các database
const poolQuanLiHoKhau = new Pool({ ...commonConfig, database: process.env.DB_QUAN_LI_HO_KHAU });
const poolQuanLiNhaVanHoa = new Pool({ ...commonConfig, database: process.env.DB_QUAN_LI_NHA_VAN_HOA });
const poolDangNhapPhanQuyen = new Pool({ ...commonConfig, database: process.env.DB_DANG_NHAP_PHAN_QUYEN });
const poolThongKeBaoCao = new Pool({ ...commonConfig, database: process.env.DB_THONG_KE_BAO_CAO });

module.exports = {
    poolQuanLiHoKhau,
    poolQuanLiNhaVanHoa,
    poolDangNhapPhanQuyen,
    poolThongKeBaoCao,
};