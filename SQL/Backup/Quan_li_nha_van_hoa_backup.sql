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
-- Name: fn_tu_dong_them_lich(); Type: FUNCTION; Schema: public; Owner: todanpho
--

CREATE FUNCTION public.fn_tu_dong_them_lich() RETURNS trigger
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


ALTER FUNCTION public.fn_tu_dong_them_lich() OWNER TO todanpho;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: canbo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canbo (
    canboid integer NOT NULL,
    hoten character varying(100) NOT NULL,
    dienthoai character varying(20),
    chucdanh character varying(50) NOT NULL,
    CONSTRAINT chk_chucdanh CHECK (((chucdanh)::text = ANY (ARRAY[('Tổ trưởng'::character varying)::text, ('Tổ phó'::character varying)::text, ('Cán bộ quản lý cơ sở vật chất'::character varying)::text])))
);


ALTER TABLE public.canbo OWNER TO postgres;

--
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
-- Name: canbo_canboid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.canbo_canboid_seq OWNED BY public.canbo.canboid;


--
-- Name: dangkysudung; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dangkysudung (
    dangkyid integer NOT NULL,
    tensukien character varying(200),
    hotennguoidangky character varying(100) NOT NULL,
    dienthoai character varying(20),
    thoigianbatdau timestamp without time zone NOT NULL,
    thoigianketthuc timestamp without time zone NOT NULL,
    phisudung numeric(12,2),
    trangthai character varying(20) DEFAULT 'Chờ duyệt'::character varying,
    canbopheduyet integer,
    email character varying(100),
    loaihinhthue character varying(20),
    lydo text,
    cccd character varying(20),
    phongid integer,
    CONSTRAINT dangkysudung_check CHECK ((thoigianketthuc > thoigianbatdau)),
    CONSTRAINT dangkysudung_loaihinhthue_check CHECK (((loaihinhthue)::text = ANY ((ARRAY['CaNhan'::character varying, 'ToChuc'::character varying])::text[]))),
    CONSTRAINT dangkysudung_phisudung_check CHECK ((phisudung >= (0)::numeric)),
    CONSTRAINT dangkysudung_trangthai_check CHECK (((trangthai)::text = ANY (ARRAY[('Chờ duyệt'::character varying)::text, ('Đã duyệt'::character varying)::text, ('Từ chối'::character varying)::text])))
);


ALTER TABLE public.dangkysudung OWNER TO postgres;

--
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
-- Name: dangkysudung_dangkyid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dangkysudung_dangkyid_seq OWNED BY public.dangkysudung.dangkyid;


--
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
-- Name: hoatdongchung_hdchungid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hoatdongchung_hdchungid_seq OWNED BY public.hoatdongchung.hdchungid;


--
-- Name: kiemtrataisan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kiemtrataisan (
    kttid integer NOT NULL,
    taisanid integer,
    canboid integer NOT NULL,
    ngaykiemtra date NOT NULL,
    soluongthucte integer,
    tinhtrang character varying(200),
    ghichu character varying(300),
    CONSTRAINT kiemtrataisan_soluongthucte_check CHECK ((soluongthucte >= 0))
);


ALTER TABLE public.kiemtrataisan OWNER TO postgres;

--
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
-- Name: kiemtrataisan_kttid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kiemtrataisan_kttid_seq OWNED BY public.kiemtrataisan.kttid;


--
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
    CONSTRAINT lichsudungphong_loaihoatdong_check CHECK (((loaihoatdong)::text = ANY (ARRAY[('Chung'::character varying)::text, ('Rieng'::character varying)::text])))
);


ALTER TABLE public.lichsudungphong OWNER TO postgres;

--
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
-- Name: lichsudungphong_lichid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichsudungphong_lichid_seq OWNED BY public.lichsudungphong.lichid;


--
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
-- Name: phong_phongid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.phong_phongid_seq OWNED BY public.phong.phongid;


--
-- Name: taisan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taisan (
    taisanid integer NOT NULL,
    tentaisan character varying(100) NOT NULL,
    soluong integer,
    tinhtrang character varying(200),
    nhaid integer NOT NULL,
    phongid integer,
    CONSTRAINT taisan_soluong_check CHECK ((soluong >= 0))
);


