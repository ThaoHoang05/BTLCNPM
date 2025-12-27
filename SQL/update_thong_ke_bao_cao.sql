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
-- Tự động cập nhật theo tháng quý năm
ALTER TABLE Thong_ke_gioi_tinh ADD CONSTRAINT unq_gioi_tinh UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);
ALTER TABLE Thong_ke_do_tuoi ADD CONSTRAINT unq_do_tuoi UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);
ALTER TABLE Thong_ke_cu_tru ADD CONSTRAINT unq_cu_tru UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);
ALTER TABLE Thong_ke_bien_dong ADD CONSTRAINT unq_bien_dong UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);

TRUNCATE TABLE Thong_ke_cu_tru;
TRUNCATE TABLE Thong_ke_gioi_tinh;
TRUNCATE TABLE Thong_ke_do_tuoi;
TRUNCATE TABLE Thong_ke_bien_dong;

CREATE OR REPLACE PROCEDURE proc_auto_sync_all_stats()
    LANGUAGE plpgsql
AS $$
DECLARE
    v_now date := CURRENT_DATE;
    v_db_link text := 'host=localhost dbname=Quan_li_ho_khau user=todanpho password=admin';

    -- Khai báo các mốc thời gian chốt
    v_cuoi_thang date := (DATE_TRUNC('month', v_now) + INTERVAL '1 month - 1 day')::date;
    v_cuoi_quy   date := (DATE_TRUNC('quarter', v_now) + INTERVAL '3 month - 1 day')::date;
    v_cuoi_nam   date := (DATE_TRUNC('year', v_now) + INTERVAL '1 year - 1 day')::date;

    -- Nhãn thời gian
    v_label_thang text := TO_CHAR(v_now, 'MM/YYYY');
    v_label_quy   text := 'Q' || CEIL(EXTRACT(MONTH FROM v_now)/3)::text || '/' || EXTRACT(YEAR FROM v_now);
    v_label_nam   text := EXTRACT(YEAR FROM v_now)::text;

    -- Biến con trỏ vòng lặp (Khắc phục lỗi image_4b303c.png)
    v_rec RECORD;
