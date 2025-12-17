--
-- PostgreSQL database dump
--

--\restrict eGuQTDxF3DQbKn1MNU7QlK1CQXFKdjaJQueKTeczen77M87ZWvVfPqccPodx4Ag

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

-- Started on 2025-12-16 13:09:50

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
-- TOC entry 4907 (class 1262 OID 33184)
-- Name: Quan_li_ho_khau; Type: DATABASE; Schema: -; Owner: postgres
--

--CREATE DATABASE "Quan_li_ho_khau" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Vietnamese_Vietnam.932';


--ALTER DATABASE "Quan_li_ho_khau" OWNER TO postgres;

--\unrestrict eGuQTDxF3DQbKn1MNU7QlK1CQXFKdjaJQueKTeczen77M87ZWvVfPqccPodx4Ag
--\connect "Quan_li_ho_khau"
--\restrict eGuQTDxF3DQbKn1MNU7QlK1CQXFKdjaJQueKTeczen77M87ZWvVfPqccPodx4Ag

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 33223)
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
-- TOC entry 219 (class 1259 OID 33222)
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
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 219
-- Name: biendonghokhau_biendongid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.biendonghokhau_biendongid_seq OWNED BY public.biendonghokhau.biendongid;


--
-- TOC entry 218 (class 1259 OID 33208)
-- Name: biendongnhankhau; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biendongnhankhau (
    biendongid integer NOT NULL,
    cccd character varying(12) NOT NULL,
    loaibiendong character varying(50),
    ngaybiendong date NOT NULL,
    noiden character varying(200),
    ghichu text,
    CONSTRAINT biendongnhankhau_loaibiendong_check CHECK (((loaibiendong)::text = ANY ((ARRAY['Thêm mới'::character varying, 'Chuyển đi'::character varying, 'Qua đời'::character varying, 'Thay đổi thông tin'::character varying])::text[])))
);


ALTER TABLE public.biendongnhankhau OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 33207)
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
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 217
-- Name: biendongnhankhau_biendongid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.biendongnhankhau_biendongid_seq OWNED BY public.biendongnhankhau.biendongid;


--
-- TOC entry 215 (class 1259 OID 33185)
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
    ghichu text
);


ALTER TABLE public.hokhau OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 33192)
-- Name: nhankhau; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nhankhau (
    cccd character varying(12) NOT NULL,
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
    CONSTRAINT nhankhau_gioitinh_check CHECK (((gioitinh)::text = ANY ((ARRAY['Nam'::character varying, 'Nữ'::character varying])::text[]))),
    CONSTRAINT nhankhau_trangthai_check CHECK (((trangthai)::text = ANY ((ARRAY['Thường trú'::character varying, 'Tạm vắng'::character varying, 'Chuyển đi'::character varying, 'Qua đời'::character varying, 'Mới sinh'::character varying])::text[])))
);


ALTER TABLE public.nhankhau OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33237)
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
-- TOC entry 221 (class 1259 OID 33236)
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
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 221
-- Name: tachho_tachhoid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tachho_tachhoid_seq OWNED BY public.tachho.tachhoid;


--
-- TOC entry 226 (class 1259 OID 33270)
-- Name: tamtru; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tamtru (
    tamtruid integer NOT NULL,
    cccd character varying(12) NOT NULL,
    diaphuong character varying(200),
    tungay date NOT NULL,
    denngay date NOT NULL,
    lydo text
);


ALTER TABLE public.tamtru OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 33269)
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
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 225
-- Name: tamtru_tamtruid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tamtru_tamtruid_seq OWNED BY public.tamtru.tamtruid;


--
-- TOC entry 224 (class 1259 OID 33256)
-- Name: tamvang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tamvang (
    tamvangid integer NOT NULL,
    cccd character varying(12) NOT NULL,
    tungay date NOT NULL,
    denngay date NOT NULL,
    lydo text
);


