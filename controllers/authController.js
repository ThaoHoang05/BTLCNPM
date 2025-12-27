const AuthModel = require('../models/authModel');

const authController = {
    handleLogin: async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await AuthModel.findUserForLogin(username);
            
            if (!user) {
                console.log(`[LOGIN FAILED] User not found: ${username}`);
                return res.status(401).json({ 
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' 
                });
            }

            if (user.matkhauhash !== password) {
                console.log(`[LOGIN FAILED] Wrong password for user: ${username}`);
                return res.status(401).json({ 
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' 
                });
            }

            // Login thành công
            console.log(`[LOGIN SUCCESS] User: ${username} | Role: ${user.role}`);
            
            return res.status(200).json({
                success: true,
                token: 'mock_token_for_localStorage',
                user: {
                    username: user.tendangnhap,
                    role: user.role,
                    canboId: user.canboid 
                }
            });

        } catch (error) {
            console.error("[SYSTEM ERROR]:", error);
            return res.status(500).json({ 
                success: false, 
                message: 'Đã xảy ra lỗi hệ thống tại Backend' 
            });
        }
    },

    handleLogout: (req, res) => {
        console.log(`[LOGOUT] Người dùng vừa đăng xuất`);
        return res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
    },

    // Xử lý đổi mật khẩu
    changePassword: async (req, res) => {
        try {
            const { id } = req.params; // Ở đây id là username
            const { password } = req.body; // Mật khẩu mới

            if (!password) {
                return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới." });
            }

            const rowCount = await AuthModel.changePassword(id, password);

            if (rowCount > 0) {
                return res.status(200).json({ message: "Đổi mật khẩu thành công." });
            } else {
                return res.status(404).json({ message: "Không tìm thấy người dùng." });
            }

        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            return res.status(500).json({ message: "Lỗi hệ thống." });
        }
    },
};

module.exports = authController;