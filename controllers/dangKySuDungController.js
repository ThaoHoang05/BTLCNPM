const model = require('../models/dangKySuDungModel');

const dangKySuDungController = {
    guiDangKy: async (req, res) => {
        const d = req.body;
        await model.guiDangKy({
            hoten: d.hoten,
            phone: d.phone,
            email: d.email,
            loai: d.loai === 'personal' ? 'CaNhan' : 'ToChuc',
            lydo: d.lydo,
            batdau: d.batdau,
            ketthuc: d.ketthuc
        });

        res.json({ message: 'Đã gửi yêu cầu sử dụng nhà văn hóa' });
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

};

module.exports = dangKySuDungController;
