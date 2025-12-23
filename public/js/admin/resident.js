/* citizen.js - Quản lý Nhân Khẩu (Khớp với resident.html) */

// ==============================================
// 1. CÁC HÀM CƠ BẢN (MODAL)
// ==============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Đóng modal khi click ra ngoài (Overlay)
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

// ==============================================
// 2. API LOAD DANH SÁCH NHÂN KHẨU
// ==============================================

async function loadCitizenList() {
    // 1. Lấy đúng ID tbody trong resident.html
    const tbody = document.getElementById('citizenListBody');
    if (!tbody) return;

    // Hiển thị loading
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>';

    try {
        // Gọi API (Backend của bạn)
        const response = await fetch('/api/nhankhau/show');
        const data = await response.json();
        
        // Xử lý nếu data bọc trong object { data: [] }
        const listNhanKhau = Array.isArray(data) ? data : (data.data || []);

        tbody.innerHTML = ''; // Xóa loading

        if (listNhanKhau.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
            return;
        }

        listNhanKhau.forEach(nk => {
            // Logic màu sắc trạng thái (Badge)
            let statusClass = 'badge-secondary'; // Mặc định
            if (nk.trangThai === 'Thường trú' || nk.trangThai === 'ThuongTru') statusClass = 'badge-success'; // Xanh
            else if (nk.trangThai === 'Tạm trú' || nk.trangThai === 'TamTru') statusClass = 'badge-warning'; // Vàng

            // Render dòng tr
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${nk.hoTen}</strong></td>
                <td>${nk.ngaySinh ? new Date(nk.ngaySinh).toLocaleDateString('vi-VN') : '---'}</td>
                <td>${nk.cccd || '---'}</td>
                <td>${nk.diaChi || 'Chưa có thông tin'}</td>
                <td><span class="badge ${statusClass}">${nk.trangThai || '---'}</span></td>
                <td class="text-center">
                    <button class="btn-primary btn-sm" onclick="openEditCitizenModal('${nk.ID}')" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-sm" onclick="deleteCitizen('${nk.ID}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Lỗi tải danh sách:", err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Lỗi kết nối server</td></tr>';
    }
}

// Gọi hàm load ngay khi trang tải xong
document.addEventListener('DOMContentLoaded', loadCitizenList);

// ==============================================
// 3. XỬ LÝ THÊM MỚI (Form ID: memberForm)
// ==============================================

async function createNewCitizen(event) {
    event.preventDefault(); // Chặn reload

    // Lấy form theo đúng ID trong HTML bạn gửi
    const form = document.getElementById('memberForm'); 
    const formData = new FormData(form);
    const v = Object.fromEntries(formData.entries());

    // Mapping dữ liệu từ các input name="..." sang JSON payload
    const payload = {
        "hoTen": v.hoten,
        "biDanh": v.bidanh,
        "ngaySinh": v.ngaysinh,
        "gioiTinh": v.gioitinh,
        "danToc": v.dantoc,
        "tonGiao": v.tongiao,
        "nguyenQuan": v.nguyenquan,
        "noiSinh": v.noisinh,
        "cccd": v.cccd,
        "ngayCapCCCD": v.ngaycapcccd,
        "noiCapCCCD": v.noicapcccd,
        "ngheNghiep": v.nghenghiep,
        "noiLamViec": v.noilamviec,
        "quanHeVoiChuHo": v.quanhevoichuho,
        "maHoKhau": v.sohokhau, // Nếu có logic thêm vào hộ ngay
        "trangThai": v.trangthai
    };

    try {
        const response = await fetch('/api/nhankhau/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Thêm nhân khẩu mới thành công!');
            closeModal('addCitizenModal'); // Đóng modal cha
            form.reset(); // Xóa trắng form
            loadCitizenList(); // Tải lại bảng
        } else {
            const err = await response.json();
            alert('Lỗi: ' + (err.message || 'Thêm thất bại'));
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi kết nối server');
    }
}

// Gắn sự kiện submit cho form thêm mới
document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('memberForm');
    if (addForm) {
        addForm.addEventListener('submit', createNewCitizen);
    }
});

// ==============================================
// 4. XỬ LÝ CẬP NHẬT (Form ID: editCitizenForm)
// ==============================================

// Biến toàn cục lưu ID người đang sửa
let currentEditingId = null; 

async function openEditCitizenModal(id) {
    currentEditingId = id; // Lưu lại ID để dùng khi bấm nút Lưu
    const form = document.getElementById('editCitizenForm');
    
    try {
        // 1. Gọi API lấy chi tiết
        const response = await fetch(`/api/nhankhau/detail/${id}`);
        const data = await response.json();

        // 2. Điền dữ liệu vào form (Binding)
        // Lưu ý: data.field phải khớp với tên cột trong DB trả về
        form.querySelector('[name="hoten"]').value = data.hoTen || '';
        form.querySelector('[name="bidanh"]').value = data.biDanh || '';
        form.querySelector('[name="ngaysinh"]').value = data.ngaySinh ? new Date(data.ngaySinh).toISOString().split('T')[0] : '';
        form.querySelector('[name="gioitinh"]').value = data.gioiTinh || 'Nam';
        form.querySelector('[name="dantoc"]').value = data.danToc || '';
        form.querySelector('[name="tongiao"]').value = data.tonGiao || '';
        form.querySelector('[name="nguyenquan"]').value = data.nguyenQuan || '';
        form.querySelector('[name="noisinh"]').value = data.noiSinh || '';
        
        // CCCD (readonly)
        form.querySelector('[name="cccd"]').value = data.cccd || '';
        form.querySelector('[name="ngaycapcccd"]').value = data.ngayCap ? new Date(data.ngayCap).toISOString().split('T')[0] : '';
        form.querySelector('[name="noicapcccd"]').value = data.noiCap || '';
        
        form.querySelector('[name="nghenghiep"]').value = data.ngheNghiep || '';
        form.querySelector('[name="noilamviec"]').value = data.noiLamViec || '';
        
        form.querySelector('[name="sohokhau"]').value = data.maHoKhau || '';
        form.querySelector('[name="quanhevoichuho"]').value = data.quanHeVoiChuHo || '';
        form.querySelector('[name="trangthai"]').value = data.trangThai || 'ThuongTru';

        // 3. Mở Modal
        openModal('editCitizenModal');

    } catch (err) {
        console.error("Lỗi lấy thông tin sửa:", err);
        alert("Không thể tải thông tin người này.");
    }
}

// Hàm update được gọi khi submit form sửa
async function updateCitizen(event) {
    event.preventDefault(); // Chặn reload trang do onsubmit trong HTML
    
    if (!currentEditingId) return;

    const form = document.getElementById('editCitizenForm');
    const formData = new FormData(form);
    const v = Object.fromEntries(formData.entries());

    // Payload cập nhật
    const payload = {
        "hoTen": v.hoten,
        "biDanh": v.bidanh,
        "ngaySinh": v.ngaysinh,
        "gioiTinh": v.gioitinh,
        "danToc": v.dantoc,
        "tonGiao": v.tongiao,
        "nguyenQuan": v.nguyenquan,
        "noiSinh": v.noisinh,
        // CCCD thường không cho sửa, hoặc nếu có thì lấy v.cccd
        "ngayCapCCCD": v.ngaycapcccd,
        "noiCapCCCD": v.noicapcccd,
        "ngheNghiep": v.nghenghiep,
        "noiLamViec": v.noilamviec,
        "quanHeVoiChuHo": v.quanhevoichuho,
        "maHoKhau": v.sohokhau,
        "trangThai": v.trangthai
    };

    try {
        const response = await fetch(`/api/nhankhau/update/${currentEditingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Cập nhật thông tin thành công!');
            closeModal('editCitizenModal');
            loadCitizenList(); // Tải lại danh sách
        } else {
            const err = await response.json();
            alert('Lỗi: ' + (err.message || 'Cập nhật thất bại'));
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi server khi cập nhật');
    }
}

// ==============================================
// 5. XÓA NHÂN KHẨU
// ==============================================

async function deleteCitizen(id) {
    if (confirm('Bạn có chắc chắn muốn xóa nhân khẩu này khỏi hệ thống?')) {
        try {
            const response = await fetch(`/api/nhankhau/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Đã xóa thành công!');
                loadCitizenList();
            } else {
                alert('Xóa thất bại. Có thể nhân khẩu này đang là Chủ hộ.');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server.');
        }
    }
}