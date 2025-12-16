--
-- PostgreSQL database dump
--

\restrict LrQG0q3avidhQBsabt7b4Z4FwKJAdgRkK2sdhohDCzfEA2HoiUG2psY0naVDBH4

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

-- Started on 2025-12-16 13:10:30

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4941 (class 1262 OID 33283)
-- Name: Quan_li_nha_van_hoa; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "Quan_li_nha_van_hoa" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Vietnamese_Vietnam.932';


ALTER DATABASE "Quan_li_nha_van_hoa" OWNER TO postgres;

\unrestrict LrQG0q3avidhQBsabt7b4Z4FwKJAdgRkK2sdhohDCzfEA2HoiUG2psY0naVDBH4
\connect "Quan_li_nha_van_hoa"
\restrict LrQG0q3avidhQBsabt7b4Z4FwKJAdgRkK2sdhohDCzfEA2HoiUG2psY0naVDBH4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 232 (class 1255 OID 33418)
-- Name: fn_add_lich_rieng(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_add_lich_rieng() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Chỉ xử lý khi trạng thái chuyển sang 'Đã duyệt'
    IF NEW.trangthai = 'Đã duyệt'
       AND (OLD.trangthai IS DISTINCT FROM 'Đã duyệt') THEN

        -- Tránh insert trùng
        IF NOT EXISTS (
            SELECT 1
            FROM lichsudungphong
            WHERE dangkyid = NEW.dangkyid
        ) THEN
            INSERT INTO lichsudungphong (
                phongid,
                loaihoatdong,
                dangkyid,
                thoigianbatdau,
                thoigianketthuc
            )
            VALUES (
                1,              -- hội trường
                'Rieng',
                NEW.dangkyid,
                NEW.thoigianbatdau,
                NEW.thoigianketthuc
            );
        END IF;

    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_add_lich_rieng() OWNER TO postgres;

--
-- TOC entry 231 (class 1255 OID 33411)
-- Name: fn_tao_lich_hd_chung(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_tao_lich_hd_chung() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO LichSuDungPhong (
        PhongID,
        ThoiGianBatDau,
        ThoiGianKetThuc,
        LoaiHoatDong,
        HDChungID
    )
    VALUES (
        1, -- phòng sử dụng (chọn từ giao diện)
        NEW.ThoiGianBatDau,
        NEW.ThoiGianKetThuc,
        'Chung',
        NEW.HDChungID
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_tao_lich_hd_chung() OWNER TO postgres;

--
-- TOC entry 230 (class 1255 OID 33409)
-- Name: fn_tao_lich_sau_duyet(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_tao_lich_sau_duyet() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.TrangThai = 'Đã duyệt' AND OLD.TrangThai <> 'Đã duyệt' THEN
        INSERT INTO LichSuDungPhong (
            PhongID,
            ThoiGianBatDau,
            ThoiGianKetThuc,
            LoaiHoatDong,
            DangKyID
        )
        VALUES (
            1, -- phòng được duyệt (có thể chọn từ giao diện)
            NEW.ThoiGianBatDau,
            NEW.ThoiGianKetThuc,
            'Rieng',
            NEW.DangKyID
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_tao_lich_sau_duyet() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 33326)
-- Name: canbo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canbo (
    canboid integer NOT NULL,
    hoten character varying(100) NOT NULL,
    dienthoai character varying(20),
    chucdanh character varying(50) NOT NULL,
    CONSTRAINT chk_chucdanh CHECK (((chucdanh)::text = ANY ((ARRAY['Tổ trưởng'::character varying, 'Tổ phó'::character varying, 'Cán bộ quản lý cơ sở vật chất'::character varying])::text[])))
);


ALTER TABLE public.canbo OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33325)
-- Name: canbo_canboid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.canbo_canboid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.canbo_canboid_seq OWNER TO postgres;

--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 220
-- Name: canbo_canboid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.canbo_canboid_seq OWNED BY public.canbo.canboid;


--
-- TOC entry 227 (class 1259 OID 33369)
-- Name: dangkysudung; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dangkysudung (
    dangkyid integer NOT NULL,
    tensukien character varying(200) NOT NULL,
    hotennguoidangky character varying(100) NOT NULL,
    dienthoai character varying(20),
    thoigianbatdau timestamp without time zone NOT NULL,
    thoigianketthuc timestamp without time zone NOT NULL,
    phisudung numeric(12,2),
    trangthai character varying(20) DEFAULT 'Chờ duyệt'::character varying,
    canbopheduyet integer,
    CONSTRAINT dangkysudung_check CHECK ((thoigianketthuc > thoigianbatdau)),
    CONSTRAINT dangkysudung_phisudung_check CHECK ((phisudung >= (0)::numeric)),
    CONSTRAINT dangkysudung_trangthai_check CHECK (((trangthai)::text = ANY ((ARRAY['Chờ duyệt'::character varying, 'Đã duyệt'::character varying, 'Từ chối'::character varying])::text[])))
);


ALTER TABLE public.dangkysudung OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 33368)
-- Name: dangkysudung_dangkyid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dangkysudung_dangkyid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dangkysudung_dangkyid_seq OWNER TO postgres;

--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 226
-- Name: dangkysudung_dangkyid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dangkysudung_dangkyid_seq OWNED BY public.dangkysudung.dangkyid;


--
-- TOC entry 219 (class 1259 OID 33310)
-- Name: hoatdongchung; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hoatdongchung (
    hdchungid integer NOT NULL,
    tenhoatdong character varying(200) NOT NULL,
    thoigianbatdau timestamp without time zone NOT NULL,
    thoigianketthuc timestamp without time zone NOT NULL,
    ghichu character varying(300),
    CONSTRAINT hoatdongchung_check CHECK ((thoigianketthuc > thoigianbatdau))
);


ALTER TABLE public.hoatdongchung OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 33309)
-- Name: hoatdongchung_hdchungid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hoatdongchung_hdchungid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hoatdongchung_hdchungid_seq OWNER TO postgres;

--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 218
-- Name: hoatdongchung_hdchungid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hoatdongchung_hdchungid_seq OWNED BY public.hoatdongchung.hdchungid;


--
-- TOC entry 225 (class 1259 OID 33347)
-- Name: kiemtrataisan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kiemtrataisan (
    kttid integer NOT NULL,
    taisanid integer NOT NULL,
    canboid integer NOT NULL,
    ngaykiemtra date NOT NULL,
    soluongthucte integer,
    tinhtrang character varying(200),
    ghichu character varying(300),
    CONSTRAINT kiemtrataisan_soluongthucte_check CHECK ((soluongthucte >= 0))
);


ALTER TABLE public.kiemtrataisan OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33346)
-- Name: kiemtrataisan_kttid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kiemtrataisan_kttid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kiemtrataisan_kttid_seq OWNER TO postgres;