ALTER TABLE public.taisan OWNER TO postgres;

--
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
-- Name: taisan_taisanid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.taisan_taisanid_seq OWNED BY public.taisan.taisanid;


--
-- Name: canbo canboid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canbo ALTER COLUMN canboid SET DEFAULT nextval('public.canbo_canboid_seq'::regclass);


--
-- Name: dangkysudung dangkyid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dangkysudung ALTER COLUMN dangkyid SET DEFAULT nextval('public.dangkysudung_dangkyid_seq'::regclass);


--
-- Name: hoatdongchung hdchungid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdongchung ALTER COLUMN hdchungid SET DEFAULT nextval('public.hoatdongchung_hdchungid_seq'::regclass);


--
-- Name: kiemtrataisan kttid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan ALTER COLUMN kttid SET DEFAULT nextval('public.kiemtrataisan_kttid_seq'::regclass);


--
-- Name: lichsudungphong lichid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong ALTER COLUMN lichid SET DEFAULT nextval('public.lichsudungphong_lichid_seq'::regclass);


--
-- Name: phong phongid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phong ALTER COLUMN phongid SET DEFAULT nextval('public.phong_phongid_seq'::regclass);


--
-- Name: taisan taisanid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taisan ALTER COLUMN taisanid SET DEFAULT nextval('public.taisan_taisanid_seq'::regclass);


--
-- Data for Name: canbo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.canbo (canboid, hoten, dienthoai, chucdanh) FROM stdin;
1	Nguyễn Văn A	0901111111	Tổ trưởng
2	Trần Thị B	0902222222	Tổ phó
3	Lê Văn C	0903333333	Cán bộ quản lý cơ sở vật chất
4	Phạm Văn Z	0904444444	Cán bộ quản lý cơ sở vật chất
\.


--
-- Data for Name: dangkysudung; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dangkysudung (dangkyid, tensukien, hotennguoidangky, dienthoai, thoigianbatdau, thoigianketthuc, phisudung, trangthai, canbopheduyet, email, loaihinhthue, lydo, cccd, phongid) FROM stdin;
4	Đám giỗ	Vũ Thị F	123456789	2025-12-28 08:00:00	2025-12-28 11:00:00	\N	Từ chối	\N	vuthif@gmail.com	CaNhan	đã có hoạt động chung trước đó không thể duyệt	001175000006	1
5	Đám cưới con gái	Vũ Thị F	12327483247	2025-12-31 08:00:00	2025-12-31 11:00:00	\N	Từ chối	\N	vuthif@gmail.com	CaNhan	do co viec vao ngay hom ay	001175000006	1
\.


--
-- Data for Name: hoatdongchung; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hoatdongchung (hdchungid, tenhoatdong, thoigianbatdau, thoigianketthuc, ghichu) FROM stdin;
501	Hội Nghị Tổ Dân Phố Quý IV	2025-12-10 19:00:00	2025-12-10 21:00:00	Báo cáo tổng kết năm
502	Lớp Yoga Miễn Phí	2025-12-15 08:00:00	2025-12-15 09:30:00	Buổi tập thử nghiệm
1	Họp TDP cuối năm	2025-12-31 08:00:00	2025-12-31 22:00:00	Họp tổng kết cuối năm
2	Tổng vệ sinh TDP	2025-12-30 16:00:00	2025-12-30 18:00:00	Chuẩn bị dụng cụ cần thiết như chổi, hót rác,v.v
\.


--
-- Data for Name: kiemtrataisan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kiemtrataisan (kttid, taisanid, canboid, ngaykiemtra, soluongthucte, tinhtrang, ghichu) FROM stdin;
6	104	1	2025-12-28	2	Hỏng nặng	
\.


--
-- Data for Name: lichsudungphong; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichsudungphong (lichid, phongid, thoigianbatdau, thoigianketthuc, loaihoatdong, hdchungid, dangkyid) FROM stdin;
1	1	2025-12-31 08:00:00	2025-12-31 22:00:00	Chung	1	\N
2	1	2025-12-30 16:00:00	2025-12-30 18:00:00	Chung	2	\N
\.


