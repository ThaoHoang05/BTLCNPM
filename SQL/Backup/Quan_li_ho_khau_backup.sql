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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: biendonghokhau; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biendonghokhau (
    biendongid integer NOT NULL,
    sohokhau character varying(20) NOT NULL,
    noidungthaydoi text NOT NULL,
    ngaythaydoi date NOT NULL
);


ALTER TABLE public.biendonghokhau OWNER TO postgres;

--
-- Name: biendonghokhau_biendongid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.biendonghokhau_biendongid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.biendonghokhau_biendongid_seq OWNER TO postgres;

--
-- Name: biendonghokhau_biendongid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.biendonghokhau_biendongid_seq OWNED BY public.biendonghokhau.biendongid;


--
-- Name: biendongnhankhau; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biendongnhankhau (
    biendongid integer NOT NULL,
    cccd character varying(12),
    loaibiendong character varying(50),
    ngaybiendong date NOT NULL,
    noiden character varying(200),
    ghichu text,
    nhankhau_id integer,
    CONSTRAINT biendongnhankhau_loaibiendong_check CHECK (((loaibiendong)::text = ANY ((ARRAY['Tạm trú'::character varying, 'Chuyển đi'::character varying, 'Qua đời'::character varying, 'Tạm vắng'::character varying, 'Trở về'::character varying, 'Chuyển đến'::character varying, 'Thay đổi thông tin'::character varying, 'Thêm mới'::character varying])::text[])))
);


ALTER TABLE public.biendongnhankhau OWNER TO postgres;

--
-- Name: biendongnhankhau_biendongid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.biendongnhankhau_biendongid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.biendongnhankhau_biendongid_seq OWNER TO postgres;

--
-- Name: biendongnhankhau_biendongid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.biendongnhankhau_biendongid_seq OWNED BY public.biendongnhankhau.biendongid;


--
-- Name: hokhau; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hokhau (
    sohokhau character varying(20) NOT NULL,
    chuhocccd character varying(12),
    sonha character varying(20),
    duong character varying(100),
    phuong character varying(50),
    quan character varying(50),
    tinh character varying(50),
    ngaylap date NOT NULL,
    ghichu text,
    chuho_id integer
);


ALTER TABLE public.hokhau OWNER TO postgres;

--
-- Name: nhankhau; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nhankhau (
    cccd character varying(12),
    hoten character varying(100) NOT NULL,
    bidanh character varying(100),
    gioitinh character varying(5),
    ngaysinh date,
    noisinh character varying(200),
    nguyenquan character varying(200),
    dantoc character varying(50),
    nghenghiep character varying(100),
    noilamviec character varying(200),
    ngaycapcccd date,
    noicapcccd character varying(200),
    ngaydkthuongtru date,
    diachithuongtrutruoc character varying(200),
    quanhevoichuho character varying(50),
    sohokhau character varying(20),
    trangthai character varying(30) DEFAULT 'Thường trú'::character varying,
    id integer NOT NULL,
    tongiao character varying(50) DEFAULT 'Không'::character varying,
    CONSTRAINT nhankhau_gioitinh_check CHECK (((gioitinh)::text = ANY (ARRAY[('Nam'::character varying)::text, ('Nữ'::character varying)::text]))),
    CONSTRAINT nhankhau_trangthai_check CHECK (((trangthai)::text = ANY ((ARRAY['Thường trú'::character varying, 'Tạm trú'::character varying, 'Tạm vắng'::character varying, 'Chuyển đi'::character varying, 'Qua đời'::character varying, 'Mới sinh'::character varying])::text[])))
);


ALTER TABLE public.nhankhau OWNER TO postgres;

--
-- Name: nhankhau_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nhankhau_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nhankhau_id_seq OWNER TO postgres;

--
-- Name: nhankhau_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nhankhau_id_seq OWNED BY public.nhankhau.id;


--
-- Name: tachho; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tachho (
    tachhoid integer NOT NULL,
    sohokhaucu character varying(20) NOT NULL,
    sohokhaumoi character varying(20) NOT NULL,
    ngaytach date NOT NULL,
    ghichu text
);


ALTER TABLE public.tachho OWNER TO postgres;

--
-- Name: tachho_tachhoid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tachho_tachhoid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tachho_tachhoid_seq OWNER TO postgres;