--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 224
-- Name: kiemtrataisan_kttid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kiemtrataisan_kttid_seq OWNED BY public.kiemtrataisan.kttid;


--
-- TOC entry 229 (class 1259 OID 33385)
-- Name: lichsudungphong; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lichsudungphong (
    lichid integer NOT NULL,
    phongid integer NOT NULL,
    thoigianbatdau timestamp without time zone NOT NULL,
    thoigianketthuc timestamp without time zone NOT NULL,
    loaihoatdong character varying(20),
    hdchungid integer,
    dangkyid integer,
    CONSTRAINT lichsudungphong_check CHECK ((thoigianketthuc > thoigianbatdau)),
    CONSTRAINT lichsudungphong_check1 CHECK (((((loaihoatdong)::text = 'Chung'::text) AND (hdchungid IS NOT NULL) AND (dangkyid IS NULL)) OR (((loaihoatdong)::text = 'Rieng'::text) AND (dangkyid IS NOT NULL) AND (hdchungid IS NULL)))),
    CONSTRAINT lichsudungphong_loaihoatdong_check CHECK (((loaihoatdong)::text = ANY ((ARRAY['Chung'::character varying, 'Rieng'::character varying])::text[])))
);


ALTER TABLE public.lichsudungphong OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33384)
-- Name: lichsudungphong_lichid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lichsudungphong_lichid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lichsudungphong_lichid_seq OWNER TO postgres;

