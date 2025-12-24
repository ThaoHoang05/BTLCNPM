-- Thêm cột ID tự tăng (SERIAL) vào bảng Nhân Khẩu
ALTER TABLE nhankhau ADD COLUMN id SERIAL;

-- Thêm các cột ID tham chiếu mới vào các bảng liên quan
ALTER TABLE hokhau ADD COLUMN chuho_id INTEGER;
ALTER TABLE biendongnhankhau ADD COLUMN nhankhau_id INTEGER;
ALTER TABLE tamtru ADD COLUMN nhankhau_id INTEGER;
ALTER TABLE tamtru ADD COLUMN chuho_id INTEGER; -- ID chủ nhà trọ/bảo lãnh
ALTER TABLE tamvang ADD COLUMN nhankhau_id INTEGER;

-- Ánh xạ dữ liệu từ CCCD sang ID mới cho các bảng
UPDATE hokhau h SET chuho_id = n.id FROM nhankhau n WHERE h.chuhocccd = n.cccd;
UPDATE biendongnhankhau b SET nhankhau_id = n.id FROM nhankhau n WHERE b.cccd = n.cccd;
UPDATE tamtru t SET nhankhau_id = n.id FROM nhankhau n WHERE t.cccd = n.cccd;
UPDATE tamtru t SET chuho_id = n.id FROM nhankhau n WHERE t.chuhocccd = n.cccd;
UPDATE tamvang v SET nhankhau_id = n.id FROM nhankhau n WHERE v.cccd = n.cccd;

-- Xóa các ràng buộc khóa ngoại cũ dựa trên CCCD
ALTER TABLE nhankhau DROP CONSTRAINT nhankhau_pkey CASCADE;

-- Thiết lập ID làm Khóa chính mới cho bảng Nhân Khẩu
ALTER TABLE nhankhau ADD PRIMARY KEY (id);

-- Cho phép cột CCCD được để trống (dành cho trẻ em/mới sinh)
ALTER TABLE nhankhau ALTER COLUMN cccd DROP NOT NULL;
ALTER TABLE nhankhau ADD CONSTRAINT unique_cccd UNIQUE (cccd);

-- Thiết lập các ràng buộc khóa ngoại mới dựa trên ID (Số nguyên)
ALTER TABLE hokhau 
    ADD CONSTRAINT fk_chuho_id FOREIGN KEY (chuho_id) REFERENCES nhankhau(id);
ALTER TABLE biendongnhankhau 
    ADD CONSTRAINT fk_biendong_nhankhau_id FOREIGN KEY (nhankhau_id) REFERENCES nhankhau(id) ON DELETE CASCADE;
ALTER TABLE tamtru 
    ADD CONSTRAINT fk_tamtru_nhankhau_id FOREIGN KEY (nhankhau_id) REFERENCES nhankhau(id);
ALTER TABLE tamtru 
    ADD CONSTRAINT fk_tamtru_chuho_id FOREIGN KEY (chuho_id) REFERENCES nhankhau(id);
ALTER TABLE tamvang 
    ADD CONSTRAINT fk_tamvang_nhankhau_id FOREIGN KEY (nhankhau_id) REFERENCES nhankhau(id);

-- Xóa các cột CCCD cũ ở các bảng phụ nếu không còn dùng để join (t chưa biết có nên xóa ko, mà thoi giữ lại cũng ko ảnh hưởng gì)
-- ALTER TABLE hokhau DROP COLUMN chuhocccd;
-- ALTER TABLE tamtru DROP COLUMN cccd, DROP COLUMN chuhocccd;