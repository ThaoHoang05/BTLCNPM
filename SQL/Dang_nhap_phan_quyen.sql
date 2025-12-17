--
-- PostgreSQL database dump
--

\restrict TuBdzmIdTJCIovoH3GARDRBEc1dyeFZhElK1dCaBtkrVnJHYoW6DJt6xanqOzjw

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

-- Started on 2025-12-17 20:30:27

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
-- TOC entry 4858 (class 1262 OID 33477)
-- Name: Dang_nhap_phan_quyen; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "Dang_nhap_phan_quyen" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Vietnamese_Vietnam.932';


ALTER DATABASE "Dang_nhap_phan_quyen" OWNER TO postgres;

\unrestrict TuBdzmIdTJCIovoH3GARDRBEc1dyeFZhElK1dCaBtkrVnJHYoW6DJt6xanqOzjw
\connect "Dang_nhap_phan_quyen"
\restrict TuBdzmIdTJCIovoH3GARDRBEc1dyeFZhElK1dCaBtkrVnJHYoW6DJt6xanqOzjw

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
-- TOC entry 218 (class 1259 OID 33491)
-- Name: nguoidung; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nguoidung (
    nguoidungid integer NOT NULL,
    tendangnhap character varying(50) NOT NULL,
    matkhauhash text NOT NULL,
    trangthai character varying(20) DEFAULT 'HoatDong'::character varying,
    vaitroid integer NOT NULL,
    canboid integer,
    cccd character varying(12),
    CONSTRAINT nguoidung_check CHECK ((((canboid IS NOT NULL) AND (cccd IS NULL)) OR ((canboid IS NULL) AND (cccd IS NOT NULL))))
);


ALTER TABLE public.nguoidung OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 33490)
-- Name: nguoidung_nguoidungid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nguoidung_nguoidungid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nguoidung_nguoidungid_seq OWNER TO postgres;

--
-- TOC entry 4859 (class 0 OID 0)
-- Dependencies: 217
-- Name: nguoidung_nguoidungid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nguoidung_nguoidungid_seq OWNED BY public.nguoidung.nguoidungid;


--
-- TOC entry 216 (class 1259 OID 33479)
-- Name: vaitro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vaitro (
    vaitroid integer NOT NULL,
    tenvaitro character varying(30) NOT NULL
);


ALTER TABLE public.vaitro OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 33478)
-- Name: vaitro_vaitroid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vaitro_vaitroid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vaitro_vaitroid_seq OWNER TO postgres;

--
-- TOC entry 4860 (class 0 OID 0)
-- Dependencies: 215
-- Name: vaitro_vaitroid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vaitro_vaitroid_seq OWNED BY public.vaitro.vaitroid;


--
-- TOC entry 4694 (class 2604 OID 33494)
-- Name: nguoidung nguoidungid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung ALTER COLUMN nguoidungid SET DEFAULT nextval('public.nguoidung_nguoidungid_seq'::regclass);


--
-- TOC entry 4693 (class 2604 OID 33482)
-- Name: vaitro vaitroid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaitro ALTER COLUMN vaitroid SET DEFAULT nextval('public.vaitro_vaitroid_seq'::regclass);