--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 228
-- Name: lichsudungphong_lichid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichsudungphong_lichid_seq OWNED BY public.lichsudungphong.lichid;


--
-- TOC entry 215 (class 1259 OID 33284)
-- Name: nhavanhoa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nhavanhoa (
    nhaid integer NOT NULL,
    tennha character varying(200) NOT NULL,
    namsudung integer,
    dientichkhuonvien integer,
    dientichxaydung integer,
    ghichu character varying(300),
    CONSTRAINT nhavanhoa_dientichkhuonvien_check CHECK ((dientichkhuonvien > 0)),
    CONSTRAINT nhavanhoa_dientichxaydung_check CHECK ((dientichxaydung > 0)),
    CONSTRAINT nhavanhoa_namsudung_check CHECK ((namsudung >= 2000)),
    CONSTRAINT nhavanhoa_nhaid_check CHECK ((nhaid = 1))
);


ALTER TABLE public.nhavanhoa OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 33296)
-- Name: phong; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.phong (
    phongid integer NOT NULL,
    nhaid integer NOT NULL,
    tenphong character varying(100) NOT NULL,
    tang integer,
    dientich integer,
    congnang character varying(200),
    CONSTRAINT phong_dientich_check CHECK ((dientich > 0)),
    CONSTRAINT phong_tang_check CHECK ((tang > 0))
);


ALTER TABLE public.phong OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 33295)
-- Name: phong_phongid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.phong_phongid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.phong_phongid_seq OWNER TO postgres;

--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 216
-- Name: phong_phongid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.phong_phongid_seq OWNED BY public.phong.phongid;


--
-- TOC entry 223 (class 1259 OID 33334)
-- Name: taisan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taisan (
    taisanid integer NOT NULL,
    tentaisan character varying(100) NOT NULL,
    soluong integer,
    tinhtrang character varying(200),
    nhaid integer NOT NULL,
    CONSTRAINT taisan_soluong_check CHECK ((soluong >= 0))
);


ALTER TABLE public.taisan OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33333)
-- Name: taisan_taisanid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.taisan_taisanid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taisan_taisanid_seq OWNER TO postgres;

--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 222
-- Name: taisan_taisanid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.taisan_taisanid_seq OWNED BY public.taisan.taisanid;


--
-- TOC entry 4727 (class 2604 OID 33329)
-- Name: canbo canboid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canbo ALTER COLUMN canboid SET DEFAULT nextval('public.canbo_canboid_seq'::regclass);


--
-- TOC entry 4730 (class 2604 OID 33372)
-- Name: dangkysudung dangkyid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dangkysudung ALTER COLUMN dangkyid SET DEFAULT nextval('public.dangkysudung_dangkyid_seq'::regclass);


--
-- TOC entry 4726 (class 2604 OID 33313)
-- Name: hoatdongchung hdchungid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdongchung ALTER COLUMN hdchungid SET DEFAULT nextval('public.hoatdongchung_hdchungid_seq'::regclass);


--
-- TOC entry 4729 (class 2604 OID 33350)
-- Name: kiemtrataisan kttid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan ALTER COLUMN kttid SET DEFAULT nextval('public.kiemtrataisan_kttid_seq'::regclass);


--
-- TOC entry 4732 (class 2604 OID 33388)
-- Name: lichsudungphong lichid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong ALTER COLUMN lichid SET DEFAULT nextval('public.lichsudungphong_lichid_seq'::regclass);


--
-- TOC entry 4725 (class 2604 OID 33299)
-- Name: phong phongid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phong ALTER COLUMN phongid SET DEFAULT nextval('public.phong_phongid_seq'::regclass);


--
-- TOC entry 4728 (class 2604 OID 33337)
-- Name: taisan taisanid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taisan ALTER COLUMN taisanid SET DEFAULT nextval('public.taisan_taisanid_seq'::regclass);


