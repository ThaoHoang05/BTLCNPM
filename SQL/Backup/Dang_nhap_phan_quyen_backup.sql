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
-- Name: nguoidung_nguoidungid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nguoidung_nguoidungid_seq OWNED BY public.nguoidung.nguoidungid;


--
-- Name: vaitro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vaitro (
    vaitroid integer NOT NULL,
    tenvaitro character varying(30) NOT NULL
);


ALTER TABLE public.vaitro OWNER TO postgres;

--
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
-- Name: vaitro_vaitroid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vaitro_vaitroid_seq OWNED BY public.vaitro.vaitroid;


--
-- Name: nguoidung nguoidungid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung ALTER COLUMN nguoidungid SET DEFAULT nextval('public.nguoidung_nguoidungid_seq'::regclass);


--
-- Name: vaitro vaitroid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaitro ALTER COLUMN vaitroid SET DEFAULT nextval('public.vaitro_vaitroid_seq'::regclass);


--
-- Data for Name: nguoidung; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nguoidung (nguoidungid, tendangnhap, matkhauhash, trangthai, vaitroid, canboid, cccd) FROM stdin;
1	admin_vana	pass_123	HoatDong	1	1	\N
2	admin_thib	pass_123	HoatDong	2	2	\N
3	canbo_vanc	pass_123	HoatDong	3	3	\N
4	canbo_vanz	pass_123	HoatDong	3	4	\N
5	001192000013	user_123	HoatDong	4	\N	001192000013
6	001185000017	user_123	HoatDong	4	\N	001185000017
7	001172000021	user_123	HoatDong	4	\N	001172000021
8	001200000022	user_123	HoatDong	4	\N	001200000022
9	001195000004	user_123	HoatDong	4	\N	001195000004
10	001188000005	user_123	HoatDong	4	\N	001188000005
11	001190000024	user_123	HoatDong	4	\N	001190000024
12	001175000006	user_123	HoatDong	4	\N	001175000006
13	001168000027	user_123	HoatDong	4	\N	001168000027
14	001165000007	user_123	HoatDong	4	\N	001165000007
15	001193000033	user_123	HoatDong	4	\N	001193000033
16	001192000008	user_123	HoatDong	4	\N	001192000008
17	001190000035	user_123	HoatDong	4	\N	001190000035
18	001180000009	user_123	HoatDong	4	\N	001180000009
19	001198000010	user_123	HoatDong	4	\N	001198000010
20	001194000011	user_123	HoatDong	4	\N	001194000011
21	001196000046	user_123	HoatDong	4	\N	001196000046
22	001191000012	user_123	HoatDong	4	\N	001191000012
23	001161000048	user_123	HoatDong	4	\N	001161000048
24	001206000100	user_123	HoatDong	4	\N	001206000100
25	001207000101	user_123	HoatDong	4	\N	001207000101
26	001208000102	user_123	HoatDong	4	\N	001208000102
27	001209000103	user_123	HoatDong	4	\N	001209000103
28	001210000104	user_123	HoatDong	4	\N	001210000104
29	001211000105	user_123	HoatDong	4	\N	001211000105
\.


--
-- Data for Name: vaitro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vaitro (vaitroid, tenvaitro) FROM stdin;
1	ToTruong
2	ToPho
3	CanBo
4	NguoiDan
\.


--
-- Name: nguoidung_nguoidungid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nguoidung_nguoidungid_seq', 29, true);


--
-- Name: vaitro_vaitroid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vaitro_vaitroid_seq', 4, true);


--
-- Name: nguoidung nguoidung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung
    ADD CONSTRAINT nguoidung_pkey PRIMARY KEY (nguoidungid);


--
-- Name: nguoidung nguoidung_tendangnhap_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung
    ADD CONSTRAINT nguoidung_tendangnhap_key UNIQUE (tendangnhap);


--
-- Name: vaitro vaitro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaitro
    ADD CONSTRAINT vaitro_pkey PRIMARY KEY (vaitroid);


--
-- Name: vaitro vaitro_tenvaitro_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaitro
    ADD CONSTRAINT vaitro_tenvaitro_key UNIQUE (tenvaitro);


--
-- Name: nguoidung nguoidung_vaitroid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung
    ADD CONSTRAINT nguoidung_vaitroid_fkey FOREIGN KEY (vaitroid) REFERENCES public.vaitro(vaitroid);


--
-- PostgreSQL database dump complete
--

