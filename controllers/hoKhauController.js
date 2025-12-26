const HoKhauModel = require('../models/hoKhauModel');

const hoKhauController = {
    getDashboardStats: async (req, res) => {
        try {
            const stats = await HoKhauModel.getDashboardStats();
            res.status(200).json(stats); // Trả về kết quả cho home.js
        } catch (error) {
            res.status(500).json({ message: "Lỗi Server" });
        }
    },

    getHouseholdDetail: async (req, res) => {
        const { id } = req.params; // Lấy :id từ URL
        try {
            const data = await HoKhauModel.getDetail(id);
            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy hộ khẩu này" });
            }
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy chi tiết hộ khẩu" });
        }
    },

    getHoKhauList: async (req, res) => {
    try {
        const data = await HoKhauModel.getHoKhauData();
        // Trả về dữ liệu với mã 200 (Thành công)
        res.status(200).json(data);
    } catch (err) {
        // Log lỗi chi tiết ra console của terminal để kiểm tra nếu còn lỗi
        console.error("Lỗi tại showHoKhauController:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống khi tải danh sách hộ khẩu" });
    }
    },

    createHousehold: async (req, res) => {
        try {
            const result = await HoKhauModel.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("Lỗi Controller createHousehold:", error.message);
            res.status(500).json({ message: "Lỗi Server khi tạo hộ khẩu" });
        }
    },

    splitHousehold: async (req, res) => {
        const { id } = req.params; // ID hộ cũ
        try {
            const result = await HoKhauModel.split(id, req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("Lỗi tách hộ:", error.message);
            res.status(500).json({ message: error.message || "Lỗi khi tách hộ" });
        }
    },

    deleteHousehold: async (req, res) => {
        const { id } = req.params;
        try {
            const rowsDeleted = await HoKhauModel.deleteHoKhau(id);
            if (rowsDeleted === 0) {
                return res.status(404).json({ message: "Không tìm thấy mã hộ khẩu để xóa" });
            }
            res.status(200).json({ message: `Đã xóa thành công hộ khẩu ${id} và các nhân khẩu liên quan.` });
        } catch (error) {
            console.error("Lỗi xóa hộ khẩu:", error.message);
            res.status(500).json({ message: "Lỗi hệ thống khi xóa hộ khẩu" });
        }
    },

    removeMember: async (req, res) => {
        try {
            const { idHK, idNK } = req.params;
            await HoKhauModel.removeMember(idHK, idNK);
            res.status(200).json({ message: "Đã xóa thành viên khỏi hộ khẩu." });
        } catch (error) {
            console.error("Lỗi xóa thành viên:", error.message);
            res.status(400).json({ message: error.message || "Lỗi hệ thống." });
        }
    },

    getHouseholdInfo: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await HoKhauModel.getById(id);
            
            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy hộ khẩu này." });
            }
            res.status(200).json(data);
        } catch (error) {
            console.error("Lỗi lấy thông tin hộ khẩu:", error);
            res.status(500).json({ message: "Lỗi hệ thống." });
        }
    },
    
    updateGeneralInfo: async (req, res) => {
        try {
            const { id } = req.params; // Lấy mã hộ khẩu (VD: HK001)
            const data = req.body;     // Dữ liệu gửi lên

            // Validate sơ bộ
            if (!data.CCCD || !data.HoTen) {
                return res.status(400).json({ message: "Thiếu thông tin chủ hộ (Họ tên/CCCD)." });
            }

            await HoKhauModel.updateGeneralInfo(id, data);
            
            res.status(200).json({ message: "Cập nhật thành công." });
        } catch (error) {
            console.error("Lỗi cập nhật hộ khẩu:", error.message);
            res.status(500).json({ message: error.message || "Lỗi hệ thống." });
        }
    },
    getByCCCD: async (req, res) => {
        try {
            const { cccd } = req.params; // Lấy CCCD từ URL
            
            if (!cccd) {
                return res.status(400).json({ message: "Vui lòng cung cấp CCCD" });
            }

            const result = await HoKhauModel.findHoKhauByCCCD(cccd);

            if (!result || !result.sohokhau) {
                return res.status(404).json({ message: "Không tìm thấy hộ khẩu cho CCCD này" });
            }

            // Trả về mã hộ khẩu
            return res.status(200).json({ success: true, sohokhau: result.sohokhau });
        } catch (error) {
            console.error("Lỗi Controller getByCCCD:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    },
};

module.exports = hoKhauController;