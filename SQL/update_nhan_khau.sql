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

-- Khởi tạo nạp 12 hộ
TRUNCATE TABLE tamtru, tamvang, biendongnhankhau, biendonghokhau, tachho, hokhau, nhankhau RESTART IDENTITY CASCADE;

INSERT INTO HoKhau (SoHoKhau, SoNha, Duong, Phuong, Quan, Tinh, NgayLap, GhiChu) VALUES
                                                                                     ('HK001', '10A', 'Nguyễn Trãi', 'La Khê', 'Hà Đông', 'Hà Nội', '2010-05-15', 'Hộ Tổ trưởng Nguyễn Văn A'),
                                                                                     ('HK002', '12', 'Nguyễn Trãi', 'La Khê', 'Hà Đông', 'Hà Nội', '2012-11-20', 'Hộ Tổ phó Trần Thị B'),
                                                                                     ('HK003', 'B202', 'Lê Lợi', 'La Khê', 'Hà Đông', 'Hà Nội', '2015-01-01', 'Hộ NV QL CSVC 1 Lê Văn C'),
                                                                                     ('HK004', '35', 'Lê Lợi', 'La Khê', 'Hà Đông', 'Hà Nội', '2008-08-08', 'Hộ có NV QL CSVC 2 Phạm Văn Z'),
                                                                                     ('HK005', 'C15', 'Quang Trung', 'La Khê', 'Hà Đông', 'Hà Nội', '2018-03-10', 'Vợ chồng trẻ'),
                                                                                     ('HK006', '22', 'Quang Trung', 'La Khê', 'Hà Đông', 'Hà Nội', '2020-07-07', 'Chủ hộ là người lớn tuổi'),
                                                                                     ('HK007', 'D10', 'Ngô Thì Nhậm', 'La Khê', 'Hà Đông', 'Hà Nội', '2011-04-25', 'Hộ có người dân tộc thiểu số'),
                                                                                     ('HK008', '5A', 'Ngô Thì Nhậm', 'La Khê', 'Hà Đông', 'Hà Nội', '2019-12-12', 'Hộ có người tạm vắng'),
                                                                                     ('HK009', '17', 'Phùng Hưng', 'La Khê', 'Hà Đông', 'Hà Nội', '2014-06-18', NULL),
                                                                                     ('HK010', 'E3', 'Phùng Hưng', 'La Khê', 'Hà Đông', 'Hà Nội', '2017-09-30', 'Hộ chủ nhà trọ sinh viên'),
                                                                                     ('HK011', '33', 'Nguyễn Viết Xuân', 'La Khê', 'Hà Đông', 'Hà Nội', '2022-02-01', 'Hộ mới sinh'),
                                                                                     ('HK012', '45', 'Nguyễn Viết Xuân', 'La Khê', 'Hà Đông', 'Hà Nội', '2023-10-28', 'Hộ mới lập do tách từ HK001');

