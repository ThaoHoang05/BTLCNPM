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
const poolHoKhau = new Pool({ ...commonConfig, database: process.env.DB_HO_KHAU });
const poolNhaVanHoa = new Pool({ ...commonConfig, database: process.env.DB_NHA_VAN_HOA });
const poolPhanQuyen = new Pool({ ...commonConfig, database: process.env.DB_PHAN_QUYEN });

module.exports = {
    poolHoKhau,
    poolNhaVanHoa,
    poolPhanQuyen
};