--
-- Name: tachho_tachhoid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tachho_tachhoid_seq OWNED BY public.tachho.tachhoid;


--
-- Name: tamtru; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tamtru (
    tamtruid integer NOT NULL,
    cccd character varying(12),
    diaphuong character varying(200),
    tungay date NOT NULL,
    denngay date NOT NULL,
    lydo text,
    trangthai character varying(20) DEFAULT 'Còn hạn'::character varying,
    chuhocccd character varying(12),
    chuho character varying(100),
    nhankhau_id integer,
    chuho_id integer,
    CONSTRAINT tamtru_trangthai_check CHECK (((trangthai)::text = ANY ((ARRAY['Chuyển đi'::character varying, 'Còn hạn'::character varying, 'Quá hạn'::character varying])::text[])))
);


ALTER TABLE public.tamtru OWNER TO postgres;

--
-- Name: tamtru_tamtruid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tamtru_tamtruid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tamtru_tamtruid_seq OWNER TO postgres;

--
-- Name: tamtru_tamtruid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tamtru_tamtruid_seq OWNED BY public.tamtru.tamtruid;


--
-- Name: tamvang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tamvang (
    tamvangid integer NOT NULL,
    cccd character varying(12),
    tungay date NOT NULL,
    denngay date NOT NULL,
    lydo text,
    trangthai character varying(20) DEFAULT 'Còn hạn'::character varying,
    nhankhau_id integer,
    sohokhau character varying(20),
    CONSTRAINT tamvang_trangthai_check CHECK (((trangthai)::text = ANY ((ARRAY['Đã về'::character varying, 'Còn hạn'::character varying, 'Quá hạn'::character varying])::text[])))
);


ALTER TABLE public.tamvang OWNER TO postgres;

--
-- Name: tamvang_tamvangid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tamvang_tamvangid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tamvang_tamvangid_seq OWNER TO postgres;

--
-- Name: tamvang_tamvangid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tamvang_tamvangid_seq OWNED BY public.tamvang.tamvangid;


--
-- Name: biendonghokhau biendongid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendonghokhau ALTER COLUMN biendongid SET DEFAULT nextval('public.biendonghokhau_biendongid_seq'::regclass);


--
-- Name: biendongnhankhau biendongid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendongnhankhau ALTER COLUMN biendongid SET DEFAULT nextval('public.biendongnhankhau_biendongid_seq'::regclass);


--
-- Name: nhankhau id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhankhau ALTER COLUMN id SET DEFAULT nextval('public.nhankhau_id_seq'::regclass);


--
-- Name: tachho tachhoid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho ALTER COLUMN tachhoid SET DEFAULT nextval('public.tachho_tachhoid_seq'::regclass);


--
-- Name: tamtru tamtruid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamtru ALTER COLUMN tamtruid SET DEFAULT nextval('public.tamtru_tamtruid_seq'::regclass);


--
-- Name: tamvang tamvangid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamvang ALTER COLUMN tamvangid SET DEFAULT nextval('public.tamvang_tamvangid_seq'::regclass);


--
-- Data for Name: biendonghokhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.biendonghokhau (biendongid, sohokhau, noidungthaydoi, ngaythaydoi) FROM stdin;
1	HK001	Thiết lập hộ khẩu thường trú	2010-05-15
2	HK001	Thêm thành viên mới: Phạm Thị H (ID: 47)	2025-12-25
3	HK013	Đăng ký hộ khẩu mới	2025-12-25
4	HK001	Cập nhật thông tin chung.	2025-12-25
5	HK003	Tách hộ sang HK014	2025-12-25
\.


