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
                phongId: d.phongId,    // Mới
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
                cccd: item.cccd || "Không có",              // Mới thêm
                sdt: item.sdt || "Không có",
                email: item.email || "Không có",
                
                // Xử lý hiển thị loại hình (bao gồm cả trường hợp fallback)
                loaiHinh: item.loaiHinh === 'CaNhan' ? 'Cá nhân' : (item.loaiHinh === 'ToChuc' ? 'Tổ chức' : item.loaiHinh),
                
                tenHD: item.tenHD,
                diaDiemMongMuon: item.diaDiemMongMuon || "Chưa chọn", // Tên phòng lấy từ JOIN p_req
                lyDo: item.lyDo || "Không có",              // Mới thêm
                
                thoigian: {
                    tu: item.tu,
                    den: item.den
                },
                
                // Format tiền tệ sang VNĐ cho đẹp
                phi: item.phi ? parseInt(item.phi).toLocaleString('vi-VN') + ' VNĐ' : "Chưa thu phí", 
                phong: item.phongDuocDuyet || "Chưa xếp phòng",       // Tên phòng lấy từ JOIN p_alloc
                trangThai: item.trangThai // Mới thêm (để frontend biết ẩn hiện nút duyệt)
            };

            res.status(200).json(responseData);
        } catch (error) {
            console.error("Lỗi Controller getHistoryDetail:", error);
            res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn" });
        }
    },

    // API: Duyệt đơn (POST /nvh/pending/accept)
    approveRequest: async (req, res) => {
        try {
            // Payload nhận được: { id, phi, trangthai, canbo, phong }
            const { id, phi, canbo, phong } = req.body;

            if (!id || !phong) {
                return res.status(400).json({ message: "Thiếu thông tin ID hoặc Phòng." });
            }

            // Gọi model
            await model.approve(id, {
                phi: phi || 0,
                canbo: canbo || 1, // Mặc định cán bộ ID 1 nếu thiếu
                phong: phong       // ID phòng
            });

            res.status(200).json({ message: "Duyệt đơn thành công." });
        } catch (error) {
            console.error("Lỗi approve:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi duyệt đơn." });
        }
    },

    // API: Từ chối đơn (POST /nvh/pending/reject)
    rejectRequest: async (req, res) => {
        try {
            // Payload nhận được: { id, trangthai, lyDo }
            const { id, lyDo } = req.body;

            if (!id || !lyDo) {
                return res.status(400).json({ message: "Thiếu ID hoặc Lý do từ chối." });
            }

            await model.reject(id, lyDo);

            res.status(200).json({ message: "Đã từ chối đơn đăng ký." });
        } catch (error) {
            console.error("Lỗi reject:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi từ chối đơn." });
        }
    },

};

module.exports = dangKySuDungController;
