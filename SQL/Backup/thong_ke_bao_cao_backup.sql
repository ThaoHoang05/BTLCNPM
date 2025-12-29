--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: dblink; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA public;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


--
-- Name: proc_auto_sync_all_stats(); Type: PROCEDURE; Schema: public; Owner: todanpho
--

CREATE PROCEDURE public.proc_auto_sync_all_stats()
    LANGUAGE plpgsql
    AS $_$
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
$_$;


ALTER PROCEDURE public.proc_auto_sync_all_stats() OWNER TO todanpho;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: thong_ke_bien_dong; Type: TABLE; Schema: public; Owner: todanpho
--

CREATE TABLE public.thong_ke_bien_dong (
    id integer NOT NULL,
    loai_thoi_gian character varying(10),
    gia_tri_thoi_gian character varying(20),
    so_them_moi integer DEFAULT 0,
    so_chuyen_di integer DEFAULT 0,
    so_qua_doi integer DEFAULT 0,
    so_thay_doi_thong_tin integer DEFAULT 0,
    ngay_cap_nhat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT thong_ke_bien_dong_loai_thoi_gian_check CHECK (((loai_thoi_gian)::text = ANY ((ARRAY['Tháng'::character varying, 'Quý'::character varying, 'Năm'::character varying])::text[])))
);


ALTER TABLE public.thong_ke_bien_dong OWNER TO todanpho;

--
-- Name: thong_ke_bien_dong_id_seq; Type: SEQUENCE; Schema: public; Owner: todanpho
--

CREATE SEQUENCE public.thong_ke_bien_dong_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thong_ke_bien_dong_id_seq OWNER TO todanpho;

--
-- Name: thong_ke_bien_dong_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: todanpho
--

ALTER SEQUENCE public.thong_ke_bien_dong_id_seq OWNED BY public.thong_ke_bien_dong.id;


--
-- Name: thong_ke_cu_tru; Type: TABLE; Schema: public; Owner: todanpho
--

CREATE TABLE public.thong_ke_cu_tru (
    id integer NOT NULL,
    loai_thoi_gian character varying(10),
    gia_tri_thoi_gian character varying(20),
    dang_tam_tru integer DEFAULT 0,
    dang_tam_vang integer DEFAULT 0,
    ngay_cap_nhat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT thong_ke_cu_tru_loai_thoi_gian_check CHECK (((loai_thoi_gian)::text = ANY ((ARRAY['Tháng'::character varying, 'Quý'::character varying, 'Năm'::character varying])::text[])))
);


ALTER TABLE public.thong_ke_cu_tru OWNER TO todanpho;

--
-- Name: thong_ke_cu_tru_id_seq; Type: SEQUENCE; Schema: public; Owner: todanpho
--

CREATE SEQUENCE public.thong_ke_cu_tru_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thong_ke_cu_tru_id_seq OWNER TO todanpho;

--
-- Name: thong_ke_cu_tru_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: todanpho
--

ALTER SEQUENCE public.thong_ke_cu_tru_id_seq OWNED BY public.thong_ke_cu_tru.id;


--
-- Name: thong_ke_do_tuoi; Type: TABLE; Schema: public; Owner: todanpho
--

CREATE TABLE public.thong_ke_do_tuoi (
    id integer NOT NULL,
    loai_thoi_gian character varying(10),
    gia_tri_thoi_gian character varying(20),
    mam_non_mau_giao integer DEFAULT 0,
    cap_1 integer DEFAULT 0,
    cap_2 integer DEFAULT 0,
    cap_3 integer DEFAULT 0,
    do_tuoi_lao_dong integer DEFAULT 0,
    nghi_huu integer DEFAULT 0,
    ngay_cap_nhat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT thong_ke_do_tuoi_loai_thoi_gian_check CHECK (((loai_thoi_gian)::text = ANY ((ARRAY['Tháng'::character varying, 'Quý'::character varying, 'Năm'::character varying])::text[])))
);