--
-- TOC entry 4927 (class 0 OID 33326)
-- Dependencies: 221
-- Data for Name: canbo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.canbo VALUES (1, 'Nguyễn Văn A', '0901111111', 'Tổ trưởng');
INSERT INTO public.canbo VALUES (2, 'Trần Thị B', '0902222222', 'Tổ phó');
INSERT INTO public.canbo VALUES (3, 'Lê Văn C', '0903333333', 'Cán bộ quản lý cơ sở vật chất');
INSERT INTO public.canbo VALUES (4, 'Phạm Văn Z', '0904444444', 'Cán bộ quản lý cơ sở vật chất');


--
-- TOC entry 4933 (class 0 OID 33369)
-- Dependencies: 227
-- Data for Name: dangkysudung; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.dangkysudung VALUES (601, 'Liên Hoan Cuối Năm Công Ty X', 'Nguyễn Văn I', '0919999999', '2025-12-25 18:00:00', '2025-12-25 22:00:00', 5000000.00, 'Đã duyệt', 1);
INSERT INTO public.dangkysudung VALUES (603, 'Sự kiện ra mắt sản phẩm', 'Trần Văn K', '0976666666', '2026-01-05 09:00:00', '2026-01-05 12:00:00', 3000000.00, 'Từ chối', 2);
INSERT INTO public.dangkysudung VALUES (602, 'Tổ chức tiệc sinh nhật', 'Lê Thị D', '0987777777', '2025-12-30 15:00:00', '2025-12-30 18:00:00', 1500000.00, 'Đã duyệt', NULL);


--
-- TOC entry 4925 (class 0 OID 33310)
-- Dependencies: 219
-- Data for Name: hoatdongchung; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.hoatdongchung VALUES (501, 'Hội Nghị Tổ Dân Phố Quý IV', '2025-12-10 19:00:00', '2025-12-10 21:00:00', 'Báo cáo tổng kết năm');
INSERT INTO public.hoatdongchung VALUES (502, 'Lớp Yoga Miễn Phí', '2025-12-15 08:00:00', '2025-12-15 09:30:00', 'Buổi tập thử nghiệm');


--
-- TOC entry 4931 (class 0 OID 33347)
-- Dependencies: 225
-- Data for Name: kiemtrataisan; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kiemtrataisan VALUES (1, 101, 3, '2025-10-01', 150, 'Đầy đủ', 'Kiểm kê định kỳ đầu quý');
INSERT INTO public.kiemtrataisan VALUES (2, 104, 4, '2025-10-15', 2, 'Cần thay bóng 1 cái', 'Kiểm tra máy chiếu trước sự kiện');
INSERT INTO public.kiemtrataisan VALUES (3, 103, 3, '2025-11-20', 1, 'Âm thanh tốt', 'Kiểm tra sau bảo trì');
INSERT INTO public.kiemtrataisan VALUES (4, 106, 4, '2025-12-10', 1, 'Hoạt động tốt', 'Kiểm tra sau khi lắp đặt');
INSERT INTO public.kiemtrataisan VALUES (5, 108, 3, '2025-12-12', 2, 'Hoạt động được, nhưng cần thay thế đệm', 'Kiểm tra dụng cụ tập thể dục');


--
-- TOC entry 4935 (class 0 OID 33385)
-- Dependencies: 229
-- Data for Name: lichsudungphong; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.lichsudungphong VALUES (1, 1, '2025-12-10 19:00:00', '2025-12-10 21:00:00', 'Chung', 501, NULL);
INSERT INTO public.lichsudungphong VALUES (2, 1, '2025-12-15 08:00:00', '2025-12-15 09:30:00', 'Chung', 502, NULL);
INSERT INTO public.lichsudungphong VALUES (3, 1, '2025-12-30 15:00:00', '2025-12-30 18:00:00', 'Rieng', NULL, 602);
INSERT INTO public.lichsudungphong VALUES (4, 1, '2025-12-30 15:00:00', '2025-12-30 18:00:00', 'Rieng', NULL, 602);


--
-- TOC entry 4921 (class 0 OID 33284)
-- Dependencies: 215
-- Data for Name: nhavanhoa; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nhavanhoa VALUES (1, 'Nhà Văn Hóa Tổ Dân Phố La Khê', 2005, 1000, 500, 'Địa điểm sinh hoạt văn hóa, thể thao cho cộng đồng.');