-- Nạp nhân khẩu
INSERT INTO NhanKhau (CCCD, HoTen, GioiTinh, NgaySinh, NoiSinh, NguyenQuan, DanToc, NgheNghiep, NoiLamViec, NgayCapCCCD, NoiCapCCCD, NgayDKThuongTru, QuanHeVoiChuHo, SoHoKhau, TrangThai) VALUES
-- HK001
('001190000001', 'Nguyễn Văn A', 'Nam', '1990-01-01', 'Hà Nội', 'Hà Nội', 'Kinh', 'Tổ trưởng', 'Nhà Văn Hóa', '2020-01-01', 'Hà Nội', '2010-05-15', 'Chủ hộ', 'HK001', 'Thường trú'),
('001192000013', 'Lê Thị P', 'Nữ', '1992-03-20', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kế toán', 'Công ty ABC', '2020-03-20', 'Hà Nội', '2010-05-15', 'Vợ', 'HK001', 'Thường trú'),
(NULL, 'Nguyễn Văn Con1', 'Nam', '2015-08-10', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường La Khê', NULL, NULL, '2015-08-10', 'Con', 'HK001', 'Thường trú'),
(NULL, 'Nguyễn Thị Con2', 'Nữ', '2018-12-05', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường La Khê', NULL, NULL, '2018-12-05', 'Con', 'HK001', 'Thường trú'),
('001160000016', 'Bà Trần Q', 'Nữ', '1960-01-01', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nghỉ hưu', 'Không', '2015-01-01', 'Thanh Hóa', '2010-05-15', 'Mẹ chồng', 'HK001', 'Qua đời'),
-- HK002
('001185000002', 'Trần Thị B', 'Nữ', '1985-05-20', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Tổ phó', 'Nhà Văn Hóa', '2019-05-20', 'Hà Nội', '2012-11-20', 'Chủ hộ', 'HK002', 'Thường trú'),
('001185000017', 'Nguyễn Văn R', 'Nam', '1985-05-20', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Kỹ sư', 'Công ty DEF', '2019-05-20', 'Hải Phòng', '2012-11-20', 'Chồng', 'HK002', 'Thường trú'),
('001205000018', 'Trần Thị S', 'Nữ', '2005-10-10', 'Hà Nội', 'Hà Nội', 'Kinh', 'Sinh viên', 'Đại học A', '2022-10-10', 'Hà Nội', '2012-11-20', 'Con', 'HK002', 'Tạm vắng'),
(NULL, 'Trần Văn T', 'Nam', '2020-03-03', 'Hà Nội', 'Hà Nội', 'Kinh', 'Trẻ em', 'Không', NULL, NULL, '2020-03-03', 'Con', 'HK002', 'Thường trú'),
-- HK003
('001170000003', 'Lê Văn C', 'Nam', '1970-10-10', 'Nam Định', 'Nam Định', 'Kinh', 'Cán bộ QL CSVC', 'Nhà Văn Hóa', '2016-10-10', 'Nam Định', '2015-01-01', 'Chủ hộ', 'HK003', 'Thường trú'),
('001172000021', 'Phạm Thị V', 'Nữ', '1972-06-06', 'Nam Định', 'Nam Định', 'Kinh', 'Buôn bán', 'Chợ Hà Đông', '2016-06-06', 'Nam Định', '2015-01-01', 'Vợ', 'HK003', 'Thường trú'),
('001200000022', 'Lê Văn X', 'Nam', '2000-09-09', 'Nam Định', 'Nam Định', 'Kinh', 'Sinh viên', 'Đại học C', '2018-09-09', 'Nam Định', '2015-01-01', 'Con', 'HK003', 'Thường trú'),
-- HK004
('001195000004', 'Phạm Thị D', 'Nữ', '1995-12-25', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh', 'Cửa hàng', '2021-12-25', 'Hà Nội', '2008-08-08', 'Chủ hộ', 'HK004', 'Thường trú'),
('001178000050', 'Phạm Văn Z', 'Nam', '1978-02-02', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cán bộ QL CSVC', 'Nhà Văn Hóa', '2017-02-02', 'Hà Nội', '2008-08-08', 'Chồng', 'HK004', 'Thường trú'),
-- HK005
('001188000005', 'Hoàng Văn E', 'Nam', '1988-03-03', 'Thái Bình', 'Thái Bình', 'Kinh', 'Lập trình viên', 'Công ty FPT', '2020-03-03', 'Thái Bình', '2018-03-10', 'Chủ hộ', 'HK005', 'Thường trú'),
('001190000024', 'Lê Thị Z', 'Nữ', '1990-04-20', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nội trợ', 'Tại nhà', '2020-04-20', 'Thái Bình', '2018-03-10', 'Vợ', 'HK005', 'Thường trú'),
(NULL, 'Hoàng Văn A1', 'Nam', '2010-11-11', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường cấp 2', NULL, NULL, '2018-03-10', 'Con', 'HK005', 'Thường trú'),
-- HK006
('001175000006', 'Vũ Thị F', 'Nữ', '1975-07-17', 'Hà Nam', 'Hà Nam', 'Kinh', 'Nội trợ', 'Tại nhà', '2019-07-17', 'Hà Nam', '2020-07-07', 'Chủ hộ', 'HK006', 'Thường trú'),
('001168000027', 'Phạm Văn C1', 'Nam', '1968-01-10', 'Hà Nam', 'Hà Nam', 'Kinh', 'Lái xe', 'Công ty vận tải', '2015-01-10', 'Hà Nam', '2020-07-07', 'Chồng', 'HK006', 'Thường trú'),
('001202000028', 'Vũ Thị D1', 'Nữ', '2002-05-05', 'Hà Nam', 'Hà Nam', 'Kinh', 'Sinh viên', 'Đại học D', '2020-05-05', 'Hà Nam', '2020-07-07', 'Con', 'HK006', 'Thường trú'),
(NULL, 'Vũ Văn E1', 'Nam', '2022-06-06', 'Hà Nội', 'Hà Nội', 'Kinh', 'Trẻ em', 'Không', NULL, NULL, '2022-06-06', 'Cháu', 'HK006', 'Thường trú'),
-- HK007
('001165000007', 'Đặng Văn G', 'Nam', '1965-02-02', 'Thanh Hóa', 'Thanh Hóa', 'Thái', 'Nghỉ hưu', 'Không', '2017-02-02', 'Thanh Hóa', '2011-04-25', 'Chủ hộ', 'HK007', 'Thường trú'),
('001168000032', 'Lê Thị H1', 'Nữ', '1968-09-09', 'Thanh Hóa', 'Thanh Hóa', 'Thái', 'Nội trợ', 'Tại nhà', '2017-09-09', 'Thanh Hóa', '2011-04-25', 'Vợ', 'HK007', 'Thường trú'),
('001193000033', 'Đặng Văn I1', 'Nam', '1993-10-10', 'Hà Nội', 'Hà Nội', 'Thái', 'Kỹ thuật', 'KCN', '2020-10-10', 'Hà Nội', '2011-04-25', 'Con', 'HK007', 'Thường trú'),
('001195000034', 'Đặng Thị K1', 'Nữ', '1995-11-11', 'Hà Nội', 'Hà Nội', 'Thái', 'Bán hàng', 'Siêu thị', '2021-11-11', 'Hà Nội', '2011-04-25', 'Con', 'HK007', 'Thường trú'),
-- HK008
('001192000008', 'Bùi Thị H', 'Nữ', '1992-04-04', 'Hà Nội', 'Hà Nội', 'Kinh', 'Marketing', 'Công ty R&R', '2022-04-04', 'Hà Nội', '2019-12-12', 'Chủ hộ', 'HK008', 'Thường trú'),
('001190000035', 'Trần Văn L1', 'Nam', '1990-12-12', 'Hà Nội', 'Hà Nội', 'Kinh', 'Lập trình', 'Công ty R&R', '2020-12-12', 'Hà Nội', '2019-12-12', 'Chồng', 'HK008', 'Thường trú'),
(NULL, 'Bùi Văn M1', 'Nam', '2019-01-15', 'Hà Nội', 'Hà Nội', 'Kinh', 'Trẻ em', 'Không', NULL, NULL, '2019-12-12', 'Con', 'HK008', 'Thường trú'),
-- HK009
('001180000009', 'Ngô Văn I', 'Nam', '1980-06-06', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Giám đốc', 'Công ty X', '2018-06-06', 'Vĩnh Phúc', '2014-06-18', 'Chủ hộ', 'HK009', 'Thường trú'),
('001182000038', 'Nguyễn Thị O1', 'Nữ', '1982-03-25', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Nội trợ', 'Tại nhà', '2018-03-25', 'Vĩnh Phúc', '2014-06-18', 'Vợ', 'HK009', 'Thường trú'),
-- HK010
('001198000010', 'Dương Thị K', 'Nữ', '1998-08-08', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Chủ nhà trọ', 'Tại nhà', '2023-08-08', 'Hà Tĩnh', '2017-09-30', 'Chủ hộ', 'HK010', 'Thường trú'),
-- HK011
('001194000011', 'Lương Văn L', 'Nam', '1994-09-09', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Công nhân', 'Khu công nghiệp', '2021-09-09', 'Hòa Bình', '2022-02-01', 'Chủ hộ', 'HK011', 'Thường trú'),
('001196000046', 'Phạm Thị X1', 'Nữ', '1996-11-05', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Công nhân', 'Khu công nghiệp', '2022-11-05', 'Hòa Bình', '2022-02-01', 'Vợ', 'HK011', 'Thường trú'),
(NULL, 'Lương Văn Y1', 'Nam', '2023-01-01', 'Hà Nội', 'Hà Nội', 'Mường', 'Trẻ em', 'Không', NULL, NULL, '2023-01-01', 'Mới sinh', 'HK011', 'Mới sinh'),
-- HK012
('001191000012', 'Tô Thị M', 'Nữ', '1991-11-11', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kế toán', 'Công ty A', '2020-11-11', 'Hà Nội', '2023-10-28', 'Chủ hộ', 'HK012', 'Thường trú'),
('001161000048', 'Bà Trần Z1', 'Nữ', '1961-02-05', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nghỉ hưu', 'Không', '2016-02-05', 'Hà Nội', '2023-10-28', 'Mẹ', 'HK012', 'Thường trú'),

-- NHÂN KHẨU TẠM TRÚ (DỮ LIỆU CŨ)
('001206000100', 'Phạm Văn P1', 'Nam', '2004-04-01', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Sinh viên', 'Đại học F', '2020-04-01', 'Thanh Hóa', NULL, NULL, NULL, 'Tạm trú'),
('001207000101', 'Lê Thị Q1', 'Nữ', '2003-05-05', 'Nghệ An', 'Nghệ An', 'Kinh', 'Sinh viên', 'Đại học G', '2019-05-05', 'Nghệ An', NULL, NULL, NULL, 'Tạm trú'),
('001208000102', 'Trần Văn R1', 'Nam', '1995-06-10', 'Quảng Bình', 'Quảng Bình', 'Kinh', 'Lao động tự do', 'KCN', '2017-06-10', 'Quảng Bình', NULL, NULL, NULL, 'Tạm trú'),
('001209000103', 'Vũ Thị S1', 'Nữ', '2002-07-15', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Sinh viên', 'Đại học I', '2021-07-15', 'Hà Tĩnh', NULL, NULL, NULL, 'Tạm trú'),
('001210000104', 'Nguyễn Văn T1', 'Nam', '2000-08-20', 'Thái Bình', 'Thái Bình', 'Kinh', 'Sinh viên', 'Đại học K', '2018-08-20', 'Thái Bình', NULL, NULL, NULL, 'Tạm trú'),
('001211000105', 'Lê Văn U1', 'Nam', '1999-09-25', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Lao động', 'Công ty M', '2020-09-25', 'Phú Thọ', NULL, NULL, NULL, 'Tạm trú');

--Cập nhật chuho_id cho toàn bộ 12 hộ khẩu
UPDATE HoKhau h SET chuho_id = n.id FROM NhanKhau n WHERE h.SoHoKhau = n.SoHoKhau AND n.QuanHeVoiChuHo = 'Chủ hộ';

-- Nạp bảng TamTru
INSERT INTO tamtru (nhankhau_id, cccd, chuhocccd, diaphuong, tungay, denngay, lydo, TrangThai) VALUES
-- P1, Q1, R1, S1 thuê tại hộ HK010 (Chủ hộ Dương Thị K: 001198000010)
((SELECT id FROM nhankhau WHERE cccd='001206000100'), '001206000100', '001198000010', 'E3 Phùng Hưng, La Khê', '2024-03-01', '2025-07-30', 'Thuê trọ đi học', 'Còn hạn'),
((SELECT id FROM nhankhau WHERE cccd='001207000101'), '001207000101', '001198000010', 'E3 Phùng Hưng, La Khê', '2024-03-01', '2025-07-30', 'Thuê trọ đi học', 'Còn hạn'),
((SELECT id FROM nhankhau WHERE cccd='001208000102'), '001208000102', '001198000010', 'E3 Phùng Hưng, La Khê', '2024-03-01', '2025-07-30', 'Thuê trọ đi học', 'Còn hạn'),
((SELECT id FROM nhankhau WHERE cccd='001209000103'), '001209000103', '001198000010', 'E3 Phùng Hưng, La Khê', '2024-03-01', '2025-07-30', 'Thuê trọ đi học', 'Còn hạn'),

-- T1 thuê tại hộ HK001 (Chủ hộ Nguyễn Văn A: 001190000001)
((SELECT id FROM nhankhau WHERE cccd='001210000104'), '001210000104', '001190000001', '10A Nguyễn Trãi, La Khê', '2024-11-01', '2025-05-30', 'Thuê trọ đi học', 'Còn hạn'),

-- U1 thuê tại hộ HK002 (Chủ hộ Trần Thị B: 001185000002)
((SELECT id FROM nhankhau WHERE cccd='001211000105'), '001211000105', '001185000002', '12 Nguyễn Trãi, La Khê', '2024-10-15', '2025-10-15', 'Lao động tự do', 'Còn hạn');

-- Cập nhật cột tên 'chuho' để hiển thị cho dễ (Nếu bạn có cột này)
UPDATE tamtru t
SET chuho = n.hoten
FROM nhankhau n
WHERE t.chuhocccd = n.cccd;

-- Nạp bảng TamVang & Biến Động
INSERT INTO tamvang (nhankhau_id, cccd, tungay, denngay, lydo, TrangThai) VALUES
    ((SELECT id FROM nhankhau WHERE cccd='001205000018'), '001205000018', '2024-09-01', '2025-06-30', 'Học tập xa nhà', 'Còn hạn');

INSERT INTO BienDongNhanKhau (nhankhau_id, CCCD, LoaiBienDong, NgayBienDong, GhiChu) VALUES
-- Trẻ em mới sinh: CCCD để NULL thoải mái
((SELECT id FROM NhanKhau WHERE HoTen='Lương Văn Y1'), NULL, 'Thêm mới', '2023-01-01', 'Khai sinh mới'),

-- Người lớn có CCCD
((SELECT id FROM NhanKhau WHERE HoTen='Nguyễn Văn A'), '001190000001', 'Thêm mới', '2010-05-15', 'Lập hộ gốc'),

-- Người đã qua đời (Sử dụng đúng loại biến động trong CHECK constraint)
((SELECT id FROM NhanKhau WHERE HoTen='Bà Trần Q'), '001160000016', 'Qua đời', '2024-10-20', 'Xóa đăng ký thường trú');

INSERT INTO BienDongHoKhau (SoHoKhau, NoiDungThayDoi, NgayThayDoi) VALUES
                                                                       ('HK001', 'Thiết lập hộ khẩu thường trú', '2010-05-15');