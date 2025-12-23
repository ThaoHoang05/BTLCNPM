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


--update bang tam tru

ALTER TABLE tamtru ADD COLUMN chuhocccd VARCHAR(12);
ALTER TABLE tamtru ADD COLUMN chuho VARCHAR(100);

ALTER TABLE tamtru
    ADD CONSTRAINT fk_chuho_tamtru
        FOREIGN KEY (chuhocccd) REFERENCES nhankhau(cccd);


TRUNCATE TABLE tamtru RESTART IDENTITY;

INSERT INTO tamtru (cccd, chuhocccd, diaphuong, tungay, denngay, lydo) VALUES
                                                                           ('001206000100', '001198000010', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông', '2024-03-01', '2025-07-30', 'Thuê trọ để đi học'),
                                                                           ('001207000101', '001198000010', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông', '2024-03-01', '2025-07-30', 'Thuê trọ để đi học'),
                                                                           ('001208000102', '001198000010', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông', '2024-03-01', '2025-07-30', 'Thuê trọ để làm việc'),
                                                                           ('001209000103', '001198000010', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông', '2024-03-01', '2025-07-30', 'Thuê trọ để đi học'),
                                                                           ('001210000104', '001190000001', '10A Nguyễn Trãi, P. La Khê, Q. Hà Đông', '2024-11-01', '2025-05-30', 'Thuê trọ để đi học'),
                                                                           ('001211000105', '001185000002', '12 Nguyễn Trãi, P. La Khê, Q. Hà Đông', '2024-10-15', '2025-10-15', 'Thuê trọ để làm việc');

UPDATE tamtru t
SET chuho = n.hoten
    FROM nhankhau n
WHERE t.chuhocccd = n.cccd;


--update bang trạng thái tạm trú
UPDATE nhankhau
SET trangthai = 'Tạm trú'
WHERE trangthai = 'default'
   OR trangthai IS NULL;