ALTER TABLE public.thong_ke_do_tuoi OWNER TO todanpho;

--
-- Name: thong_ke_do_tuoi_id_seq; Type: SEQUENCE; Schema: public; Owner: todanpho
--

CREATE SEQUENCE public.thong_ke_do_tuoi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thong_ke_do_tuoi_id_seq OWNER TO todanpho;

--
-- Name: thong_ke_do_tuoi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: todanpho
--

ALTER SEQUENCE public.thong_ke_do_tuoi_id_seq OWNED BY public.thong_ke_do_tuoi.id;


--
-- Name: thong_ke_gioi_tinh; Type: TABLE; Schema: public; Owner: todanpho
--

CREATE TABLE public.thong_ke_gioi_tinh (
    id integer NOT NULL,
    loai_thoi_gian character varying(10),
    gia_tri_thoi_gian character varying(20),
    so_nam integer DEFAULT 0,
    so_nu integer DEFAULT 0,
    tong_so integer DEFAULT 0,
    ngay_cap_nhat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT thong_ke_gioi_tinh_loai_thoi_gian_check CHECK (((loai_thoi_gian)::text = ANY ((ARRAY['Tháng'::character varying, 'Quý'::character varying, 'Năm'::character varying])::text[])))
);


ALTER TABLE public.thong_ke_gioi_tinh OWNER TO todanpho;

--
-- Name: thong_ke_gioi_tinh_id_seq; Type: SEQUENCE; Schema: public; Owner: todanpho
--

CREATE SEQUENCE public.thong_ke_gioi_tinh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thong_ke_gioi_tinh_id_seq OWNER TO todanpho;

--
-- Name: thong_ke_gioi_tinh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: todanpho
--

ALTER SEQUENCE public.thong_ke_gioi_tinh_id_seq OWNED BY public.thong_ke_gioi_tinh.id;


--
-- Name: thong_ke_bien_dong id; Type: DEFAULT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_bien_dong ALTER COLUMN id SET DEFAULT nextval('public.thong_ke_bien_dong_id_seq'::regclass);


--
-- Name: thong_ke_cu_tru id; Type: DEFAULT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_cu_tru ALTER COLUMN id SET DEFAULT nextval('public.thong_ke_cu_tru_id_seq'::regclass);


--
-- Name: thong_ke_do_tuoi id; Type: DEFAULT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_do_tuoi ALTER COLUMN id SET DEFAULT nextval('public.thong_ke_do_tuoi_id_seq'::regclass);


--
-- Name: thong_ke_gioi_tinh id; Type: DEFAULT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_gioi_tinh ALTER COLUMN id SET DEFAULT nextval('public.thong_ke_gioi_tinh_id_seq'::regclass);


--
-- Data for Name: thong_ke_bien_dong; Type: TABLE DATA; Schema: public; Owner: todanpho
--

COPY public.thong_ke_bien_dong (id, loai_thoi_gian, gia_tri_thoi_gian, so_them_moi, so_chuyen_di, so_qua_doi, so_thay_doi_thong_tin, ngay_cap_nhat) FROM stdin;
3	Quý	Q4/2025	0	0	0	0	2025-12-28 00:10:15.258642
4	Năm	2025	43	1	1	0	2025-12-28 00:10:15.258642
5	Tháng	01/2025	40	0	0	0	2025-12-28 00:10:15.258642
6	Tháng	02/2025	0	0	0	0	2025-12-28 00:10:15.258642
7	Tháng	03/2025	1	0	0	0	2025-12-28 00:10:15.258642
8	Tháng	04/2025	0	0	1	0	2025-12-28 00:10:15.258642
9	Tháng	05/2025	0	0	0	0	2025-12-28 00:10:15.258642
10	Tháng	06/2025	2	0	0	0	2025-12-28 00:10:15.258642
11	Tháng	07/2025	0	0	0	0	2025-12-28 00:10:15.258642
12	Tháng	08/2025	0	0	0	0	2025-12-28 00:10:15.258642
13	Tháng	09/2025	0	1	0	0	2025-12-28 00:10:15.258642
14	Tháng	10/2025	0	0	0	0	2025-12-28 00:10:15.258642
15	Tháng	11/2025	0	0	0	0	2025-12-28 00:10:15.258642
2	Tháng	12/2025	0	0	0	0	2025-12-28 00:10:15.258642
\.


