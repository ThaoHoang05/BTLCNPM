#BTLCNPM – Hệ thống quản lý tổ dân phố
📌 Giới thiệu

BTLCNPM là ứng dụng quản lý tổ dân phố được xây dựng nhằm hỗ trợ công tác hành chính, quản lý cư dân và xử lý thông tin một cách hiệu quả.
Dự án được thực hiện phục vụ mục đích học tập môn Công nghệ phần mềm, mô phỏng hệ thống quản lý tại phường La Khê.

🛠️ Công nghệ sử dụng

Node.js

Express.js

PostgreSQL

JavaScript

HTML / CSS

RESTful API

📁 Cấu trúc thư mục
BTLCNPM/
├── SQL/                # Script cơ sở dữ liệu
├── config/             # Cấu hình hệ thống
├── controllers/        # Xử lý nghiệp vụ
├── middleware/         # Middleware
├── models/             # Mô hình dữ liệu
├── public/             # Giao diện người dùng
├── routes/             # Định tuyến API
├── .env                # Biến môi trường
├── package.json        # Thông tin dự án
├── server.js           # File khởi chạy
└── README.md

⚙️ Yêu cầu môi trường

Node.js >= 14

PostgreSQL

🚀 Hướng dẫn cài đặt & chạy
Bước 1: Clone project
git clone https://github.com/ThaoHoang05/BTLCNPM.git
cd BTLCNPM

Bước 2: Cài đặt thư viện
npm install

Bước 3: Cấu hình môi trường

Tạo file .env tại thư mục gốc:

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_database

Bước 4: Chạy ứng dụng
npm start


Truy cập:

http://localhost:3000

✨ Chức năng chính

Quản lý thông tin cư dân

Quản lý dữ liệu hành chính

Cung cấp REST API

Phân tách rõ Backend & Frontend

🗄️ Cơ sở dữ liệu

Sử dụng PostgreSQL

Các script SQL nằm trong thư mục /SQL

🎯 Mục tiêu dự án

Áp dụng kiến thức Công nghệ phần mềm

Làm quen với mô hình Backend thực tế

Rèn luyện kỹ năng làm việc nhóm

Quản lý mã nguồn với Git & GitHub

🔒 Lưu ý

Không commit node_modules

Không public file .env

Sử dụng .gitignore để bảo mật
