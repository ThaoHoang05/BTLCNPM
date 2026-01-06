const { poolQuanLiHoKhau } = require('../config/db');

const RequestModel = {
    create: async (data) => {
        try {
            const query = `
                INSERT INTO yeu_cau_cu_dan (
                    nguoi_yeu_cau, 
                    doi_tuong_id, 
                    loai_yeu_cau, 
                    thong_tin_yeu_cau, 
                    trang_thai
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `;
            const values = [
                data.nguoiYeuCau, 
                data.doiTuongId,  
                data.loaiYeuCau,  
                JSON.stringify(data.thongTin), 
                data.status || 'Chờ duyệt'
            ];

            const { rows } = await poolQuanLiHoKhau.query(query, values);
            return rows[0];
        } catch (error) {
            console.error("Lỗi Model RequestModel.create:", error);
            throw error;
        }
    },
    
    // Hàm getHistoryByCCCD giữ nguyên vì SELECT * sẽ tự lấy đúng tên cột
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
    },
    getHoKhauId: async (cccd) => {
            try {
                // 1. Câu lệnh SQL
                const query = `SELECT sohokhau FROM nhankhau WHERE cccd = $1`;
                
                // 2. Thực thi query (Bỏ dòng BEGIN đi)
                const { rows } = await poolQuanLiHoKhau.query(query, [cccd]);
        
                // 3. Kiểm tra kết quả và trả về
                if (rows.length > 0) {
                    // Trả về giá trị sohokhau (ví dụ: "HK001")
                    return rows[0].sohokhau;
                } else {
                    // Không tìm thấy nhân khẩu hoặc nhân khẩu chưa có hộ khẩu
                    return null;
                }
        
            } catch (error) {
                console.error("Lỗi Model getHoKhauId:", error);
                throw error;
            }
        },
};

module.exports = RequestModel;