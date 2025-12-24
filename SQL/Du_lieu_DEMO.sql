
-- Này là dữ liệu lỏ, ae có thể cân nhắc chạy để lấy thêm dữ liệu nếu muốn test chức năng =))))
-- Nhma nó lỏ (thiếu cccd địa chỉ cacthu), nên nếu ko có nhu cầu test thì ae đừng chạy nhé
-- Nhớ drop mấy cái NOT NULL của cccd ở cuối update_dtb.sql đã nhé, ko nó lỗi á, hqua đổi khóa cacthu nhma t quên drop ròi

BEGIN;

-- 1. TẠO 40 NHÂN KHẨU THƯỜNG TRÚ (CHƯA CÓ HỘ KHẨU)
-- Mục đích: Dùng để test chức năng "Thêm hộ khẩu mới"
-- Những người này có trạng thái 'Thường trú' nhưng cột sohokhau là NULL
INSERT INTO nhankhau (hoten, cccd, gioitinh, ngaysinh, nguyenquan, dantoc, nghenghiep, trangthai, sohokhau)
SELECT 
    'Công Dân Mới ' || i,               -- Tên: Công Dân Mới 1, 2...
    '0000000' || (10000 + i),           -- CCCD giả: 000000010001...
    CASE WHEN i % 2 = 0 THEN 'Nam' ELSE 'Nữ' END,
    '1995-01-01', 
    'Hà Nội', 'Kinh', 'Tự do', 
    'Thường trú', 
    NULL -- Quan trọng: Chưa thuộc hộ nào
FROM generate_series(1, 40) AS i;


-- 2. TẠO 30 NHÂN KHẨU TẠM TRÚ & PHIẾU TẠM TRÚ
-- Mục đích: Test phân trang bảng Tạm trú (3 trang nếu mỗi trang 10 dòng)
WITH inserted_tamtru AS (
    INSERT INTO nhankhau (hoten, cccd, gioitinh, ngaysinh, nguyenquan, dantoc, nghenghiep, trangthai)
    SELECT 
        'Khách Tạm Trú ' || i, 
        '0990000' || (20000 + i), 
        'Nam', 
        '2000-05-05', 
        'Nam Định', 'Kinh', 'Sinh viên', 
        'Tạm trú'
    FROM generate_series(1, 30) AS i
    RETURNING id -- Lấy ID vừa sinh ra để điền vào bảng tamtru
)
INSERT INTO tamtru (nhankhau_id, chuho_id, tungay, denngay, lydo, trangthai, diaphuong)
SELECT 
    id, 
    -- Giả sử ID=1 (Nguyễn Văn A) là chủ nhà trọ cho tất cả bọn này
    (SELECT id FROM nhankhau WHERE hoten = 'Nguyễn Văn A' LIMIT 1), 
    CURRENT_DATE - INTERVAL '1 month', -- Đã đến cách đây 1 tháng
    CURRENT_DATE + INTERVAL '6 months', -- Hết hạn sau 6 tháng
    'Học tập và làm việc', 
    'Còn hạn',
    'Tại hộ ông Nguyễn Văn A (Dữ liệu Test)'
FROM inserted_tamtru;


-- 3. TẠO 30 NHÂN KHẨU TẠM VẮNG & PHIẾU TẠM VẮNG
-- Mục đích: Test phân trang bảng Tạm vắng
WITH inserted_tamvang AS (
    INSERT INTO nhankhau (hoten, cccd, gioitinh, ngaysinh, nguyenquan, dantoc, nghenghiep, trangthai, sohokhau)
    SELECT 
        'Người Tạm Vắng ' || i, 
        '0880000' || (30000 + i), 
        'Nữ', 
        '1998-08-08', 
        'Hà Nội', 'Kinh', 'Đi công tác', 
        'Tạm vắng',
        'HK001' -- Gán tạm vào hộ HK001 để hợp lệ logic (vắng mặt khỏi nơi thường trú)
    FROM generate_series(1, 30) AS i
    RETURNING id
)
INSERT INTO tamvang (nhankhau_id, tungay, denngay, lydo, trangthai)
SELECT 
    id, 
    CURRENT_DATE - INTERVAL '5 days', 
    CURRENT_DATE + INTERVAL '10 days', 
    'Đi du lịch hè', 
    'Còn hạn'
FROM inserted_tamvang;

COMMIT;

-- KIỂM TRA LẠI DỮ LIỆU
SELECT COUNT(*) as "Số lượng Tạm Trú" FROM tamtru;
SELECT COUNT(*) as "Số lượng Tạm Vắng" FROM tamvang;
SELECT COUNT(*) as "Dân chưa có hộ" FROM nhankhau WHERE sohokhau IS NULL;