const { poolQuanLiHoKhau } = require('../config/db');

const RequestModel = {
    create: async (data) => {
        try {
            const query = `
                INSERT INTO yeu_cau_cu_dan (
                    nguoi_yeu_cau, 
                    doi_tuong_id, 
                    loai_yeu_cau, 
                    thong_tin_json, 
                    trang_thai
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `;
            const values = [
                data.nguoiYeuCau, // CCCD người gửi (User logged in)
                data.doiTuongId,  // ID/CCCD của đối tượng được tác động (Hộ khẩu hoặc Nhân khẩu)
                data.loaiYeuCau,  // 'Sửa Hộ Khẩu', 'Sửa Nhân Khẩu', 'Tạm Trú', 'Tạm Vắng'
                JSON.stringify(data.thongTin), // Payload chi tiết
                data.status || 'Chờ duyệt'
            ];

            const { rows } = await poolQuanLiHoKhau.query(query, values);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model RequestModel.create:", error);
            throw error;
        }
    },
    
    // Lấy lịch sử yêu cầu của một người
    getHistoryByCCCD: async (cccd) => {
        try {
            const query = `
                SELECT * FROM yeu_cau_cu_dan 
                WHERE nguoi_yeu_cau = $1 
                ORDER BY ngay_yeu_cau DESC
            `;
            const { rows } = await poolQuanLiHoKhau.query(query, [cccd]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = RequestModel;