--
-- Data for Name: biendongnhankhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.biendongnhankhau (biendongid, cccd, loaibiendong, ngaybiendong, noiden, ghichu, nhankhau_id) FROM stdin;
12	\N	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	4
13	001185000002	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	6
14	001185000017	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	7
15	001205000018	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	8
16	\N	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	9
17	001170000003	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	10
18	001200000022	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	12
19	001195000004	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	13
20	001178000050	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	14
21	001188000005	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	15
22	001190000024	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	16
23	\N	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	17
24	001175000006	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	18
25	001168000027	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	19
26	001202000028	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	20
27	001193000033	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	24
28	001195000034	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	25
29	001192000008	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	26
30	001190000035	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	27
31	\N	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	28
32	001180000009	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	29
33	001182000038	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	30
34	001198000010	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	31
35	001194000011	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	32
36	001196000046	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	33
37	001191000012	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	35
38	001161000048	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	36
39	001207000101	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	38
40	001208000102	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	39
41	001209000103	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	40
42	001210000104	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	41
43	001211000105	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	42
44	\N	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	44
45	\N	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	47
46	001192000013	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	2
47	001168000032	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	23
48	001172000021	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	11
49	001190000001	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	1
50	001165000007	Thêm mới	2025-01-01	\N	Đã có mặt từ đầu kỳ thống kê	22
52	\N	Thêm mới	2025-03-15	\N	Khai sinh mới	34
53	\N	Thêm mới	2025-06-20	\N	Mới chuyển đến/Nhập khẩu	3
54	\N	Thêm mới	2025-06-20	\N	Mới chuyển đến/Nhập khẩu	21
55	001160000016	Qua đời	2025-04-10	\N	Hồ sơ tử tuất	5
56	001211000105	Chuyển đi	2025-09-01	\N	Chuyển hộ khẩu sang phường khác	42
\.


--
-- Data for Name: hokhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hokhau (sohokhau, chuhocccd, sonha, duong, phuong, quan, tinh, ngaylap, ghichu, chuho_id) FROM stdin;
HK002	001185000002	12	Nguyễn Trãi	La Khê	Hà Đông	Hà Nội	2012-11-20	Hộ Tổ phó Trần Thị B	6
HK003	001170000003	B202	Lê Lợi	La Khê	Hà Đông	Hà Nội	2015-01-01	Hộ NV QL CSVC 1 Lê Văn C	10
HK004	001195000004	35	Lê Lợi	La Khê	Hà Đông	Hà Nội	2008-08-08	Hộ có NV QL CSVC 2 Phạm Văn Z	13
HK005	001188000005	C15	Quang Trung	La Khê	Hà Đông	Hà Nội	2018-03-10	Vợ chồng trẻ	15
HK006	001175000006	22	Quang Trung	La Khê	Hà Đông	Hà Nội	2020-07-07	Chủ hộ là người lớn tuổi	18
HK007	001165000007	D10	Ngô Thì Nhậm	La Khê	Hà Đông	Hà Nội	2011-04-25	Hộ có người dân tộc thiểu số	22
HK008	001192000008	5A	Ngô Thì Nhậm	La Khê	Hà Đông	Hà Nội	2019-12-12	Hộ có người tạm vắng	26
HK009	001180000009	17	Phùng Hưng	La Khê	Hà Đông	Hà Nội	2014-06-18	\N	29
HK010	001198000010	E3	Phùng Hưng	La Khê	Hà Đông	Hà Nội	2017-09-30	Hộ chủ nhà trọ sinh viên	31
HK011	001194000011	33	Nguyễn Viết Xuân	La Khê	Hà Đông	Hà Nội	2022-02-01	Hộ mới sinh	32
HK012	001191000012	45	Nguyễn Viết Xuân	La Khê	Hà Đông	Hà Nội	2023-10-28	Hộ mới lập do tách từ HK001	35
HK013	001192000013	số 10	La Khê	La Khê	Hà Đông	Hà Nội	2025-12-25		2
HK001	001190000001	10A	Nguyễn Trãi	La Khê	Hà Đông	Hà Nội	2010-05-14	Sửa thử	1
HK014	001172000021	sô 11	Nguyễn Trãi	La Khê	Hà Đông	Hà Nội	2025-12-25	Ra riêng	11
\.


