const model = require('../models/dangKySuDungModel');

exports.guiDangKy = async (req, res) => {
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
};
