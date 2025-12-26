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