--
-- Data for Name: nhankhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nhankhau (cccd, hoten, bidanh, gioitinh, ngaysinh, noisinh, nguyenquan, dantoc, nghenghiep, noilamviec, ngaycapcccd, noicapcccd, ngaydkthuongtru, diachithuongtrutruoc, quanhevoichuho, sohokhau, trangthai, id, tongiao) FROM stdin;
\N	Nguyễn Văn Con1	\N	Nam	2015-08-10	Hà Nội	Hà Nội	Kinh	Học sinh	Trường La Khê	\N	\N	2015-08-10	\N	Con	HK001	Thường trú	3	Không
\N	Nguyễn Thị Con2	\N	Nữ	2018-12-05	Hà Nội	Hà Nội	Kinh	Học sinh	Trường La Khê	\N	\N	2018-12-05	\N	Con	HK001	Thường trú	4	Không
001160000016	Bà Trần Q	\N	Nữ	1960-01-01	Thanh Hóa	Thanh Hóa	Kinh	Nghỉ hưu	Không	2015-01-01	Thanh Hóa	2010-05-15	\N	Mẹ chồng	HK001	Qua đời	5	Không
001185000002	Trần Thị B	\N	Nữ	1985-05-20	Hải Phòng	Hải Phòng	Kinh	Tổ phó	Nhà Văn Hóa	2019-05-20	Hà Nội	2012-11-20	\N	Chủ hộ	HK002	Thường trú	6	Không
001185000017	Nguyễn Văn R	\N	Nam	1985-05-20	Hải Phòng	Hải Phòng	Kinh	Kỹ sư	Công ty DEF	2019-05-20	Hải Phòng	2012-11-20	\N	Chồng	HK002	Thường trú	7	Không
001205000018	Trần Thị S	\N	Nữ	2005-10-10	Hà Nội	Hà Nội	Kinh	Sinh viên	Đại học A	2022-10-10	Hà Nội	2012-11-20	\N	Con	HK002	Tạm vắng	8	Không
\N	Trần Văn T	\N	Nam	2020-03-03	Hà Nội	Hà Nội	Kinh	Trẻ em	Không	\N	\N	2020-03-03	\N	Con	HK002	Thường trú	9	Không
001170000003	Lê Văn C	\N	Nam	1970-10-10	Nam Định	Nam Định	Kinh	Cán bộ QL CSVC	Nhà Văn Hóa	2016-10-10	Nam Định	2015-01-01	\N	Chủ hộ	HK003	Thường trú	10	Không
001200000022	Lê Văn X	\N	Nam	2000-09-09	Nam Định	Nam Định	Kinh	Sinh viên	Đại học C	2018-09-09	Nam Định	2015-01-01	\N	Con	HK003	Thường trú	12	Không
001195000004	Phạm Thị D	\N	Nữ	1995-12-25	Hà Nội	Hà Nội	Kinh	Kinh doanh	Cửa hàng	2021-12-25	Hà Nội	2008-08-08	\N	Chủ hộ	HK004	Thường trú	13	Không
001178000050	Phạm Văn Z	\N	Nam	1978-02-02	Hà Nội	Hà Nội	Kinh	Cán bộ QL CSVC	Nhà Văn Hóa	2017-02-02	Hà Nội	2008-08-08	\N	Chồng	HK004	Thường trú	14	Không
001188000005	Hoàng Văn E	\N	Nam	1988-03-03	Thái Bình	Thái Bình	Kinh	Lập trình viên	Công ty FPT	2020-03-03	Thái Bình	2018-03-10	\N	Chủ hộ	HK005	Thường trú	15	Không
001190000024	Lê Thị Z	\N	Nữ	1990-04-20	Thái Bình	Thái Bình	Kinh	Nội trợ	Tại nhà	2020-04-20	Thái Bình	2018-03-10	\N	Vợ	HK005	Thường trú	16	Không
\N	Hoàng Văn A1	\N	Nam	2010-11-11	Hà Nội	Hà Nội	Kinh	Học sinh	Trường cấp 2	\N	\N	2018-03-10	\N	Con	HK005	Thường trú	17	Không
001175000006	Vũ Thị F	\N	Nữ	1975-07-17	Hà Nam	Hà Nam	Kinh	Nội trợ	Tại nhà	2019-07-17	Hà Nam	2020-07-07	\N	Chủ hộ	HK006	Thường trú	18	Không
001168000027	Phạm Văn C1	\N	Nam	1968-01-10	Hà Nam	Hà Nam	Kinh	Lái xe	Công ty vận tải	2015-01-10	Hà Nam	2020-07-07	\N	Chồng	HK006	Thường trú	19	Không
001202000028	Vũ Thị D1	\N	Nữ	2002-05-05	Hà Nam	Hà Nam	Kinh	Sinh viên	Đại học D	2020-05-05	Hà Nam	2020-07-07	\N	Con	HK006	Thường trú	20	Không
\N	Vũ Văn E1	\N	Nam	2022-06-06	Hà Nội	Hà Nội	Kinh	Trẻ em	Không	\N	\N	2022-06-06	\N	Cháu	HK006	Thường trú	21	Không
001193000033	Đặng Văn I1	\N	Nam	1993-10-10	Hà Nội	Hà Nội	Thái	Kỹ thuật	KCN	2020-10-10	Hà Nội	2011-04-25	\N	Con	HK007	Thường trú	24	Không
001195000034	Đặng Thị K1	\N	Nữ	1995-11-11	Hà Nội	Hà Nội	Thái	Bán hàng	Siêu thị	2021-11-11	Hà Nội	2011-04-25	\N	Con	HK007	Thường trú	25	Không
001192000008	Bùi Thị H	\N	Nữ	1992-04-04	Hà Nội	Hà Nội	Kinh	Marketing	Công ty R&R	2022-04-04	Hà Nội	2019-12-12	\N	Chủ hộ	HK008	Thường trú	26	Không
001190000035	Trần Văn L1	\N	Nam	1990-12-12	Hà Nội	Hà Nội	Kinh	Lập trình	Công ty R&R	2020-12-12	Hà Nội	2019-12-12	\N	Chồng	HK008	Thường trú	27	Không
\N	Bùi Văn M1	\N	Nam	2019-01-15	Hà Nội	Hà Nội	Kinh	Trẻ em	Không	\N	\N	2019-12-12	\N	Con	HK008	Thường trú	28	Không
001180000009	Ngô Văn I	\N	Nam	1980-06-06	Vĩnh Phúc	Vĩnh Phúc	Kinh	Giám đốc	Công ty X	2018-06-06	Vĩnh Phúc	2014-06-18	\N	Chủ hộ	HK009	Thường trú	29	Không
001182000038	Nguyễn Thị O1	\N	Nữ	1982-03-25	Vĩnh Phúc	Vĩnh Phúc	Kinh	Nội trợ	Tại nhà	2018-03-25	Vĩnh Phúc	2014-06-18	\N	Vợ	HK009	Thường trú	30	Không
001198000010	Dương Thị K	\N	Nữ	1998-08-08	Hà Tĩnh	Hà Tĩnh	Kinh	Chủ nhà trọ	Tại nhà	2023-08-08	Hà Tĩnh	2017-09-30	\N	Chủ hộ	HK010	Thường trú	31	Không
001194000011	Lương Văn L	\N	Nam	1994-09-09	Hòa Bình	Hòa Bình	Mường	Công nhân	Khu công nghiệp	2021-09-09	Hòa Bình	2022-02-01	\N	Chủ hộ	HK011	Thường trú	32	Không
001196000046	Phạm Thị X1	\N	Nữ	1996-11-05	Hòa Bình	Hòa Bình	Mường	Công nhân	Khu công nghiệp	2022-11-05	Hòa Bình	2022-02-01	\N	Vợ	HK011	Thường trú	33	Không
\N	Lương Văn Y1	\N	Nam	2023-01-01	Hà Nội	Hà Nội	Mường	Trẻ em	Không	\N	\N	2023-01-01	\N	Mới sinh	HK011	Mới sinh	34	Không
001191000012	Tô Thị M	\N	Nữ	1991-11-11	Hà Nội	Hà Nội	Kinh	Kế toán	Công ty A	2020-11-11	Hà Nội	2023-10-28	\N	Chủ hộ	HK012	Thường trú	35	Không
001161000048	Bà Trần Z1	\N	Nữ	1961-02-05	Hà Nội	Hà Nội	Kinh	Nghỉ hưu	Không	2016-02-05	Hà Nội	2023-10-28	\N	Mẹ	HK012	Thường trú	36	Không
001207000101	Lê Thị Q1	\N	Nữ	2003-05-05	Nghệ An	Nghệ An	Kinh	Sinh viên	Đại học G	2019-05-05	Nghệ An	\N	\N	\N	\N	Tạm trú	38	Không
001208000102	Trần Văn R1	\N	Nam	1995-06-10	Quảng Bình	Quảng Bình	Kinh	Lao động tự do	KCN	2017-06-10	Quảng Bình	\N	\N	\N	\N	Tạm trú	39	Không
001209000103	Vũ Thị S1	\N	Nữ	2002-07-15	Hà Tĩnh	Hà Tĩnh	Kinh	Sinh viên	Đại học I	2021-07-15	Hà Tĩnh	\N	\N	\N	\N	Tạm trú	40	Không
001210000104	Nguyễn Văn T1	\N	Nam	2000-08-20	Thái Bình	Thái Bình	Kinh	Sinh viên	Đại học K	2018-08-20	Thái Bình	\N	\N	\N	\N	Tạm trú	41	Không
001211000105	Lê Văn U1	\N	Nam	1999-09-25	Phú Thọ	Phú Thọ	Kinh	Lao động	Công ty M	2020-09-25	Phú Thọ	\N	\N	\N	\N	Tạm trú	42	Không
\N	Hoàng Văn T	\N	Nam	2025-12-09	Bệnh viện  phụ sản Hà  Nội	La Khê, Hà Nội	Kinh	\N	\N	\N	\N	2025-12-25	\N	\N	\N	Thường trú	44	Không
\N	Phạm Thị H	\N	Nam	2017-06-25	Bệnh viện đa khoa Thái Bình	Thái Bình	Kinh	\N	\N	\N	\N	2025-12-25	\N	Cháu	HK001	Thường trú	47	Không
001192000013	Lê Thị P	\N	Nữ	1992-03-20	Hà Nội	Hà Nội	Kinh	Kế toán	Công ty ABC	2020-03-20	Hà Nội	2010-05-15	\N	Chủ hộ	HK013	Thường trú	2	Không
001168000032	Lê Thị H1	\N	Nữ	1968-09-09	Thanh Hóa	Thanh Hóa	Thái	Nội trợ	Tại nhà	2017-09-09	Thanh Hóa	2011-04-25	\N	Vợ	HK007	Tạm vắng	23	Không
001206000100	Phạm Văn P1	\N	Nam	2004-04-01	Thanh Hóa	Thanh Hóa	Kinh	Sinh viên	Đại học F	2020-04-01	Thanh Hóa	\N	\N	\N	\N	Chuyển đi	37	Không
001172000021	Phạm Thị V	\N	Nữ	1972-06-06	Nam Định	Nam Định	Kinh	Buôn bán	Chợ Hà Đông	2016-06-06	Nam Định	2015-01-01	\N	Chủ hộ	HK014	Thường trú	11	Không
001190000001	Nguyễn Văn A		Nam	1989-12-31	Hà Nội	Hà Nội	Kinh	Tổ trưởng	Nhà Văn Hóa	2019-12-31	Hà Nội	2010-05-15	\N	Chủ hộ	HK001	Thường trú	1	Phật Giáo
001165000007	Đặng Văn G	\N	Nam	1965-02-02	Thanh Hóa	Thanh Hóa	Thái	Nghỉ hưu	Không	2017-02-02	Thanh Hóa	2011-04-25	\N	Chủ hộ	HK007	Tạm vắng	22	Không
\.


