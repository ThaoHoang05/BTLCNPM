const ThongKeModel = require('../models/thongKeModel');

const ThongKeController = {
    getSummaryReport: async (req, res) => {
        try {
            const { type, period, time } = req.query;

            if (!type || !period || !time) {
                return res.status(400).json({
                    success: false,
                    message: "Cần cung cấp đủ type, period (Tháng/Quý/Năm) và time."
                });
            }

            const result = await ThongKeModel.getSummary(type, period, time);

            if (!result) {
                return res.status(200).json({
                    success: true,
                    message: "Không tìm thấy dữ liệu cho kỳ báo cáo này.",
                    data: null
                });
            }

            // Loại bỏ các trường kỹ thuật của DB trước khi trả về Client
            const { id, ngay_cap_nhat, ...dataResponse } = result;

            return res.status(200).json({
                success: true,
                data: {
                    ...dataResponse,
                    ngay_cap_nhat: result.ngay_cap_nhat // Giữ lại ngày cập nhật cuối cùng
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi Server: " + error.message
            });
        }
    },

    getDetailsReport: async (req, res) => {
        try {
            // Lấy tham số và đặt giá trị mặc định cho phân trang
            const type = req.query.type;
            const period = req.query.period || 'Tháng';
            const time = req.query.time;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!type || !time) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu tham số type hoặc time (MM/YYYY)"
                });
            }

            const result = await ThongKeModel.getDetails(type, period, time, page, limit);

            // Xây dựng Payload trả về theo đúng yêu cầu
            const responseData = {
                total_rows: result.total_rows,
                page: page,
                list: result.list
            };

            // Nếu type là cu_tru, theo yêu cầu của bạn Payload có thể bỏ bớt total_rows/page
            // nhưng thông thường nên giữ để Frontend xử lý phân trang.
            return res.status(200).json({
                success: true,
                data: responseData
            });

        } catch (error) {
            console.error("Lỗi Controller:", error.message);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ nội bộ"
            });
        }
    },
};

module.exports = ThongKeController;