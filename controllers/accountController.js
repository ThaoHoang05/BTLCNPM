const accountModel = require('../models/accountModel');
const accountController = {
    getAccountDashboardStats: async (req, res) => {
        try {
            const stats = await accountModel.countAccountStats();
            
            res.status(200).json({
                status: 'success',
                data: {
                    totalAccounts: stats.total,
                    activeAccounts: stats.active,
                    lockedAccounts: stats.locked
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: "Lỗi khi lấy thống kê tài khoản: " + error.message
            });
        }
    },
    getAccountsWithFullInfo: async (req, res) => {
        try {
            // Bước 1: Lấy danh sách tài khoản và vai trò từ poolDangNhapPhanQuyen
            const accounts = await accountModel.getAll();

            // Bước 2: Duyệt qua từng tài khoản để lấy họ tên từ poolQuanLiHoKhau
            // Chúng ta sử dụng Promise.all để các truy vấn chạy song song, tối ưu thời gian
            const accountsWithNames = await Promise.all(accounts.map(async (acc) => {
                // Giả định cột tendangnhap trong bảng nguoidung chứa số CCCD
                const fullName = await accountModel.getNameByUsername(acc.tendangnhap);
                
                return {
                    ...acc,
                    hoten: fullName || 'Chưa cập nhật' // Gán thêm trường hoten vào object
                };
            }));

            // Bước 3: Trả về dữ liệu cho Frontend
            res.status(200).json({
                status: 'success',
                data: accountsWithNames
            });
        } catch (error) {
            console.error("Lỗi tại getAccountsWithFullInfo:", error);
            res.status(500).json({
                status: 'error',
                message: "Không thể lấy danh sách tài khoản kèm họ tên"
            });
        }
    },

    // PATCH: Cập nhật thông tin (Vai trò, v.v.)
    patchAccount: async (req, res) => {
        try {
            const { username } = req.params;
            const updateData = req.body; // VD: { vaitroid: 2 }

            const updated = await accountModel.update(username, updateData);
            if (!updated) return res.status(404).json({ status: 'error', message: "Không tìm thấy tài khoản" });

            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // PATCH: Khóa/Mở khóa tài khoản
    toggleLock: async (req, res) => {
        try {
            const { username } = req.params;
            const { currentStatus } = req.body;
            const newStatus = (currentStatus === 'HoatDong') ? 'Khoa' : 'HoatDong';

            const result = await accountModel.updateStatus(username, newStatus);
            res.status(200).json({ 
                status: 'success', 
                message: `Đã ${newStatus === 'Khoa' ? 'Khóa' : 'Mở khóa'} tài khoản`,
                data: result 
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: "Lỗi thao tác trạng thái" });
        }
    },

    // PATCH: Reset mật khẩu về mặc định
    resetPassword: async (req, res) => {
        try {
            const { username } = req.params;
            const defaultPass = '123456'; // Mật khẩu mặc định

            await accountModel.resetPassword(username, defaultPass);
            res.status(200).json({ status: 'success', message: "Đã reset mật khẩu về: " + defaultPass });
        } catch (error) {
            res.status(500).json({ status: 'error', message: "Lỗi reset mật khẩu" });
        }
    },
    checkResident: async (req, res) => {
        try {
            const { cccd } = req.params;
            const hoten = await accountModel.getNameBycccd(cccd);
            if (hoten) {
                return res.json({ status: 'success', hoten });
            }
            res.status(404).json({ status: 'error', message: "Số CCCD này không có trong bảng nhân khẩu" });
        } catch (error) {
            res.status(500).json({ status: 'error', message: "Lỗi máy chủ" });
        }
    },

    // POST: Tạo tài khoản mới
    createAccount: async (req, res) => {
        try {
            const { username, password, vaitroid, fullname } = req.body;
            const roleId = parseInt(vaitroid); // Đảm bảo là số nguyên cho kiểu SERIAL

            // ĐIỀU KIỆN ĐẶC BIỆT: Chỉ kiểm tra nhân khẩu nếu là Cư dân (ID = 4)
            if (roleId === 4) {
                const checkName = await accountModel.getNameByCCCD(username);
                if (!checkName) {
                    return res.status(400).json({ 
                        status: 'error', 
                        message: "Với vai trò Cư dân, CCCD phải tồn tại trong bảng nhân khẩu!" 
                    });
                }
            }

            // Thực hiện tạo tài khoản (Dùng fullname từ form nếu không phải cư dân)
            const newAcc = await accountModel.create({
                username,
                password: password || '123456',
                vaitroid: roleId
            });

            res.status(201).json({ status: 'success', message: "Tạo tài khoản thành công" });
        } catch (error) {
            console.error("Lỗi 500:", error); // Xem log này để debug lỗi image_833a83.png
            res.status(500).json({ status: 'error', message: "Tài khoản đã tồn tại hoặc lỗi SQL" });
        }
    }
};
module.exports = accountController;