--
-- Data for Name: tachho; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tachho (tachhoid, sohokhaucu, sohokhaumoi, ngaytach, ghichu) FROM stdin;
1	HK003	HK014	2025-12-25	Ra riêng
\.


--
-- Data for Name: tamtru; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tamtru (tamtruid, cccd, diaphuong, tungay, denngay, lydo, trangthai, chuhocccd, chuho, nhankhau_id, chuho_id) FROM stdin;
2	001207000101	E3 Phùng Hưng, La Khê	2024-03-01	2025-07-30	Thuê trọ đi học	Còn hạn	001198000010	Dương Thị K	38	31
3	001208000102	E3 Phùng Hưng, La Khê	2024-03-01	2025-07-30	Thuê trọ đi học	Còn hạn	001198000010	Dương Thị K	39	31
4	001209000103	E3 Phùng Hưng, La Khê	2024-03-01	2025-07-30	Thuê trọ đi học	Còn hạn	001198000010	Dương Thị K	40	31
5	001210000104	10A Nguyễn Trãi, La Khê	2024-11-01	2025-05-30	Thuê trọ đi học	Còn hạn	001190000001	Nguyễn Văn A	41	1
6	001211000105	12 Nguyễn Trãi, La Khê	2024-10-15	2025-10-15	Lao động tự do	Còn hạn	001185000002	Trần Thị B	42	6
1	001206000100	E3 Phùng Hưng, La Khê	2024-03-01	2025-07-30	Thuê trọ đi học	Chuyển đi	001198000010	Dương Thị K	37	31
\.