--
-- TOC entry 4852 (class 0 OID 33491)
-- Dependencies: 218
-- Data for Name: nguoidung; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nguoidung VALUES (1, 'admin_vana', 'pass_123', 'HoatDong', 1, 1, NULL);
INSERT INTO public.nguoidung VALUES (2, 'admin_thib', 'pass_123', 'HoatDong', 2, 2, NULL);
INSERT INTO public.nguoidung VALUES (3, 'canbo_vanc', 'pass_123', 'HoatDong', 3, 3, NULL);
INSERT INTO public.nguoidung VALUES (4, 'canbo_vanz', 'pass_123', 'HoatDong', 3, 4, NULL);
INSERT INTO public.nguoidung VALUES (5, '001192000013', 'user_123', 'HoatDong', 4, NULL, '001192000013');
INSERT INTO public.nguoidung VALUES (6, '001185000017', 'user_123', 'HoatDong', 4, NULL, '001185000017');
INSERT INTO public.nguoidung VALUES (7, '001172000021', 'user_123', 'HoatDong', 4, NULL, '001172000021');
INSERT INTO public.nguoidung VALUES (8, '001200000022', 'user_123', 'HoatDong', 4, NULL, '001200000022');
INSERT INTO public.nguoidung VALUES (9, '001195000004', 'user_123', 'HoatDong', 4, NULL, '001195000004');
INSERT INTO public.nguoidung VALUES (10, '001188000005', 'user_123', 'HoatDong', 4, NULL, '001188000005');
INSERT INTO public.nguoidung VALUES (11, '001190000024', 'user_123', 'HoatDong', 4, NULL, '001190000024');
INSERT INTO public.nguoidung VALUES (12, '001175000006', 'user_123', 'HoatDong', 4, NULL, '001175000006');
INSERT INTO public.nguoidung VALUES (13, '001168000027', 'user_123', 'HoatDong', 4, NULL, '001168000027');
INSERT INTO public.nguoidung VALUES (14, '001165000007', 'user_123', 'HoatDong', 4, NULL, '001165000007');
INSERT INTO public.nguoidung VALUES (15, '001193000033', 'user_123', 'HoatDong', 4, NULL, '001193000033');
INSERT INTO public.nguoidung VALUES (16, '001192000008', 'user_123', 'HoatDong', 4, NULL, '001192000008');
INSERT INTO public.nguoidung VALUES (17, '001190000035', 'user_123', 'HoatDong', 4, NULL, '001190000035');
INSERT INTO public.nguoidung VALUES (18, '001180000009', 'user_123', 'HoatDong', 4, NULL, '001180000009');
INSERT INTO public.nguoidung VALUES (19, '001198000010', 'user_123', 'HoatDong', 4, NULL, '001198000010');
INSERT INTO public.nguoidung VALUES (20, '001194000011', 'user_123', 'HoatDong', 4, NULL, '001194000011');
INSERT INTO public.nguoidung VALUES (21, '001196000046', 'user_123', 'HoatDong', 4, NULL, '001196000046');
INSERT INTO public.nguoidung VALUES (22, '001191000012', 'user_123', 'HoatDong', 4, NULL, '001191000012');
INSERT INTO public.nguoidung VALUES (23, '001161000048', 'user_123', 'HoatDong', 4, NULL, '001161000048');
INSERT INTO public.nguoidung VALUES (24, '001206000100', 'user_123', 'HoatDong', 4, NULL, '001206000100');
INSERT INTO public.nguoidung VALUES (25, '001207000101', 'user_123', 'HoatDong', 4, NULL, '001207000101');
INSERT INTO public.nguoidung VALUES (26, '001208000102', 'user_123', 'HoatDong', 4, NULL, '001208000102');
INSERT INTO public.nguoidung VALUES (27, '001209000103', 'user_123', 'HoatDong', 4, NULL, '001209000103');
INSERT INTO public.nguoidung VALUES (28, '001210000104', 'user_123', 'HoatDong', 4, NULL, '001210000104');
INSERT INTO public.nguoidung VALUES (29, '001211000105', 'user_123', 'HoatDong', 4, NULL, '001211000105');


--
-- TOC entry 4850 (class 0 OID 33479)
-- Dependencies: 216
-- Data for Name: vaitro; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.vaitro VALUES (1, 'ToTruong');
INSERT INTO public.vaitro VALUES (2, 'ToPho');
INSERT INTO public.vaitro VALUES (3, 'CanBo');
INSERT INTO public.vaitro VALUES (4, 'NguoiDan');


--
-- TOC entry 4861 (class 0 OID 0)
-- Dependencies: 217
-- Name: nguoidung_nguoidungid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nguoidung_nguoidungid_seq', 29, true);


--
-- TOC entry 4862 (class 0 OID 0)
-- Dependencies: 215
-- Name: vaitro_vaitroid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vaitro_vaitroid_seq', 4, true);


--
-- TOC entry 4702 (class 2606 OID 33500)
-- Name: nguoidung nguoidung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung
    ADD CONSTRAINT nguoidung_pkey PRIMARY KEY (nguoidungid);


--
-- TOC entry 4704 (class 2606 OID 33502)
-- Name: nguoidung nguoidung_tendangnhap_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung
    ADD CONSTRAINT nguoidung_tendangnhap_key UNIQUE (tendangnhap);


--
-- TOC entry 4698 (class 2606 OID 33484)
-- Name: vaitro vaitro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaitro
    ADD CONSTRAINT vaitro_pkey PRIMARY KEY (vaitroid);


--
-- TOC entry 4700 (class 2606 OID 33486)
-- Name: vaitro vaitro_tenvaitro_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaitro
    ADD CONSTRAINT vaitro_tenvaitro_key UNIQUE (tenvaitro);


--
-- TOC entry 4705 (class 2606 OID 33503)
-- Name: nguoidung nguoidung_vaitroid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung
    ADD CONSTRAINT nguoidung_vaitroid_fkey FOREIGN KEY (vaitroid) REFERENCES public.vaitro(vaitroid);


-- Completed on 2025-12-17 20:30:28

--
-- PostgreSQL database dump complete
--

\unrestrict TuBdzmIdTJCIovoH3GARDRBEc1dyeFZhElK1dCaBtkrVnJHYoW6DJt6xanqOzjw

