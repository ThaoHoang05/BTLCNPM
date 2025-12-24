CREATE DATABASE Thong_ke_bao_cao;

CREATE EXTENSION IF NOT EXISTS dblink;
-- 1. Bảng Thống kê Giới tính
CREATE TABLE Thong_ke_gioi_tinh (
                                    id SERIAL PRIMARY KEY,
                                    loai_thoi_gian VARCHAR(10) CHECK (loai_thoi_gian IN ('Tháng', 'Quý', 'Năm')),
                                    gia_tri_thoi_gian VARCHAR(20), -- VD: '12/2025', 'Q4/2025', '2025'
                                    so_nam INTEGER DEFAULT 0,
                                    so_nu INTEGER DEFAULT 0,
                                    tong_so INTEGER DEFAULT 0,
                                    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Thong_ke_gioi_tinh (loai_thoi_gian, gia_tri_thoi_gian, so_nam, so_nu, tong_so)
SELECT 'Năm', '2025', t.nam, t.nu, (t.nam + t.nu)
FROM dblink(
             'host=localhost dbname=Quan_li_ho_khau user=todanpho password=admin',
             $$
             SELECT
                         COUNT(*) FILTER (WHERE GioiTinh = 'Nam'),
                         COUNT(*) FILTER (WHERE GioiTinh = 'Nữ')
             FROM nhankhau
             WHERE TrangThai != 'Qua đời'
             $$
     ) AS t(nam int, nu int);

-- 2. Bảng Thống kê Độ tuổi
CREATE TABLE Thong_ke_do_tuoi (
                                  id SERIAL PRIMARY KEY,
                                  loai_thoi_gian VARCHAR(10) CHECK (loai_thoi_gian IN ('Tháng', 'Quý', 'Năm')),
                                  gia_tri_thoi_gian VARCHAR(20),
                                  mam_non_mau_giao INTEGER DEFAULT 0,
                                  cap_1 INTEGER DEFAULT 0,
                                  cap_2 INTEGER DEFAULT 0,
                                  cap_3 INTEGER DEFAULT 0,
                                  do_tuoi_lao_dong INTEGER DEFAULT 0,
                                  nghi_huu INTEGER DEFAULT 0,
                                  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Thong_ke_do_tuoi (loai_thoi_gian, gia_tri_thoi_gian, mam_non_mau_giao, cap_1, cap_2, cap_3, do_tuoi_lao_dong, nghi_huu)
SELECT 'Năm', '2025', t.mn, t.c1, t.c2, t.c3, t.ld, t.nh
FROM dblink(
             'host=localhost dbname=Quan_li_ho_khau user=todanpho password=admin',
             $$
             SELECT
                         COUNT(*) FILTER (WHERE date_part('year', age(NgaySinh)) <= 5),
                         COUNT(*) FILTER (WHERE date_part('year', age(NgaySinh)) BETWEEN 6 AND 10),
                         COUNT(*) FILTER (WHERE date_part('year', age(NgaySinh)) BETWEEN 11 AND 14),
                         COUNT(*) FILTER (WHERE date_part('year', age(NgaySinh)) BETWEEN 15 AND 17),
                         COUNT(*) FILTER (WHERE (GioiTinh = 'Nam' AND date_part('year', age(NgaySinh)) BETWEEN 18 AND 60) OR (GioiTinh = 'Nữ' AND date_part('year', age(NgaySinh)) BETWEEN 18 AND 55)),
                         COUNT(*) FILTER (WHERE (GioiTinh = 'Nam' AND date_part('year', age(NgaySinh)) > 60) OR (GioiTinh = 'Nữ' AND date_part('year', age(NgaySinh)) > 55))
             FROM nhankhau
             WHERE TrangThai != 'Qua đời'
             $$
     ) AS t(mn int, c1 int, c2 int, c3 int, ld int, nh int);

-- 3. Bảng Thống kê Cư trú
CREATE TABLE Thong_ke_cu_tru (
                                 id SERIAL PRIMARY KEY,
                                 loai_thoi_gian VARCHAR(10) CHECK (loai_thoi_gian IN ('Tháng', 'Quý', 'Năm')),
                                 gia_tri_thoi_gian VARCHAR(20),
                                 dang_tam_tru INTEGER DEFAULT 0,
                                 dang_tam_vang INTEGER DEFAULT 0,
                                 ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Thong_ke_cu_tru (loai_thoi_gian, gia_tri_thoi_gian, dang_tam_tru, dang_tam_vang)
SELECT 'Năm', '2025', t.so_tam_tru, t.so_tam_vang
FROM dblink(
             'host=localhost dbname=Quan_li_ho_khau user=todanpho password=admin',
             $$
             SELECT
                 (SELECT COUNT(*) FROM tamtru WHERE TrangThai = 'Còn hạn'),
                 (SELECT COUNT(*) FROM tamvang WHERE TrangThai = 'Còn hạn')
             $$
     ) AS t(so_tam_tru int, so_tam_vang int);

-- 4. Bảng Thống kê Biến động
CREATE TABLE Thong_ke_bien_dong (
                                    id SERIAL PRIMARY KEY,
                                    loai_thoi_gian VARCHAR(10) CHECK (loai_thoi_gian IN ('Tháng', 'Quý', 'Năm')),
                                    gia_tri_thoi_gian VARCHAR(20),
                                    so_them_moi INTEGER DEFAULT 0,
                                    so_chuyen_di INTEGER DEFAULT 0,
                                    so_qua_doi INTEGER DEFAULT 0,
                                    so_thay_doi_thong_tin INTEGER DEFAULT 0,
                                    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Thong_ke_bien_dong (loai_thoi_gian, gia_tri_thoi_gian, so_them_moi, so_chuyen_di, so_qua_doi)
SELECT 'Năm', '2025', t.moi, t.di, t.chet
FROM dblink(
             'host=localhost dbname=Quan_li_ho_khau user=todanpho password=admin',
             $$
             SELECT
                         COUNT(*) FILTER (WHERE LoaiBienDong = 'Thêm mới'),
                         COUNT(*) FILTER (WHERE LoaiBienDong = 'Chuyển đi'),
                         COUNT(*) FILTER (WHERE LoaiBienDong = 'Qua đời')
             FROM BienDongNhanKhau
             WHERE date_part('year', NgayBienDong) = 2025
             $$
     ) AS t(moi int, di int, chet int);