--
-- Data for Name: tamvang; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tamvang (tamvangid, cccd, tungay, denngay, lydo, trangthai, nhankhau_id, sohokhau) FROM stdin;
2	001205000018	2024-09-01	2025-06-30	Học tập xa nhà	Còn hạn	8	HK002
4	001168000032	2025-01-01	2025-06-30	Thăm con gái	Còn hạn	23	HK007
5	001165000007	2025-12-26	2026-01-10	Đi du lịch	Còn hạn	22	HK007
\.


--
-- Name: biendonghokhau_biendongid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biendonghokhau_biendongid_seq', 5, true);


--
-- Name: biendongnhankhau_biendongid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biendongnhankhau_biendongid_seq', 56, true);


--
-- Name: nhankhau_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nhankhau_id_seq', 48, true);


--
-- Name: tachho_tachhoid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tachho_tachhoid_seq', 1, true);


--
-- Name: tamtru_tamtruid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tamtru_tamtruid_seq', 7, true);


--
-- Name: tamvang_tamvangid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tamvang_tamvangid_seq', 5, true);


--
-- Name: biendonghokhau biendonghokhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendonghokhau
    ADD CONSTRAINT biendonghokhau_pkey PRIMARY KEY (biendongid);


--
-- Name: biendongnhankhau biendongnhankhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendongnhankhau
    ADD CONSTRAINT biendongnhankhau_pkey PRIMARY KEY (biendongid);