--
-- Data for Name: nhavanhoa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nhavanhoa (nhaid, tennha, namsudung, dientichkhuonvien, dientichxaydung, ghichu) FROM stdin;
1	Nhà Văn Hóa Tổ Dân Phố La Khê	2005	1000	500	Địa điểm sinh hoạt văn hóa, thể thao cho cộng đồng.
\.


--
-- Data for Name: phong; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phong (phongid, nhaid, tenphong, tang, dientich, congnang) FROM stdin;
1	1	Hội Trường Lớn	1	300	Tổ chức sự kiện, hội nghị, văn nghệ
2	1	Phòng Sinh Hoạt Cộng Đồng	1	100	Họp tổ dân phố, CLB người cao tuổi
3	1	Phòng Đa Năng	2	50	Tập Aerobic, Yoga, hội thảo nhóm nhỏ
4	1	Phòng Thiết Bị	2	30	Kho chứa đồ và thiết bị âm thanh
5	1	Phòng Sinh hoạt Thanh niên	2	60	Không gian sinh hoạt và làm việc nhóm của Đoàn Thanh niên
6	1	Phòng Nghiên cứu & Tài liệu	2	40	Thư viện nhỏ, phòng đọc
\.


--
-- Data for Name: taisan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taisan (taisanid, tentaisan, soluong, tinhtrang, nhaid, phongid) FROM stdin;
101	Ghế nhựa cao cấp	150	Tốt	1	1
102	Bàn hội nghị	20	Tốt	1	1
103	Hệ thống âm thanh (Bộ)	1	Tốt, mới bảo trì	1	1
104	Máy chiếu (Bộ)	2	Cần thay bóng 1 cái	1	1
105	Quạt treo tường	15	Tốt	1	1
106	Bảng thông báo điện tử	1	Mới 100%	1	1
107	Tivi Sony 65 inch	1	Tốt	1	2
108	Bộ ấm chén pha trà	10	Tốt	1	2
109	Bình nước nóng lạnh	2	Mới	1	2
110	Tủ kính trưng bày bằng khen	2	Tốt	1	2
111	Bàn ghế sofa tiếp khách	1	Tốt	1	2
112	Thảm tập Yoga	30	Tốt	1	3
113	Gương lớn áp tường (m2)	20	Tốt	1	3
114	Bộ dụng cụ tập thể dục	5	Cũ, cần bảo dưỡng	1	3
115	Máy lạnh Inverter 2HP	4	Tốt	1	3
116	Loa Bluetooth di động	1	Tốt	1	3
117	Amply & Micro không dây	4	Tốt	1	4
118	Bộ đàm liên lạc	12	Tốt	1	4
119	Cuộn dây cáp loa 50m	3	Mới	1	4
120	Tủ sắt đựng thiết bị	2	Khóa hơi rít	1	4
121	Bục phát biểu gỗ	1	Tốt	1	4
122	Bàn làm việc nhóm lớn	3	Tốt	1	5
123	Bảng trắng viết bút dạ	2	Tốt	1	5
124	Bộ trống lân	2	Cũ	1	5
125	Bộ cờ vua, cờ tướng	15	Tốt	1	5
126	Đàn Guitar Acoustic	3	Tốt	1	5
127	Cờ Đoàn, cờ Đội (Bộ)	5	Mới	1	5
128	Kệ sách gỗ lớn	8	Mới	1	6
129	Máy tính để bàn	5	Hoạt động bình thường	1	6
130	Máy scan tài liệu	1	Tốt	1	6
131	Bàn đọc sách cá nhân	10	Tốt	1	6
132	Đèn bàn học	10	Tốt	1	6
133	Máy in HP đa năng	1	Hết mực	1	6
\.


--
-- Name: canbo_canboid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canbo_canboid_seq', 1, false);


--
-- Name: dangkysudung_dangkyid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dangkysudung_dangkyid_seq', 5, true);


--
-- Name: hoatdongchung_hdchungid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hoatdongchung_hdchungid_seq', 2, true);


--
-- Name: kiemtrataisan_kttid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kiemtrataisan_kttid_seq', 6, true);