--
-- TOC entry 4923 (class 0 OID 33296)
-- Dependencies: 217
-- Data for Name: phong; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.phong VALUES (1, 1, 'Hội Trường Lớn', 1, 300, 'Tổ chức sự kiện, hội nghị, văn nghệ');
INSERT INTO public.phong VALUES (2, 1, 'Phòng Sinh Hoạt Cộng Đồng', 1, 100, 'Họp tổ dân phố, CLB người cao tuổi');
INSERT INTO public.phong VALUES (3, 1, 'Phòng Đa Năng', 2, 50, 'Tập Aerobic, Yoga, hội thảo nhóm nhỏ');
INSERT INTO public.phong VALUES (4, 1, 'Phòng Thiết Bị', 2, 30, 'Kho chứa đồ và thiết bị âm thanh');
INSERT INTO public.phong VALUES (5, 1, 'Phòng Sinh hoạt Thanh niên', 2, 60, 'Không gian sinh hoạt và làm việc nhóm của Đoàn Thanh niên');
INSERT INTO public.phong VALUES (6, 1, 'Phòng Nghiên cứu & Tài liệu', 2, 40, 'Thư viện nhỏ, phòng đọc');


--
-- TOC entry 4929 (class 0 OID 33334)
-- Dependencies: 223
-- Data for Name: taisan; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.taisan VALUES (101, 'Ghế nhựa cao cấp', 150, 'Tốt', 1);
INSERT INTO public.taisan VALUES (102, 'Bàn hội nghị', 20, 'Tốt', 1);
INSERT INTO public.taisan VALUES (103, 'Hệ thống âm thanh (Bộ)', 1, 'Tốt, mới bảo trì', 1);
INSERT INTO public.taisan VALUES (104, 'Máy chiếu (Bộ)', 2, 'Cần thay bóng 1 cái', 1);
INSERT INTO public.taisan VALUES (105, 'Quạt treo tường', 15, 'Tốt', 1);
INSERT INTO public.taisan VALUES (106, 'Bảng thông báo điện tử', 1, 'Mới 100%', 1);
INSERT INTO public.taisan VALUES (107, 'Máy lạnh Inverter 2HP', 6, 'Tốt', 1);
INSERT INTO public.taisan VALUES (108, 'Bộ dụng cụ tập thể dục', 2, 'Cũ, cần bảo dưỡng', 1);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 220
-- Name: canbo_canboid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canbo_canboid_seq', 1, false);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 226
-- Name: dangkysudung_dangkyid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dangkysudung_dangkyid_seq', 1, false);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 218
-- Name: hoatdongchung_hdchungid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hoatdongchung_hdchungid_seq', 1, false);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 224
-- Name: kiemtrataisan_kttid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kiemtrataisan_kttid_seq', 5, true);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 228
-- Name: lichsudungphong_lichid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichsudungphong_lichid_seq', 4, true);


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 216
-- Name: phong_phongid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.phong_phongid_seq', 1, false);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 222
-- Name: taisan_taisanid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.taisan_taisanid_seq', 1, false);


--
-- TOC entry 4756 (class 2606 OID 33332)
-- Name: canbo canbo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canbo
    ADD CONSTRAINT canbo_pkey PRIMARY KEY (canboid);


--
-- TOC entry 4764 (class 2606 OID 33378)
-- Name: dangkysudung dangkysudung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dangkysudung
    ADD CONSTRAINT dangkysudung_pkey PRIMARY KEY (dangkyid);


--
-- TOC entry 4754 (class 2606 OID 33318)
-- Name: hoatdongchung hoatdongchung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdongchung
    ADD CONSTRAINT hoatdongchung_pkey PRIMARY KEY (hdchungid);


--
-- TOC entry 4760 (class 2606 OID 33355)
-- Name: kiemtrataisan kiemtrataisan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT kiemtrataisan_pkey PRIMARY KEY (kttid);


--
-- TOC entry 4766 (class 2606 OID 33393)
-- Name: lichsudungphong lichsudungphong_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_pkey PRIMARY KEY (lichid);