ALTER TABLE public.tamvang OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 33255)
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
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 223
-- Name: tamvang_tamvangid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tamvang_tamvangid_seq OWNED BY public.tamvang.tamvangid;


--
-- TOC entry 4718 (class 2604 OID 33226)
-- Name: biendonghokhau biendongid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendonghokhau ALTER COLUMN biendongid SET DEFAULT nextval('public.biendonghokhau_biendongid_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 33211)
-- Name: biendongnhankhau biendongid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendongnhankhau ALTER COLUMN biendongid SET DEFAULT nextval('public.biendongnhankhau_biendongid_seq'::regclass);


--
-- TOC entry 4719 (class 2604 OID 33240)
-- Name: tachho tachhoid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho ALTER COLUMN tachhoid SET DEFAULT nextval('public.tachho_tachhoid_seq'::regclass);


--
-- TOC entry 4721 (class 2604 OID 33273)
-- Name: tamtru tamtruid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamtru ALTER COLUMN tamtruid SET DEFAULT nextval('public.tamtru_tamtruid_seq'::regclass);


--
-- TOC entry 4720 (class 2604 OID 33259)
-- Name: tamvang tamvangid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamvang ALTER COLUMN tamvangid SET DEFAULT nextval('public.tamvang_tamvangid_seq'::regclass);


--
-- TOC entry 4895 (class 0 OID 33223)
-- Dependencies: 220
-- Data for Name: biendonghokhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.biendonghokhau VALUES (1, 'HK001', 'Tách hộ: Chuyển Tô Thị M sang HK012', '2023-10-28');


--
-- TOC entry 4893 (class 0 OID 33208)
-- Dependencies: 218
-- Data for Name: biendongnhankhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.biendongnhankhau VALUES (1, '001160000016', 'Qua đời', '2024-10-20', NULL, 'Bà Trần Q qua đời do tuổi cao.');
INSERT INTO public.biendongnhankhau VALUES (2, '001205000018', 'Thay đổi thông tin', '2024-12-01', 'Nghệ An', 'Thay đổi trạng thái từ Thường trú sang Tạm vắng.');


--
-- TOC entry 4890 (class 0 OID 33185)
-- Dependencies: 215
-- Data for Name: hokhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.hokhau VALUES ('HK001', '001190000001', '10A', 'Nguyễn Trãi', 'La Khê', 'Hà Đông', 'Hà Nội', '2010-05-15', 'Hộ Tổ trưởng Nguyễn Văn A');
INSERT INTO public.hokhau VALUES ('HK002', '001185000002', '12', 'Nguyễn Trãi', 'La Khê', 'Hà Đông', 'Hà Nội', '2012-11-20', 'Hộ Tổ phó Trần Thị B');
INSERT INTO public.hokhau VALUES ('HK003', '001170000003', 'B202', 'Lê Lợi', 'La Khê', 'Hà Đông', 'Hà Nội', '2015-01-01', 'Hộ NV QL CSVC 1 Lê Văn C');
INSERT INTO public.hokhau VALUES ('HK004', '001195000004', '35', 'Lê Lợi', 'La Khê', 'Hà Đông', 'Hà Nội', '2008-08-08', 'Hộ có NV QL CSVC 2 Phạm Văn Z');
INSERT INTO public.hokhau VALUES ('HK005', '001188000005', 'C15', 'Quang Trung', 'La Khê', 'Hà Đông', 'Hà Nội', '2018-03-10', 'Vợ chồng trẻ');
INSERT INTO public.hokhau VALUES ('HK006', '001175000006', '22', 'Quang Trung', 'La Khê', 'Hà Đông', 'Hà Nội', '2020-07-07', 'Chủ hộ là người lớn tuổi');
INSERT INTO public.hokhau VALUES ('HK007', '001165000007', 'D10', 'Ngô Thì Nhậm', 'La Khê', 'Hà Đông', 'Hà Nội', '2011-04-25', 'Hộ có người dân tộc thiểu số');
INSERT INTO public.hokhau VALUES ('HK008', '001192000008', '5A', 'Ngô Thì Nhậm', 'La Khê', 'Hà Đông', 'Hà Nội', '2019-12-12', 'Hộ có người tạm vắng');
INSERT INTO public.hokhau VALUES ('HK009', '001180000009', '17', 'Phùng Hưng', 'La Khê', 'Hà Đông', 'Hà Nội', '2014-06-18', NULL);
INSERT INTO public.hokhau VALUES ('HK010', '001198000010', 'E3', 'Phùng Hưng', 'La Khê', 'Hà Đông', 'Hà Nội', '2017-09-30', 'Hộ chủ nhà trọ sinh viên');
INSERT INTO public.hokhau VALUES ('HK011', '001194000011', '33', 'Nguyễn Viết Xuân', 'La Khê', 'Hà Đông', 'Hà Nội', '2022-02-01', 'Hộ mới sinh');
INSERT INTO public.hokhau VALUES ('HK012', '001191000012', '45', 'Nguyễn Viết Xuân', 'La Khê', 'Hà Đông', 'Hà Nội', '2023-10-28', 'Hộ mới lập do tách từ HK001');


--
-- TOC entry 4891 (class 0 OID 33192)
-- Dependencies: 216
-- Data for Name: nhankhau; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nhankhau VALUES ('001190000001', 'Nguyễn Văn A', NULL, 'Nam', '1990-01-01', 'Hà Nội', 'Hà Nội', 'Kinh', 'Tổ trưởng', 'Nhà Văn Hóa', '2020-01-01', 'Hà Nội', '2010-05-15', NULL, 'Chủ hộ', 'HK001', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001185000002', 'Trần Thị B', NULL, 'Nữ', '1985-05-20', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Tổ phó', 'Nhà Văn Hóa', '2019-05-20', 'Hà Nội', '2012-11-20', NULL, 'Chủ hộ', 'HK002', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001170000003', 'Lê Văn C', NULL, 'Nam', '1970-10-10', 'Nam Định', 'Nam Định', 'Kinh', 'Cán bộ QL CSVC', 'Nhà Văn Hóa', '2016-10-10', 'Nam Định', '2015-01-01', NULL, 'Chủ hộ', 'HK003', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001178000050', 'Phạm Văn Z', NULL, 'Nam', '1978-02-02', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cán bộ QL CSVC', 'Nhà Văn Hóa', '2017-02-02', 'Hà Nội', '2008-08-08', NULL, 'Chồng', 'HK004', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001195000004', 'Phạm Thị D', NULL, 'Nữ', '1995-12-25', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh', 'Cửa hàng', '2021-12-25', 'Hà Nội', '2008-08-08', NULL, 'Chủ hộ', 'HK004', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001188000005', 'Hoàng Văn E', NULL, 'Nam', '1988-03-03', 'Thái Bình', 'Thái Bình', 'Kinh', 'Lập trình viên', 'Công ty FPT', '2020-03-03', 'Thái Bình', '2018-03-10', NULL, 'Chủ hộ', 'HK005', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001175000006', 'Vũ Thị F', NULL, 'Nữ', '1975-07-17', 'Hà Nam', 'Hà Nam', 'Kinh', 'Nội trợ', 'Tại nhà', '2019-07-17', 'Hà Nam', '2020-07-07', NULL, 'Chủ hộ', 'HK006', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001165000007', 'Đặng Văn G', NULL, 'Nam', '1965-02-02', 'Thanh Hóa', 'Thanh Hóa', 'Thái', 'Nghỉ hưu', 'Không', '2017-02-02', 'Thanh Hóa', '2011-04-25', NULL, 'Chủ hộ', 'HK007', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001192000008', 'Bùi Thị H', NULL, 'Nữ', '1992-04-04', 'Hà Nội', 'Hà Nội', 'Kinh', 'Marketing', 'Công ty R&R', '2022-04-04', 'Hà Nội', '2019-12-12', NULL, 'Chủ hộ', 'HK008', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001180000009', 'Ngô Văn I', NULL, 'Nam', '1980-06-06', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Giám đốc', 'Công ty X', '2018-06-06', 'Vĩnh Phúc', '2014-06-18', NULL, 'Chủ hộ', 'HK009', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001198000010', 'Dương Thị K', NULL, 'Nữ', '1998-08-08', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Chủ nhà trọ', 'Tại nhà', '2023-08-08', 'Hà Tĩnh', '2017-09-30', NULL, 'Chủ hộ', 'HK010', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001194000011', 'Lương Văn L', NULL, 'Nam', '1994-09-09', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Công nhân', 'Khu công nghiệp', '2021-09-09', 'Hòa Bình', '2022-02-01', NULL, 'Chủ hộ', 'HK011', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001191000012', 'Tô Thị M', NULL, 'Nữ', '1991-11-11', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kế toán', 'Công ty A', '2020-11-11', 'Hà Nội', '2023-10-28', NULL, 'Chủ hộ', 'HK012', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001192000013', 'Lê Thị P', NULL, 'Nữ', '1992-03-20', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kế toán', 'Công ty ABC', '2020-03-20', 'Hà Nội', '2010-05-15', NULL, 'Vợ', 'HK001', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001215000014', 'Nguyễn Văn Con1', NULL, 'Nam', '2015-08-10', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường La Khê', NULL, NULL, '2015-08-10', NULL, 'Con', 'HK001', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001218000015', 'Nguyễn Thị Con2', NULL, 'Nữ', '2018-12-05', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường La Khê', NULL, NULL, '2018-12-05', NULL, 'Con', 'HK001', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001160000016', 'Bà Trần Q', NULL, 'Nữ', '1960-01-01', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nghỉ hưu', 'Không', '2015-01-01', 'Thanh Hóa', '2010-05-15', NULL, 'Mẹ chồng', 'HK001', 'Qua đời');
INSERT INTO public.nhankhau VALUES ('001185000017', 'Nguyễn Văn R', NULL, 'Nam', '1985-05-20', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Kỹ sư', 'Công ty DEF', '2019-05-20', 'Hải Phòng', '2012-11-20', NULL, 'Chồng', 'HK002', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001205000018', 'Trần Thị S', NULL, 'Nữ', '2005-10-10', 'Hà Nội', 'Hà Nội', 'Kinh', 'Sinh viên', 'Đại học A', '2022-10-10', 'Hà Nội', '2012-11-20', NULL, 'Con', 'HK002', 'Tạm vắng');
INSERT INTO public.nhankhau VALUES ('001220000019', 'Trần Văn T', NULL, 'Nam', '2020-03-03', 'Hà Nội', 'Hà Nội', 'Kinh', 'Trẻ em', 'Không', NULL, NULL, '2020-03-03', NULL, 'Con', 'HK002', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001172000021', 'Phạm Thị V', NULL, 'Nữ', '1972-06-06', 'Nam Định', 'Nam Định', 'Kinh', 'Buôn bán', 'Chợ Hà Đông', '2016-06-06', 'Nam Định', '2015-01-01', NULL, 'Vợ', 'HK003', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001200000022', 'Lê Văn X', NULL, 'Nam', '2000-09-09', 'Nam Định', 'Nam Định', 'Kinh', 'Sinh viên', 'Đại học C', '2018-09-09', 'Nam Định', '2015-01-01', NULL, 'Con', 'HK003', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001190000024', 'Lê Thị Z', NULL, 'Nữ', '1990-04-20', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nội trợ', 'Tại nhà', '2020-04-20', 'Thái Bình', '2018-03-10', NULL, 'Vợ', 'HK005', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001210000025', 'Hoàng Văn A1', NULL, 'Nam', '2010-11-11', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường cấp 2', NULL, NULL, '2018-03-10', NULL, 'Con', 'HK005', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001168000027', 'Phạm Văn C1', NULL, 'Nam', '1968-01-10', 'Hà Nam', 'Hà Nam', 'Kinh', 'Lái xe', 'Công ty vận tải', '2015-01-10', 'Hà Nam', '2020-07-07', NULL, 'Chồng', 'HK006', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001202000028', 'Vũ Thị D1', NULL, 'Nữ', '2002-05-05', 'Hà Nam', 'Hà Nam', 'Kinh', 'Sinh viên', 'Đại học D', '2020-05-05', 'Hà Nam', '2020-07-07', NULL, 'Con', 'HK006', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001222000029', 'Vũ Văn E1', NULL, 'Nam', '2022-06-06', 'Hà Nội', 'Hà Nội', 'Kinh', 'Trẻ em', 'Không', NULL, NULL, '2022-06-06', NULL, 'Cháu', 'HK006', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001168000032', 'Lê Thị H1', NULL, 'Nữ', '1968-09-09', 'Thanh Hóa', 'Thanh Hóa', 'Thái', 'Nội trợ', 'Tại nhà', '2017-09-09', 'Thanh Hóa', '2011-04-25', NULL, 'Vợ', 'HK007', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001193000033', 'Đặng Văn I1', NULL, 'Nam', '1993-10-10', 'Hà Nội', 'Hà Nội', 'Thái', 'Kỹ thuật', 'KCN', '2020-10-10', 'Hà Nội', '2011-04-25', NULL, 'Con', 'HK007', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001195000034', 'Đặng Thị K1', NULL, 'Nữ', '1995-11-11', 'Hà Nội', 'Hà Nội', 'Thái', 'Bán hàng', 'Siêu thị', '2021-11-11', 'Hà Nội', '2011-04-25', NULL, 'Con', 'HK007', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001190000035', 'Trần Văn L1', NULL, 'Nam', '1990-12-12', 'Hà Nội', 'Hà Nội', 'Kinh', 'Lập trình', 'Công ty R&R', '2020-12-12', 'Hà Nội', '2019-12-12', NULL, 'Chồng', 'HK008', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001219000036', 'Bùi Văn M1', NULL, 'Nam', '2019-01-15', 'Hà Nội', 'Hà Nội', 'Kinh', 'Trẻ em', 'Không', NULL, NULL, '2019-12-12', NULL, 'Con', 'HK008', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001182000038', 'Nguyễn Thị O1', NULL, 'Nữ', '1982-03-25', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Nội trợ', 'Tại nhà', '2018-03-25', 'Vĩnh Phúc', '2014-06-18', NULL, 'Vợ', 'HK009', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001196000046', 'Phạm Thị X1', NULL, 'Nữ', '1996-11-05', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Công nhân', 'Khu công nghiệp', '2022-11-05', 'Hòa Bình', '2022-02-01', NULL, 'Vợ', 'HK011', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001223000047', 'Lương Văn Y1', NULL, 'Nam', '2023-01-01', 'Hà Nội', 'Hà Nội', 'Mường', 'Trẻ em', 'Không', NULL, NULL, '2023-01-01', NULL, 'Mới sinh', 'HK011', 'Mới sinh');
INSERT INTO public.nhankhau VALUES ('001161000048', 'Bà Trần Z1', NULL, 'Nữ', '1961-02-05', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nghỉ hưu', 'Không', '2016-02-05', 'Hà Nội', '2023-10-28', NULL, 'Mẹ', 'HK012', 'Thường trú');
INSERT INTO public.nhankhau VALUES ('001206000100', 'Phạm Văn P1', NULL, 'Nam', '2004-04-01', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Sinh viên', 'Đại học F', '2020-04-01', 'Thanh Hóa', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.nhankhau VALUES ('001207000101', 'Lê Thị Q1', NULL, 'Nữ', '2003-05-05', 'Nghệ An', 'Nghệ An', 'Kinh', 'Sinh viên', 'Đại học G', '2019-05-05', 'Nghệ An', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.nhankhau VALUES ('001208000102', 'Trần Văn R1', NULL, 'Nam', '1995-06-10', 'Quảng Bình', 'Quảng Bình', 'Kinh', 'Lao động tự do', 'KCN', '2017-06-10', 'Quảng Bình', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.nhankhau VALUES ('001209000103', 'Vũ Thị S1', NULL, 'Nữ', '2002-07-15', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Sinh viên', 'Đại học I', '2021-07-15', 'Hà Tĩnh', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.nhankhau VALUES ('001210000104', 'Nguyễn Văn T1', NULL, 'Nam', '2000-08-20', 'Thái Bình', 'Thái Bình', 'Kinh', 'Sinh viên', 'Đại học K', '2018-08-20', 'Thái Bình', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.nhankhau VALUES ('001211000105', 'Lê Văn U1', NULL, 'Nam', '1999-09-25', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Lao động', 'Công ty M', '2020-09-25', 'Phú Thọ', NULL, NULL, NULL, NULL, NULL);


--
-- TOC entry 4897 (class 0 OID 33237)
-- Dependencies: 222
-- Data for Name: tachho; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tachho VALUES (1, 'HK001', 'HK012', '2023-10-28', 'Tách hộ do con gái Tô Thị M đi lấy chồng');


--
-- TOC entry 4901 (class 0 OID 33270)
-- Dependencies: 226
-- Data for Name: tamtru; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tamtru VALUES (1, '001206000100', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông (Tại HK010)', '2024-03-01', '2025-07-30', 'Thuê trọ để đi học');
INSERT INTO public.tamtru VALUES (2, '001207000101', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông (Tại HK010)', '2024-03-01', '2025-07-30', 'Thuê trọ để đi học');
INSERT INTO public.tamtru VALUES (3, '001208000102', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông (Tại HK010)', '2024-03-01', '2025-07-30', 'Thuê trọ để làm việc');
INSERT INTO public.tamtru VALUES (4, '001209000103', 'E3 Phùng Hưng, P. La Khê, Q. Hà Đông (Tại HK010)', '2024-03-01', '2025-07-30', 'Thuê trọ để đi học');
INSERT INTO public.tamtru VALUES (5, '001210000104', '10A Nguyễn Trãi, P. La Khê, Q. Hà Đông (Tại HK001)', '2024-11-01', '2025-05-30', 'Thuê trọ để đi học');
INSERT INTO public.tamtru VALUES (6, '001211000105', '12 Nguyễn Trãi, P. La Khê, Q. Hà Đông (Tại HK002)', '2024-10-15', '2025-10-15', 'Thuê trọ để làm việc');


--
-- TOC entry 4899 (class 0 OID 33256)
-- Dependencies: 224
-- Data for Name: tamvang; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tamvang VALUES (1, '001205000018', '2024-12-01', '2025-06-30', 'Về quê nghỉ Tết và ôn thi');


--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 219
-- Name: biendonghokhau_biendongid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biendonghokhau_biendongid_seq', 1, true);


--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 217
-- Name: biendongnhankhau_biendongid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biendongnhankhau_biendongid_seq', 2, true);


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 221
-- Name: tachho_tachhoid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tachho_tachhoid_seq', 1, true);


--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 225
-- Name: tamtru_tamtruid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tamtru_tamtruid_seq', 6, true);


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 223
-- Name: tamvang_tamvangid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tamvang_tamvangid_seq', 1, true);


--
-- TOC entry 4732 (class 2606 OID 33230)
-- Name: biendonghokhau biendonghokhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendonghokhau
    ADD CONSTRAINT biendonghokhau_pkey PRIMARY KEY (biendongid);


--
-- TOC entry 4730 (class 2606 OID 33216)
-- Name: biendongnhankhau biendongnhankhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendongnhankhau
    ADD CONSTRAINT biendongnhankhau_pkey PRIMARY KEY (biendongid);


--
-- TOC entry 4726 (class 2606 OID 33191)
-- Name: hokhau hokhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hokhau
    ADD CONSTRAINT hokhau_pkey PRIMARY KEY (sohokhau);


--
-- TOC entry 4728 (class 2606 OID 33201)
-- Name: nhankhau nhankhau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhankhau
    ADD CONSTRAINT nhankhau_pkey PRIMARY KEY (cccd);


--
-- TOC entry 4734 (class 2606 OID 33244)
-- Name: tachho tachho_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho
    ADD CONSTRAINT tachho_pkey PRIMARY KEY (tachhoid);


--
-- TOC entry 4738 (class 2606 OID 33277)
-- Name: tamtru tamtru_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamtru
    ADD CONSTRAINT tamtru_pkey PRIMARY KEY (tamtruid);


--
-- TOC entry 4736 (class 2606 OID 33263)
-- Name: tamvang tamvang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamvang
    ADD CONSTRAINT tamvang_pkey PRIMARY KEY (tamvangid);


--
-- TOC entry 4742 (class 2606 OID 33231)
-- Name: biendonghokhau fk_biendong_hokhau; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendonghokhau
    ADD CONSTRAINT fk_biendong_hokhau FOREIGN KEY (sohokhau) REFERENCES public.hokhau(sohokhau) ON DELETE CASCADE;


--
-- TOC entry 4741 (class 2606 OID 33217)
-- Name: biendongnhankhau fk_biendong_nhankhau; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biendongnhankhau
    ADD CONSTRAINT fk_biendong_nhankhau FOREIGN KEY (cccd) REFERENCES public.nhankhau(cccd) ON DELETE CASCADE;


--
-- TOC entry 4739 (class 2606 OID 33413)
-- Name: hokhau fk_chuho_cccd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hokhau
    ADD CONSTRAINT fk_chuho_cccd FOREIGN KEY (chuhocccd) REFERENCES public.nhankhau(cccd);


--
-- TOC entry 4740 (class 2606 OID 33202)
-- Name: nhankhau fk_nhankhau_hokhau; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nhankhau
    ADD CONSTRAINT fk_nhankhau_hokhau FOREIGN KEY (sohokhau) REFERENCES public.hokhau(sohokhau) ON DELETE SET NULL;


--
-- TOC entry 4743 (class 2606 OID 33245)
-- Name: tachho tachho_sohokhaucu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho
    ADD CONSTRAINT tachho_sohokhaucu_fkey FOREIGN KEY (sohokhaucu) REFERENCES public.hokhau(sohokhau);


--
-- TOC entry 4744 (class 2606 OID 33250)
-- Name: tachho tachho_sohokhaumoi_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tachho
    ADD CONSTRAINT tachho_sohokhaumoi_fkey FOREIGN KEY (sohokhaumoi) REFERENCES public.hokhau(sohokhau);


--
-- TOC entry 4746 (class 2606 OID 33278)
-- Name: tamtru tamtru_cccd_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamtru
    ADD CONSTRAINT tamtru_cccd_fkey FOREIGN KEY (cccd) REFERENCES public.nhankhau(cccd);


--
-- TOC entry 4745 (class 2606 OID 33264)
-- Name: tamvang tamvang_cccd_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tamvang
    ADD CONSTRAINT tamvang_cccd_fkey FOREIGN KEY (cccd) REFERENCES public.nhankhau(cccd);


-- Completed on 2025-12-16 13:09:50

--
-- PostgreSQL database dump complete
--

--\unrestrict eGuQTDxF3DQbKn1MNU7QlK1CQXFKdjaJQueKTeczen77M87ZWvVfPqccPodx4Ag