--
-- Data for Name: thong_ke_cu_tru; Type: TABLE DATA; Schema: public; Owner: todanpho
--

COPY public.thong_ke_cu_tru (id, loai_thoi_gian, gia_tri_thoi_gian, dang_tam_tru, dang_tam_vang, ngay_cap_nhat) FROM stdin;
3	Quý	Q4/2025	1	1	2025-12-28 00:10:15.258642
4	Năm	2025	1	1	2025-12-28 00:10:15.258642
5	Tháng	01/2025	7	2	2025-12-28 00:10:15.258642
6	Tháng	02/2025	7	2	2025-12-28 00:10:15.258642
7	Tháng	03/2025	7	2	2025-12-28 00:10:15.258642
8	Tháng	04/2025	7	2	2025-12-28 00:10:15.258642
9	Tháng	05/2025	6	2	2025-12-28 00:10:15.258642
10	Tháng	06/2025	6	2	2025-12-28 00:10:15.258642
11	Tháng	07/2025	2	0	2025-12-28 00:10:15.258642
12	Tháng	08/2025	2	0	2025-12-28 00:10:15.258642
13	Tháng	09/2025	2	0	2025-12-28 00:10:15.258642
14	Tháng	10/2025	1	0	2025-12-28 00:10:15.258642
15	Tháng	11/2025	1	0	2025-12-28 00:10:15.258642
2	Tháng	12/2025	1	1	2025-12-28 00:10:15.258642
\.


--
-- Data for Name: thong_ke_do_tuoi; Type: TABLE DATA; Schema: public; Owner: todanpho
--

COPY public.thong_ke_do_tuoi (id, loai_thoi_gian, gia_tri_thoi_gian, mam_non_mau_giao, cap_1, cap_2, cap_3, do_tuoi_lao_dong, nghi_huu, ngay_cap_nhat) FROM stdin;
3	Quý	Q4/2025	4	4	0	1	31	2	2025-12-28 00:10:15.258642
4	Năm	2025	4	4	0	1	31	2	2025-12-28 00:10:15.258642
5	Tháng	01/2025	2	3	1	0	32	2	2025-12-28 00:10:15.258642
6	Tháng	02/2025	2	3	1	0	32	2	2025-12-28 00:10:15.258642
7	Tháng	03/2025	3	3	1	0	32	2	2025-12-28 00:10:15.258642
8	Tháng	04/2025	3	3	1	0	32	2	2025-12-28 00:10:15.258642
9	Tháng	05/2025	3	3	1	0	32	2	2025-12-28 00:10:15.258642
10	Tháng	06/2025	4	4	1	0	32	2	2025-12-28 00:10:15.258642
11	Tháng	07/2025	4	4	1	0	32	2	2025-12-28 00:10:15.258642
12	Tháng	08/2025	4	4	1	0	32	2	2025-12-28 00:10:15.258642
13	Tháng	09/2025	4	4	1	0	31	2	2025-12-28 00:10:15.258642
14	Tháng	10/2025	4	4	1	0	31	2	2025-12-28 00:10:15.258642
15	Tháng	11/2025	4	4	0	1	31	2	2025-12-28 00:10:15.258642
2	Tháng	12/2025	4	4	0	1	31	2	2025-12-28 00:10:15.258642
\.


--
-- Data for Name: thong_ke_gioi_tinh; Type: TABLE DATA; Schema: public; Owner: todanpho
--

