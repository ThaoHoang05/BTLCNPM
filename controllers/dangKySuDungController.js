const model = require('../models/dangKySuDungModel');

const dangKySuDungController = {
    guiDangKy: async (req, res) => {
        try {
            const d = req.body;
            
            // Gọi model để lưu vào DB
            await model.guiDangKy({
                hoten: d.hoten,
                cccd: d.cccd,          // Mới
                phone: d.phone,
                email: d.email,
                loai: d.loai,          // Giữ nguyên giá trị từ form (personal/organization) hoặc map lại tùy logic
                tenSuKien: d.tenSuKien,// Mới
                diaDiem: d.diaDiem,    // Mới
                lydo: d.lydo,
                batdau: d.batdau,
                ketthuc: d.ketthuc
            });

            res.status(200).json({ message: 'Đã gửi yêu cầu sử dụng nhà văn hóa thành công' });
        } catch (error) {
            console.error("Lỗi controller guiDangKy:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi gửi đăng ký" });
        }
    },

    // Lấy danh sách đơn chờ duyệt
    getPendingList: async (req, res) => {
        try {
            const rawData = await model.getPendingList();
            const responseData = rawData.map(item => ({
                id: item.id,
                hoTen: item.hoTen,
                tenHD: item.tenHD,
                loaiHinh: item.loaiHinh,
                thoiGian: {
                    tu: item.tu,
                    den: item.den
                }
            }));

            res.status(200).json(responseData);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy danh sách chờ duyệt" });
        }
    },

    // Lấy danh sách đơn đã duyệt
    getHistoryList: async (req, res) => {
        try {
            const rawData = await model.getHistoryList();
            const responseData = rawData.map(item => ({
                id: item.id,
                hoTen: item.hoTen,
                tenHD: item.tenHD,
                loaiHinh: item.loaiHinh,
                trangThai: item.trangThai,
                thoiGian: {
                    tu: item.tu,
                    den: item.den
                }
            }));

            res.status(200).json(responseData);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy lịch sử duyệt" });
        }
    },

    // Xem chi tiết đơn đã duyệt
    getHistoryDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await model.getHistoryDetail(id);
            if (!item) {
                return res.status(404).json({ message: "Không tìm thấy đơn đăng ký này" });
            }
            const responseData = {
                hoTen: item.hoTen,
                sdt: item.sdt || "Không có",
                email: item.email || "Không có",
                loaiHinh: item.loaiHinh === 'CaNhan' ? 'Cá nhân' : 'Tổ chức',
                thoigian: {
                    tu: item.tu,
                    den: item.den
                },
                phi: item.phi ? parseInt(item.phi) : 0, // Chuyển về số
                phong: item.phong || "Chưa xếp phòng / Đã từ chối",
                tenHD: item.tenHD
            };
            res.status(200).json(responseData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn" });
        }
    },

};

module.exports = dangKySuDungController;
