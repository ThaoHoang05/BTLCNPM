ALTER TABLE public.dangkysudung
ADD COLUMN cccd character varying(20),
ADD COLUMN diadiem character varying(100);

-- 1. Thêm cột phongid vào bảng dangkysudung
ALTER TABLE public.dangkysudung
ADD COLUMN phongid integer;

-- 2. Tạo khóa ngoại liên kết tới bảng phong
ALTER TABLE public.dangkysudung
ADD CONSTRAINT fk_dangkysudung_phong
FOREIGN KEY (phongid) REFERENCES public.phong(phongid);

-- 3. (Tùy chọn) Xóa cột diadiem cũ nếu không dùng nữa
ALTER TABLE public.dangkysudung
DROP COLUMN IF EXISTS diadiem;


--Update trigger (11pm 27/12/2025)
DROP TRIGGER IF EXISTS trg_duyet_tao_lich ON dangkysudung;
DROP TRIGGER IF EXISTS trg_add_lich_rieng ON dangkysudung;

DROP FUNCTION IF EXISTS fn_tao_lich_sau_duyet;
DROP FUNCTION IF EXISTS fn_add_lich_rieng;
CREATE OR REPLACE FUNCTION public.fn_tu_dong_them_lich() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Chỉ chạy khi trạng thái chuyển sang 'Đã duyệt'
    IF NEW.trangthai = 'Đã duyệt' AND OLD.trangthai <> 'Đã duyệt' THEN
        
        -- Kiểm tra xem đơn đã có phongid chưa
        IF NEW.phongid IS NULL THEN
            RAISE EXCEPTION 'Lỗi: Đơn đăng ký chưa có thông tin phòng (phongid is NULL).';
        END IF;

        -- Thực hiện Insert (Lấy NEW.phongid thay vì số 1)
        INSERT INTO lichsudungphong (
            phongid,
            thoigianbatdau,
            thoigianketthuc,
            loaihoatdong,
            dangkyid
        )
        VALUES (
            NEW.phongid,        -- <--- QUAN TRỌNG: Lấy ID phòng thực tế
            NEW.thoigianbatdau,
            NEW.thoigianketthuc,
            'Rieng',
            NEW.dangkyid
        );
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_tu_dong_them_lich
AFTER UPDATE OF trangthai ON dangkysudung
FOR EACH ROW
EXECUTE FUNCTION fn_tu_dong_them_lich();


--update 6pm 28/12/2025 xóa trigger sai
-- Xóa Trigger tự động tạo lịch khi thêm hoạt động chung
DROP TRIGGER IF EXISTS trg_tao_lich_hd_chung ON hoatdongchung;

-- Xóa Function đi kèm 
DROP FUNCTION IF EXISTS fn_tao_lich_hd_chung;


-- Update bảng tài sản (6pm 28/12)
ALTER TABLE TaiSan ADD COLUMN PhongID INT;
ALTER TABLE TaiSan ADD CONSTRAINT fk_taisan_phong FOREIGN KEY (PhongID) REFERENCES Phong(PhongID);

TRUNCATE TABLE kiemtrataisan CASCADE;
DELETE FROM TaiSan;

-- Nạp lại toàn bộ tài sản với ID liên tục và phân bổ phòng hợp lý
INSERT INTO TaiSan (TaiSanID, TenTaiSan, SoLuong, TinhTrang, NhaID, PhongID) VALUES
-- Hội Trường Lớn (ID: 1)
(101, 'Ghế nhựa cao cấp', 150, 'Tốt', 1, 1),
(102, 'Bàn hội nghị', 20, 'Tốt', 1, 1),
(103, 'Hệ thống âm thanh (Bộ)', 1, 'Tốt, mới bảo trì', 1, 1),
(104, 'Máy chiếu (Bộ)', 2, 'Cần thay bóng 1 cái', 1, 1),
(105, 'Quạt treo tường', 15, 'Tốt', 1, 1),
(106, 'Bảng thông báo điện tử', 1, 'Mới 100%', 1, 1),

-- Phòng Sinh Hoạt Cộng Đồng (ID: 2)
(107, 'Tivi Sony 65 inch', 1, 'Tốt', 1, 2),
(108, 'Bộ ấm chén pha trà', 10, 'Tốt', 1, 2),
(109, 'Bình nước nóng lạnh', 2, 'Mới', 1, 2),
(110, 'Tủ kính trưng bày bằng khen', 2, 'Tốt', 1, 2),
(111, 'Bàn ghế sofa tiếp khách', 1, 'Tốt', 1, 2),

-- Phòng Đa Năng (ID: 3)
(112, 'Thảm tập Yoga', 30, 'Tốt', 1, 3),
(113, 'Gương lớn áp tường (m2)', 20, 'Tốt', 1, 3),
(114, 'Bộ dụng cụ tập thể dục', 5, 'Cũ, cần bảo dưỡng', 1, 3),
(115, 'Máy lạnh Inverter 2HP', 4, 'Tốt', 1, 3),
(116, 'Loa Bluetooth di động', 1, 'Tốt', 1, 3),

-- Phòng Thiết Bị (ID: 4)
(117, 'Amply & Micro không dây', 4, 'Tốt', 1, 4),
(118, 'Bộ đàm liên lạc', 12, 'Tốt', 1, 4),
(119, 'Cuộn dây cáp loa 50m', 3, 'Mới', 1, 4),
(120, 'Tủ sắt đựng thiết bị', 2, 'Khóa hơi rít', 1, 4),
(121, 'Bục phát biểu gỗ', 1, 'Tốt', 1, 4),

-- Phòng Sinh hoạt Thanh niên (ID: 5)
(122, 'Bàn làm việc nhóm lớn', 3, 'Tốt', 1, 5),
(123, 'Bảng trắng viết bút dạ', 2, 'Tốt', 1, 5),
(124, 'Bộ trống lân', 2, 'Cũ', 1, 5),
(125, 'Bộ cờ vua, cờ tướng', 15, 'Tốt', 1, 5),
(126, 'Đàn Guitar Acoustic', 3, 'Tốt', 1, 5),
(127, 'Cờ Đoàn, cờ Đội (Bộ)', 5, 'Mới', 1, 5),

-- Phòng Nghiên cứu & Tài liệu (ID: 6)
(128, 'Kệ sách gỗ lớn', 8, 'Mới', 1, 6),
(129, 'Máy tính để bàn', 5, 'Hoạt động bình thường', 1, 6),
(130, 'Máy scan tài liệu', 1, 'Tốt', 1, 6),
(131, 'Bàn đọc sách cá nhân', 10, 'Tốt', 1, 6),
(132, 'Đèn bàn học', 10, 'Tốt', 1, 6),
(133, 'Máy in HP đa năng', 1, 'Hết mực', 1, 6);