BEGIN
    -- Tạo một bảng tạm thời chứa các mốc cần chạy để vòng lặp ổn định
    FOR v_rec IN
        SELECT * FROM (VALUES
                           ('Tháng', v_label_thang, v_cuoi_thang),
                           ('Quý', v_label_quy, v_cuoi_quy),
                           ('Năm', v_label_nam, v_cuoi_nam)
                      ) AS t(loai, label, ngay_chot)
        LOOP
            -- Xác định mốc chốt thực tế (không vượt quá ngày hôm nay)
            DECLARE
                v_moc_chot date := LEAST(v_rec.ngay_chot, v_now);
            BEGIN
                -- [1] CẬP NHẬT GIỚI TÍNH (Tính đúng theo mốc thời gian)
                INSERT INTO Thong_ke_gioi_tinh (loai_thoi_gian, gia_tri_thoi_gian, so_nam, so_nu, tong_so)
                SELECT v_rec.loai, v_rec.label, t.nam, t.nu, (t.nam + t.nu)
                FROM dblink(v_db_link, format('
                SELECT
                    COALESCE(SUM(CASE WHEN GioiTinh = ''Nam'' THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN GioiTinh = ''Nữ'' THEN 1 ELSE 0 END), 0)::int
                FROM nhankhau n
                INNER JOIN BienDongNhanKhau b_in ON n.id = b_in.nhankhau_id AND b_in.LoaiBienDong = ''Thêm mới''
                LEFT JOIN BienDongNhanKhau b_out ON n.id = b_out.nhankhau_id AND b_out.LoaiBienDong IN (''Qua đời'', ''Chuyển đi'')
                WHERE b_in.NgayBienDong <= %1$L
                  AND (b_out.NgayBienDong > %1$L OR b_out.NgayBienDong IS NULL)
            ', v_moc_chot)) AS t(nam int, nu int)
                ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                              so_nam = EXCLUDED.so_nam, so_nu = EXCLUDED.so_nu, tong_so = EXCLUDED.tong_so, ngay_cap_nhat = CURRENT_TIMESTAMP;

                -- [2] CẬP NHẬT ĐỘ TUỔI
                INSERT INTO Thong_ke_do_tuoi (loai_thoi_gian, gia_tri_thoi_gian, mam_non_mau_giao, cap_1, cap_2, cap_3, do_tuoi_lao_dong, nghi_huu)
                SELECT v_rec.loai, v_rec.label, t.mn, t.c1, t.c2, t.c3, t.ld, t.nh
                FROM dblink(v_db_link, format('
                SELECT
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 0 AND 5 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 6 AND 10 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 11 AND 14 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 15 AND 17 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN (GioiTinh = ''Nam'' AND date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 18 AND 60) OR (GioiTinh = ''Nữ'' AND date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 18 AND 55) THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN (GioiTinh = ''Nam'' AND date_part(''year'', age(%1$L, NgaySinh)) > 60) OR (GioiTinh = ''Nữ'' AND date_part(''year'', age(%1$L, NgaySinh)) > 55) THEN 1 ELSE 0 END), 0)::int
                FROM nhankhau n
                INNER JOIN BienDongNhanKhau b_in ON n.id = b_in.nhankhau_id AND b_in.LoaiBienDong = ''Thêm mới''
                LEFT JOIN BienDongNhanKhau b_out ON n.id = b_out.nhankhau_id AND b_out.LoaiBienDong IN (''Qua đời'', ''Chuyển đi'')
                WHERE b_in.NgayBienDong <= %1$L AND (b_out.NgayBienDong > %1$L OR b_out.NgayBienDong IS NULL)
            ', v_moc_chot)) AS t(mn int, c1 int, c2 int, c3 int, ld int, nh int)
                ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                              mam_non_mau_giao = EXCLUDED.mam_non_mau_giao, cap_1 = EXCLUDED.cap_1, cap_2 = EXCLUDED.cap_2, cap_3 = EXCLUDED.cap_3, do_tuoi_lao_dong = EXCLUDED.do_tuoi_lao_dong, nghi_huu = EXCLUDED.nghi_huu, ngay_cap_nhat = CURRENT_TIMESTAMP;

                -- [3] CẬP NHẬT CƯ TRÚ
                INSERT INTO Thong_ke_cu_tru (loai_thoi_gian, gia_tri_thoi_gian, dang_tam_tru, dang_tam_vang)
                SELECT v_rec.loai, v_rec.label, t.tt, t.tv
                FROM dblink(v_db_link, format('
                SELECT
                    (SELECT COUNT(*)::int FROM tamtru WHERE tungay <= %1$L AND (denngay >= %1$L OR denngay IS NULL)),
                    (SELECT COUNT(*)::int FROM tamvang WHERE tungay <= %1$L AND (denngay >= %1$L OR denngay IS NULL))
            ', v_moc_chot)) AS t(tt int, tv int)
                ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                              dang_tam_tru = EXCLUDED.dang_tam_tru, dang_tam_vang = EXCLUDED.dang_tam_vang, ngay_cap_nhat = CURRENT_TIMESTAMP;
            END;
        END LOOP;

    -- [4] CẬP NHẬT BIẾN ĐỘNG (Tính số lượng phát sinh TRONG KỲ)
    FOR v_rec IN
        SELECT * FROM (VALUES
                           ('Tháng', v_label_thang, DATE_TRUNC('month', v_now)::date),
                           ('Quý', v_label_quy, DATE_TRUNC('quarter', v_now)::date),
                           ('Năm', v_label_nam, DATE_TRUNC('year', v_now)::date)
                      ) AS t(loai, label, ngay_dau_ky)
        LOOP
            INSERT INTO Thong_ke_bien_dong (loai_thoi_gian, gia_tri_thoi_gian, so_them_moi, so_chuyen_di, so_qua_doi)
            SELECT v_rec.loai, v_rec.label, t.m, t.d, t.q
            FROM dblink(v_db_link, format('
            SELECT
                COALESCE(SUM(CASE WHEN LoaiBienDong = ''Thêm mới'' THEN 1 ELSE 0 END), 0)::int,
                COALESCE(SUM(CASE WHEN LoaiBienDong = ''Chuyển đi'' THEN 1 ELSE 0 END), 0)::int,
                COALESCE(SUM(CASE WHEN LoaiBienDong = ''Qua đời'' THEN 1 ELSE 0 END), 0)::int
            FROM BienDongNhanKhau
            WHERE NgayBienDong >= %1$L AND NgayBienDong <= %2$L
        ', v_rec.ngay_dau_ky, v_now)) AS t(m int, d int, q int)
            ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                          so_them_moi = EXCLUDED.so_them_moi, so_chuyen_di = EXCLUDED.so_chuyen_di, so_qua_doi = EXCLUDED.so_qua_doi, ngay_cap_nhat = CURRENT_TIMESTAMP;
        END LOOP;

    RAISE NOTICE 'Đã cập nhật dữ liệu mới nhất!';
END;
$$;
CALL proc_auto_sync_all_stats();

DO $$
    DECLARE
        v_ngay_chot date;
        v_label text;
        v_db_link text := 'host=localhost dbname=Quan_li_ho_khau user=todanpho password=admin';
    BEGIN
        -- Vòng lặp chạy qua 12 tháng năm 2025
        FOR i IN 1..12 LOOP
                -- Xác định ngày cuối cùng của tháng i năm 2025
                v_ngay_chot := (DATE_TRUNC('month', TO_DATE('2025-' || i || '-01', 'YYYY-MM-DD')) + INTERVAL '1 month - 1 day')::date;
                v_label := TO_CHAR(v_ngay_chot, 'MM/YYYY');

                -- Chỉ xử lý các tháng đã qua hoặc đang diễn ra
                IF v_ngay_chot <= CURRENT_DATE OR i <= EXTRACT(MONTH FROM CURRENT_DATE) THEN

                    -- 1. GIỚI TÍNH (Sử dụng ON CONFLICT để cập nhật nếu đã tồn tại)
                    INSERT INTO Thong_ke_gioi_tinh (loai_thoi_gian, gia_tri_thoi_gian, so_nam, so_nu, tong_so)
                    SELECT 'Tháng', v_label, t.nam, t.nu, (t.nam + t.nu)
                    FROM dblink(v_db_link, format('
                SELECT
                    COALESCE(SUM(CASE WHEN GioiTinh = ''Nam'' THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN GioiTinh = ''Nữ'' THEN 1 ELSE 0 END), 0)::int
                FROM nhankhau n
                INNER JOIN BienDongNhanKhau b_in ON n.id = b_in.nhankhau_id AND b_in.LoaiBienDong = ''Thêm mới''
                LEFT JOIN BienDongNhanKhau b_out ON n.id = b_out.nhankhau_id AND b_out.LoaiBienDong IN (''Qua đời'', ''Chuyển đi'')
                WHERE b_in.NgayBienDong <= %1$L AND (b_out.NgayBienDong > %1$L OR b_out.NgayBienDong IS NULL)
            ', v_ngay_chot)) AS t(nam int, nu int)
                    ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                                  so_nam = EXCLUDED.so_nam, so_nu = EXCLUDED.so_nu, tong_so = EXCLUDED.tong_so, ngay_cap_nhat = CURRENT_TIMESTAMP;

                    -- 2. ĐỘ TUỔI
                    INSERT INTO Thong_ke_do_tuoi (loai_thoi_gian, gia_tri_thoi_gian, mam_non_mau_giao, cap_1, cap_2, cap_3, do_tuoi_lao_dong, nghi_huu)
                    SELECT 'Tháng', v_label, t.mn, t.c1, t.c2, t.c3, t.ld, t.nh
                    FROM dblink(v_db_link, format('
                SELECT
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 0 AND 5 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 6 AND 10 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 11 AND 14 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 15 AND 17 THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN (GioiTinh = ''Nam'' AND date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 18 AND 60) OR (GioiTinh = ''Nữ'' AND date_part(''year'', age(%1$L, NgaySinh)) BETWEEN 18 AND 55) THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN (GioiTinh = ''Nam'' AND date_part(''year'', age(%1$L, NgaySinh)) > 60) OR (GioiTinh = ''Nữ'' AND date_part(''year'', age(%1$L, NgaySinh)) > 55) THEN 1 ELSE 0 END), 0)::int
                FROM nhankhau n
                INNER JOIN BienDongNhanKhau b_in ON n.id = b_in.nhankhau_id AND b_in.LoaiBienDong = ''Thêm mới''
                LEFT JOIN BienDongNhanKhau b_out ON n.id = b_out.nhankhau_id AND b_out.LoaiBienDong IN (''Qua đời'', ''Chuyển đi'')
                WHERE b_in.NgayBienDong <= %1$L AND (b_out.NgayBienDong > %1$L OR b_out.NgayBienDong IS NULL)
            ', v_ngay_chot)) AS t(mn int, c1 int, c2 int, c3 int, ld int, nh int)
                    ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                                  mam_non_mau_giao = EXCLUDED.mam_non_mau_giao, cap_1 = EXCLUDED.cap_1, cap_2 = EXCLUDED.cap_2, cap_3 = EXCLUDED.cap_3, do_tuoi_lao_dong = EXCLUDED.do_tuoi_lao_dong, nghi_huu = EXCLUDED.nghi_huu, ngay_cap_nhat = CURRENT_TIMESTAMP;

                    -- 3. CƯ TRÚ
                    INSERT INTO Thong_ke_cu_tru (loai_thoi_gian, gia_tri_thoi_gian, dang_tam_tru, dang_tam_vang)
                    SELECT 'Tháng', v_label, t.tt, t.tv
                    FROM dblink(v_db_link, format('
                SELECT
                    (SELECT COUNT(*)::int FROM tamtru WHERE tungay <= %1$L AND (denngay >= %1$L OR denngay IS NULL)),
                    (SELECT COUNT(*)::int FROM tamvang WHERE tungay <= %1$L AND (denngay >= %1$L OR denngay IS NULL))
            ', v_ngay_chot)) AS t(tt int, tv int)
                    ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                                  dang_tam_tru = EXCLUDED.dang_tam_tru, dang_tam_vang = EXCLUDED.dang_tam_vang, ngay_cap_nhat = CURRENT_TIMESTAMP;

                    -- 4. BIẾN ĐỘNG
                    INSERT INTO Thong_ke_bien_dong (loai_thoi_gian, gia_tri_thoi_gian, so_them_moi, so_chuyen_di, so_qua_doi)
                    SELECT 'Tháng', v_label, t.m, t.d, t.q
                    FROM dblink(v_db_link, format('
                SELECT
                    COALESCE(SUM(CASE WHEN LoaiBienDong = ''Thêm mới'' THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN LoaiBienDong = ''Chuyển đi'' THEN 1 ELSE 0 END), 0)::int,
                    COALESCE(SUM(CASE WHEN LoaiBienDong = ''Qua đời'' THEN 1 ELSE 0 END), 0)::int
                FROM BienDongNhanKhau
                WHERE NgayBienDong >= DATE_TRUNC(''month'', %1$L::date) AND NgayBienDong <= %1$L
            ', v_ngay_chot)) AS t(m int, d int, q int)
                    ON CONFLICT (loai_thoi_gian, gia_tri_thoi_gian) DO UPDATE SET
                                                                                  so_them_moi = EXCLUDED.so_them_moi, so_chuyen_di = EXCLUDED.so_chuyen_di, so_qua_doi = EXCLUDED.so_qua_doi, ngay_cap_nhat = CURRENT_TIMESTAMP;

                END IF;
            END LOOP;
        RAISE NOTICE 'Backfill thành công! Dữ liệu 12 tháng năm 2025 đã được làm mới.';
    END $$;