--
-- Name: hokhau hokhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hokhau
    ADD CONSTRAINT hokhau_pkey PRIMARY KEY (sohokhau);


--
-- Name: nhankhau nhankhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhankhau
    ADD CONSTRAINT nhankhau_pkey PRIMARY KEY (id);


--
-- Name: tachho tachho_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho
    ADD CONSTRAINT tachho_pkey PRIMARY KEY (tachhoid);


--
-- Name: tamtru tamtru_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamtru
    ADD CONSTRAINT tamtru_pkey PRIMARY KEY (tamtruid);


--
-- Name: tamvang tamvang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamvang
    ADD CONSTRAINT tamvang_pkey PRIMARY KEY (tamvangid);


--
-- Name: nhankhau unique_cccd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhankhau
    ADD CONSTRAINT unique_cccd UNIQUE (cccd);


--
-- Name: biendonghokhau fk_biendong_hokhau; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendonghokhau
    ADD CONSTRAINT fk_biendong_hokhau FOREIGN KEY (sohokhau) REFERENCES public.hokhau(sohokhau) ON DELETE CASCADE;


--
-- Name: biendongnhankhau fk_biendong_nhankhau_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendongnhankhau
    ADD CONSTRAINT fk_biendong_nhankhau_id FOREIGN KEY (nhankhau_id) REFERENCES public.nhankhau(id) ON DELETE CASCADE;


--
-- Name: hokhau fk_chuho_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hokhau
    ADD CONSTRAINT fk_chuho_id FOREIGN KEY (chuho_id) REFERENCES public.nhankhau(id);


--
-- Name: nhankhau fk_nhankhau_hokhau; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhankhau
    ADD CONSTRAINT fk_nhankhau_hokhau FOREIGN KEY (sohokhau) REFERENCES public.hokhau(sohokhau) ON DELETE SET NULL;


--
-- Name: tamtru fk_tamtru_chuho_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamtru
    ADD CONSTRAINT fk_tamtru_chuho_id FOREIGN KEY (chuho_id) REFERENCES public.nhankhau(id);


--
-- Name: tamtru fk_tamtru_nhankhau_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamtru
    ADD CONSTRAINT fk_tamtru_nhankhau_id FOREIGN KEY (nhankhau_id) REFERENCES public.nhankhau(id);


--
-- Name: tamvang fk_tamvang_nhankhau_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamvang
    ADD CONSTRAINT fk_tamvang_nhankhau_id FOREIGN KEY (nhankhau_id) REFERENCES public.nhankhau(id);


--
-- Name: tachho tachho_sohokhaucu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho
    ADD CONSTRAINT tachho_sohokhaucu_fkey FOREIGN KEY (sohokhaucu) REFERENCES public.hokhau(sohokhau);


--
-- Name: tachho tachho_sohokhaumoi_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho
    ADD CONSTRAINT tachho_sohokhaumoi_fkey FOREIGN KEY (sohokhaumoi) REFERENCES public.hokhau(sohokhau);


--
-- PostgreSQL database dump complete
--