--
-- Name: lichsudungphong_lichid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichsudungphong_lichid_seq', 2, true);


--
-- Name: phong_phongid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.phong_phongid_seq', 1, false);


--
-- Name: taisan_taisanid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.taisan_taisanid_seq', 1, false);


--
-- Name: canbo canbo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canbo
    ADD CONSTRAINT canbo_pkey PRIMARY KEY (canboid);


--
-- Name: dangkysudung dangkysudung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dangkysudung
    ADD CONSTRAINT dangkysudung_pkey PRIMARY KEY (dangkyid);


--
-- Name: hoatdongchung hoatdongchung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdongchung
    ADD CONSTRAINT hoatdongchung_pkey PRIMARY KEY (hdchungid);


--
-- Name: kiemtrataisan kiemtrataisan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT kiemtrataisan_pkey PRIMARY KEY (kttid);


--
-- Name: lichsudungphong lichsudungphong_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_pkey PRIMARY KEY (lichid);


--
-- Name: nhavanhoa nhavanhoa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhavanhoa
    ADD CONSTRAINT nhavanhoa_pkey PRIMARY KEY (nhaid);


--
-- Name: phong phong_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phong
    ADD CONSTRAINT phong_pkey PRIMARY KEY (phongid);


--
-- Name: taisan taisan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taisan
    ADD CONSTRAINT taisan_pkey PRIMARY KEY (taisanid);


--
-- Name: kiemtrataisan uq_kiemtra; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT uq_kiemtra UNIQUE (taisanid, ngaykiemtra);


--
-- Name: phong uq_tenphong; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phong
    ADD CONSTRAINT uq_tenphong UNIQUE (tenphong);


--
-- Name: dangkysudung trg_tu_dong_them_lich; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tu_dong_them_lich AFTER UPDATE OF trangthai ON public.dangkysudung FOR EACH ROW EXECUTE FUNCTION public.fn_tu_dong_them_lich();


--
-- Name: dangkysudung dangkysudung_canbopheduyet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dangkysudung
    ADD CONSTRAINT dangkysudung_canbopheduyet_fkey FOREIGN KEY (canbopheduyet) REFERENCES public.canbo(canboid);


--
-- Name: dangkysudung fk_dangkysudung_phong; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dangkysudung
    ADD CONSTRAINT fk_dangkysudung_phong FOREIGN KEY (phongid) REFERENCES public.phong(phongid);


--
-- Name: taisan fk_taisan_phong; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taisan
    ADD CONSTRAINT fk_taisan_phong FOREIGN KEY (phongid) REFERENCES public.phong(phongid);


--
-- Name: kiemtrataisan kiemtrataisan_canboid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT kiemtrataisan_canboid_fkey FOREIGN KEY (canboid) REFERENCES public.canbo(canboid);


--
-- Name: kiemtrataisan kiemtrataisan_taisanid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kiemtrataisan
    ADD CONSTRAINT kiemtrataisan_taisanid_fkey FOREIGN KEY (taisanid) REFERENCES public.taisan(taisanid) ON DELETE SET NULL;


--
-- Name: lichsudungphong lichsudungphong_dangkyid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_dangkyid_fkey FOREIGN KEY (dangkyid) REFERENCES public.dangkysudung(dangkyid);


--
-- Name: lichsudungphong lichsudungphong_hdchungid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_hdchungid_fkey FOREIGN KEY (hdchungid) REFERENCES public.hoatdongchung(hdchungid);


--
-- Name: lichsudungphong lichsudungphong_phongid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichsudungphong
    ADD CONSTRAINT lichsudungphong_phongid_fkey FOREIGN KEY (phongid) REFERENCES public.phong(phongid);


--
-- Name: phong phong_nhaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phong
    ADD CONSTRAINT phong_nhaid_fkey FOREIGN KEY (nhaid) REFERENCES public.nhavanhoa(nhaid);


--
-- Name: taisan taisan_nhaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taisan
    ADD CONSTRAINT taisan_nhaid_fkey FOREIGN KEY (nhaid) REFERENCES public.nhavanhoa(nhaid);


--
-- PostgreSQL database dump complete
--