--
-- TOC entry 4750 (class 2606 OID 33294)
-- Name: nhavanhoa nhavanhoa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhavanhoa
    ADD CONSTRAINT nhavanhoa_pkey PRIMARY KEY (nhaid);


--
-- TOC entry 4752 (class 2606 OID 33303)
-- Name: phong phong_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phong
    ADD CONSTRAINT phong_pkey PRIMARY KEY (phongid);


--
-- TOC entry 4758 (class 2606 OID 33340)
-- Name: taisan taisan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taisan
    ADD CONSTRAINT taisan_pkey PRIMARY KEY (taisanid);


--
-- TOC entry 4762 (class 2606 OID 33357)
-- Name: kiemtrataisan uq_kiemtra; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT uq_kiemtra UNIQUE (taisanid, ngaykiemtra);


--
-- TOC entry 4776 (class 2620 OID 33419)
-- Name: dangkysudung trg_add_lich_rieng; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_add_lich_rieng AFTER UPDATE OF trangthai ON public.dangkysudung FOR EACH ROW EXECUTE FUNCTION public.fn_add_lich_rieng();


--
-- TOC entry 4777 (class 2620 OID 33410)
-- Name: dangkysudung trg_duyet_tao_lich; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_duyet_tao_lich AFTER UPDATE OF trangthai ON public.dangkysudung FOR EACH ROW EXECUTE FUNCTION public.fn_tao_lich_sau_duyet();


--
-- TOC entry 4775 (class 2620 OID 33412)
-- Name: hoatdongchung trg_tao_lich_hd_chung; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tao_lich_hd_chung AFTER INSERT ON public.hoatdongchung FOR EACH ROW EXECUTE FUNCTION public.fn_tao_lich_hd_chung();


--
-- TOC entry 4771 (class 2606 OID 33379)
-- Name: dangkysudung dangkysudung_canbopheduyet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dangkysudung
    ADD CONSTRAINT dangkysudung_canbopheduyet_fkey FOREIGN KEY (canbopheduyet) REFERENCES public.canbo(canboid);


--
-- TOC entry 4769 (class 2606 OID 33363)
-- Name: kiemtrataisan kiemtrataisan_canboid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT kiemtrataisan_canboid_fkey FOREIGN KEY (canboid) REFERENCES public.canbo(canboid);


--
-- TOC entry 4770 (class 2606 OID 33358)
-- Name: kiemtrataisan kiemtrataisan_taisanid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT kiemtrataisan_taisanid_fkey FOREIGN KEY (taisanid) REFERENCES public.taisan(taisanid);


--
-- TOC entry 4772 (class 2606 OID 33404)
-- Name: lichsudungphong lichsudungphong_dangkyid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_dangkyid_fkey FOREIGN KEY (dangkyid) REFERENCES public.dangkysudung(dangkyid);


--
-- TOC entry 4773 (class 2606 OID 33399)
-- Name: lichsudungphong lichsudungphong_hdchungid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_hdchungid_fkey FOREIGN KEY (hdchungid) REFERENCES public.hoatdongchung(hdchungid);


--
-- TOC entry 4774 (class 2606 OID 33394)
-- Name: lichsudungphong lichsudungphong_phongid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_phongid_fkey FOREIGN KEY (phongid) REFERENCES public.phong(phongid);


--
-- TOC entry 4767 (class 2606 OID 33304)
-- Name: phong phong_nhaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phong
    ADD CONSTRAINT phong_nhaid_fkey FOREIGN KEY (nhaid) REFERENCES public.nhavanhoa(nhaid);


--
-- TOC entry 4768 (class 2606 OID 33341)
-- Name: taisan taisan_nhaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taisan
    ADD CONSTRAINT taisan_nhaid_fkey FOREIGN KEY (nhaid) REFERENCES public.nhavanhoa(nhaid);


-- Completed on 2025-12-16 13:10:31

--
-- PostgreSQL database dump complete
--

\unrestrict LrQG0q3avidhQBsabt7b4Z4FwKJAdgRkK2sdhohDCzfEA2HoiUG2psY0naVDBH4

