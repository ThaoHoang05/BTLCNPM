ALTER TABLE DangKySuDung
    ADD COLUMN Email VARCHAR(100);

ALTER TABLE DangKySuDung
    ADD COLUMN LoaiHinhThue VARCHAR(20)
        CHECK (LoaiHinhThue IN ('CaNhan','ToChuc'));

ALTER TABLE DangKySuDung
    ADD COLUMN LyDo TEXT;

ALTER TABLE DangKySuDung ALTER COLUMN TrangThai SET DEFAULT 'Chờ duyệt';

ALTER TABLE DangKySuDung ALTER COLUMN TenSuKien DROP NOT NULL;

//sua lai ttin bang nhan khau tam tru tam vang

ALTER TABLE NhanKhau DROP CONSTRAINT IF EXISTS nhankhau_trangthai_check;

ALTER TABLE NhanKhau ADD CONSTRAINT nhankhau_trangthai_check
    CHECK (TrangThai IN ('Thường trú', 'Tạm trú', 'Tạm vắng', 'Chuyển đi', 'Qua đời', 'Mới sinh'));

ALTER TABLE TamVang
    ADD COLUMN TrangThai VARCHAR(20) DEFAULT 'Còn hạn'
        CHECK (TrangThai IN ('Đã về', 'Còn hạn', 'Quá hạn'));

ALTER TABLE TamTru
    ADD COLUMN TrangThai VARCHAR(20) DEFAULT 'Còn hạn'
        CHECK (TrangThai IN ('Chuyển đi', 'Còn hạn', 'Quá hạn'));