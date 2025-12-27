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