COPY public.thong_ke_gioi_tinh (id, loai_thoi_gian, gia_tri_thoi_gian, so_nam, so_nu, tong_so, ngay_cap_nhat) FROM stdin;
3	Quý	Q4/2025	22	20	42	2025-12-28 00:10:15.258642
4	Năm	2025	22	20	42	2025-12-28 00:10:15.258642
5	Tháng	01/2025	20	20	40	2025-12-28 00:10:15.258642
6	Tháng	02/2025	20	20	40	2025-12-28 00:10:15.258642
7	Tháng	03/2025	21	20	41	2025-12-28 00:10:15.258642
8	Tháng	04/2025	21	20	41	2025-12-28 00:10:15.258642
9	Tháng	05/2025	21	20	41	2025-12-28 00:10:15.258642
10	Tháng	06/2025	23	20	43	2025-12-28 00:10:15.258642
11	Tháng	07/2025	23	20	43	2025-12-28 00:10:15.258642
12	Tháng	08/2025	23	20	43	2025-12-28 00:10:15.258642
13	Tháng	09/2025	22	20	42	2025-12-28 00:10:15.258642
14	Tháng	10/2025	22	20	42	2025-12-28 00:10:15.258642
15	Tháng	11/2025	22	20	42	2025-12-28 00:10:15.258642
2	Tháng	12/2025	22	20	42	2025-12-28 00:10:15.258642
\.


--
-- Name: thong_ke_bien_dong_id_seq; Type: SEQUENCE SET; Schema: public; Owner: todanpho
--

SELECT pg_catalog.setval('public.thong_ke_bien_dong_id_seq', 16, true);


--
-- Name: thong_ke_cu_tru_id_seq; Type: SEQUENCE SET; Schema: public; Owner: todanpho
--

SELECT pg_catalog.setval('public.thong_ke_cu_tru_id_seq', 16, true);


--
-- Name: thong_ke_do_tuoi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: todanpho
--

SELECT pg_catalog.setval('public.thong_ke_do_tuoi_id_seq', 16, true);


--
-- Name: thong_ke_gioi_tinh_id_seq; Type: SEQUENCE SET; Schema: public; Owner: todanpho
--

SELECT pg_catalog.setval('public.thong_ke_gioi_tinh_id_seq', 16, true);


--
-- Name: thong_ke_bien_dong thong_ke_bien_dong_pkey; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_bien_dong
    ADD CONSTRAINT thong_ke_bien_dong_pkey PRIMARY KEY (id);


--
-- Name: thong_ke_cu_tru thong_ke_cu_tru_pkey; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_cu_tru
    ADD CONSTRAINT thong_ke_cu_tru_pkey PRIMARY KEY (id);


--
-- Name: thong_ke_do_tuoi thong_ke_do_tuoi_pkey; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_do_tuoi
    ADD CONSTRAINT thong_ke_do_tuoi_pkey PRIMARY KEY (id);


--
-- Name: thong_ke_gioi_tinh thong_ke_gioi_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_gioi_tinh
    ADD CONSTRAINT thong_ke_gioi_tinh_pkey PRIMARY KEY (id);


--
-- Name: thong_ke_bien_dong unq_bien_dong; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_bien_dong
    ADD CONSTRAINT unq_bien_dong UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);


--
-- Name: thong_ke_cu_tru unq_cu_tru; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_cu_tru
    ADD CONSTRAINT unq_cu_tru UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);


--
-- Name: thong_ke_do_tuoi unq_do_tuoi; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_do_tuoi
    ADD CONSTRAINT unq_do_tuoi UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);


--
-- Name: thong_ke_gioi_tinh unq_gioi_tinh; Type: CONSTRAINT; Schema: public; Owner: todanpho
--

ALTER TABLE ONLY public.thong_ke_gioi_tinh
    ADD CONSTRAINT unq_gioi_tinh UNIQUE (loai_thoi_gian, gia_tri_thoi_gian);


--
-- PostgreSQL database dump complete
--

