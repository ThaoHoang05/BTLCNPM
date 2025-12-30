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

let globalCitizenList = []; 

// Hàm này chỉ gọi 1 lần khi load trang để lấy dữ liệu
async function loadCitizenList() {
    const isRestricted = typeof isToPho === 'function' && isToPho();
    const btnAdd = document.querySelector('.btn-success[onclick*="addCitizenModal"]'); // Tìm nút có class success và mở modal add
    
    if (btnAdd) {
        // Nếu là Tổ phó -> Ẩn. Nếu Admin -> Hiện.
        btnAdd.style.display = isRestricted ? 'none' : 'inline-block';
    }
    const tbody = document.getElementById('citizenListBody');
    if (!tbody) return;

    // Hiển thị loading
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>';

    try {
        const response = await fetch('/api/nhankhau/show');
        const data = await response.json();
        
        // Lưu dữ liệu vào biến toàn cục (để dùng cho tìm kiếm sau này)
        globalCitizenList = Array.isArray(data) ? data : (data.data || []);

        // Gọi hàm vẽ bảng
        renderCitizenTable(globalCitizenList);

    } catch (err) {
        console.error("Lỗi tải danh sách:", err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Lỗi kết nối server</td></tr>';
    }
}

// Hàm riêng để vẽ bảng (Dùng chung cho cả Load ban đầu và Tìm kiếm)
function renderCitizenTable(dataList) {
    const tbody = document.getElementById('citizenListBody');
    tbody.innerHTML = ''; 

    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không tìm thấy dữ liệu phù hợp</td></tr>';
        return;
    }

    // Kiểm tra quyền
    const isRestricted = typeof isToPho === 'function' && isToPho();

    dataList.forEach(nk => {
        let statusClass = 'badge-secondary'; 
        const trangThaiText = nk.trangThai || '';
        if (trangThaiText.includes('Thường trú')) statusClass = 'badge-success'; 
        else if (trangThaiText.includes('Tạm trú')) statusClass = 'badge-warning';

        const ngaySinhStr = nk.ngaySinh ? new Date(nk.ngaySinh).toLocaleDateString('vi-VN') : '---';

        // --- LOGIC NÚT BẤM MỚI ---
        let actionButtons = '';
        
        if (isRestricted) {
            // TỔ PHÓ: Chỉ hiện nút Xem (dùng icon con mắt), Ẩn nút Xóa
            // Vẫn gọi openEditCitizenModal nhưng lát nữa ta sẽ xử lý logic readonly bên trong đó
            actionButtons = `
                <button class="btn-info btn-sm" onclick="openEditCitizenModal('${nk.ID}')" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
            `;
        } else {
            // ADMIN: Hiện Sửa và Xóa bình thường
            actionButtons = `
                <button class="btn-primary btn-sm" onclick="openEditCitizenModal('${nk.ID}')" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger btn-sm" onclick="deleteCitizen('${nk.ID}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }
        // --------------------------

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${nk.hoTen}</strong></td>
            <td>${ngaySinhStr}</td>
            <td>${nk.cccd || '---'}</td>
            <td>${nk.diaChi || 'Chưa có thông tin'}</td>
            <td><span class="badge ${statusClass}">${nk.trangThai || '---'}</span></td>
            <td class="text-center">
                ${actionButtons}
            </td>
        `;
        tbody.appendChild(row);
    });
}
// Hàm xử lý tìm kiếm (Được gọi khi gõ vào ô input)
function searchResidents() {
    const input = document.getElementById('searchInput');
    const keyword = input.value.trim().toLowerCase(); // Chuyển về chữ thường

    if (keyword === "") {
        // Nếu ô tìm kiếm trống -> Hiển thị lại toàn bộ danh sách gốc
        renderCitizenTable(globalCitizenList);
        return;
    }

    // Lọc danh sách (Client-side filtering)
    const filteredList = globalCitizenList.filter(item => {
        // 1. Chuẩn bị dữ liệu để so sánh
        const name = item.hoTen ? item.hoTen.toLowerCase() : "";
        const cccd = item.cccd ? item.cccd.toLowerCase() : "";
        
        // 2. Logic so sánh (Tìm theo Tên HOẶC CCCD)
        // Mẹo: removeVietnameseTones là hàm bổ trợ để tìm Thao ra Thảo (xem bên dưới)
        return removeVietnameseTones(name).includes(removeVietnameseTones(keyword)) || 
               cccd.includes(keyword);
    });

    // Vẽ lại bảng với danh sách đã lọc
    renderCitizenTable(filteredList);
}

// Hàm bổ trợ: Xóa dấu tiếng Việt (để tìm kiếm không dấu)
function removeVietnameseTones(str) {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    return str;
}

// Gọi hàm load ngay khi trang tải xong
document.addEventListener('DOMContentLoaded', loadCitizenList);

async function createNewCitizen() {
    // 1. Kiểm tra xem hàm có được gọi không
    console.log("Nút bấm đã hoạt động! Đang xử lý...");

    const form = document.getElementById('memberForm');
    if (!form) {
        alert("Lỗi: Không tìm thấy Form nhập liệu (ID: memberForm)");
        return;
    }

    // 2. Validate dữ liệu cơ bản (HTML required không chạy với type="button" nên cần check tay)
    const formData = new FormData(form);
    const v = Object.fromEntries(formData.entries());

    // Kiểm tra các trường bắt buộc
    if (!v.hoten || !v.ngaysinh || !v.trangthai) {
        alert("Vui lòng nhập đầy đủ: Họ tên, Ngày sinh và Trạng thái!");
        return;
    }

    // 3. Chuẩn bị dữ liệu gửi đi (Mapping)
    const payload = {
        "hoTen": v.hoten,
        "bietDanh": v.bidanh, 
        "ngaySinh": v.ngaysinh,
        "gioiTinh": v.gioitinh,
        "danToc": v.dantoc,
        "tonGiao": v.tongiao,
        "nguyenQuan": v.nguyenquan,
        "noiSinh": v.noisinh,
        "cccd": v.cccd,
        "ngayCap": v.ngaycapcccd,
        "noiCap": v.noicapcccd,
        "ngheNghiep": v.nghenghiep,
        "noiLamViec": v.noilamviec,
        "maHK": v.sohokhau,
        "quanheChuHo": v.quanhevoichuho,
        "trangThai": v.trangthai
    };

    try {
        // --- QUAN TRỌNG: Kiểm tra lại đường dẫn API ---
        const response = await fetch('/api/nhankhau/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Thêm thành công!');
            closeModal('addCitizenModal');
            form.reset();
            loadCitizenList();
        } else {
            const err = await response.json();
            alert('Lỗi Server: ' + (err.message || 'Không thể lưu'));
            console.error(err);
        }
    } catch (error) {
        console.error("Lỗi mạng:", error);
        alert('Không thể kết nối tới Server (Kiểm tra lại console)');
    }
}
// Đảm bảo sự kiện được gắn đúng
document.addEventListener('DOMContentLoaded', function() {
    loadCitizenList(); // Tải danh sách

    // Gắn sự kiện submit cho form thêm mới
    const addForm = document.getElementById('memberForm');
    if (addForm) {
        // Xóa các event cũ (nếu có) để tránh duplicate bằng cách clone
        const newForm = addForm.cloneNode(true);
        addForm.parentNode.replaceChild(newForm, addForm);
        newForm.addEventListener('submit', createNewCitizen);
    }
});
// ==============================================
// 4. XỬ LÝ CẬP NHẬT (Form ID: editCitizenForm)
// ==============================================

// Biến toàn cục lưu ID người đang sửa
let currentEditingId = null; 

async function openEditCitizenModal(id) {
    currentEditingId = id; 
    const form = document.getElementById('editCitizenForm');
    
    // Lấy các thành phần giao diện cần xử lý
    const submitBtn = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input, select, textarea');
    const modalTitle = document.querySelector('#editCitizenModal h3'); // Tiêu đề modal

    // Kiểm tra quyền
    const isRestricted = typeof isToPho === 'function' && isToPho();

    try {
        // 1. Gọi API lấy chi tiết
        const response = await fetch(`/api/nhankhau/detail/${id}`);
        const data = await response.json();

        // 2. Điền dữ liệu vào form (Binding cũ giữ nguyên)
        form.querySelector('[name="hoten"]').value = data.hoTen || '';
        form.querySelector('[name="bidanh"]').value = data.biDanh || '';
        form.querySelector('[name="ngaysinh"]').value = data.ngaySinh ? new Date(data.ngaySinh).toISOString().split('T')[0] : '';
        form.querySelector('[name="gioitinh"]').value = data.gioiTinh || 'Nam';
        form.querySelector('[name="dantoc"]').value = data.danToc || '';
        form.querySelector('[name="nguyenquan"]').value = data.nguyenQuan || '';
        form.querySelector('[name="noisinh"]').value = data.noiSinh || '';
        form.querySelector('[name="cccd"]').value = data.cccd || '';
        form.querySelector('[name="ngaycapcccd"]').value = data.ngayCap ? new Date(data.ngayCap).toISOString().split('T')[0] : '';
        form.querySelector('[name="noicapcccd"]').value = data.noiCap || '';
        form.querySelector('[name="nghenghiep"]').value = data.ngheNghiep || '';
        form.querySelector('[name="noilamviec"]').value = data.noiLamViec || '';
        form.querySelector('[name="sohokhau"]').value = data.maHoKhau || '';
        form.querySelector('[name="quanhevoichuho"]').value = data.quanHeVoiChuHo || '';
        form.querySelector('[name="trangthai"]').value = data.trangThai || 'Thường Trú';
        form.querySelector('[name="tongiao"]').value = data.tonGiao || 'Không';

        // --- ĐOẠN MỚI: XỬ LÝ READ-ONLY ---
        if (isRestricted) {
            // TRƯỜNG HỢP: TỔ PHÓ (CHỈ XEM)
            
            // 1. Disable toàn bộ ô nhập liệu
            inputs.forEach(input => input.disabled = true);
            
            // 2. Ẩn nút Cập nhật (Lưu)
            if(submitBtn) submitBtn.style.display = 'none';

            // 3. Đổi tiêu đề Modal cho hợp lý
            if(modalTitle) modalTitle.innerHTML = '<i class="fas fa-info-circle"></i> Chi tiết Nhân khẩu (Chỉ xem)';

        } else {
            // TRƯỜNG HỢP: ADMIN (ĐƯỢC SỬA)
            
            // 1. Enable lại ô nhập liệu (trừ những ô readonly mặc định nếu có)
            inputs.forEach(input => input.disabled = false);
            
            // 2. Hiện lại nút Cập nhật
            if(submitBtn) submitBtn.style.display = 'inline-block';

            // 3. Trả lại tiêu đề gốc
            if(modalTitle) modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Chỉnh Sửa Thông Tin Nhân Khẩu';
        }
        // ----------------------------------

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
        "nguyenQuan": v.nguyenquan,
        "noiSinh": v.noisinh,
        "cccd": v.cccd,
        "ngayCapCCCD": v.ngaycapcccd,
        "noiCapCCCD": v.noicapcccd,
        "ngheNghiep": v.nghenghiep,
        "noiLamViec": v.noilamviec,
        "quanHeVoiChuHo": v.quanhevoichuho,
        "maHoKhau": v.sohokhau,
        "trangThai": v.trangthai,
        "tonGiao": v.tongiao,
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

document.addEventListener('DOMContentLoaded', () => {
    if (isToPho()) {
        // Danh sách các selector của nút Thêm Mới, Đăng ký...
        const restrictedSelectors = [
            '.btn-success[onclick*="openModal"]', // Các nút Thêm màu xanh
            '.btn-warning[onclick*="openManageResidence"]', // Nút Quản lý cư trú
            '.btn-warning[onclick*="openModal"]' // Các nút màu vàng khác
        ];

        restrictedSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Kiểm tra kỹ hơn nội dung text để tránh ẩn nhầm
                const text = el.innerText.toLowerCase();
                if (text.includes('thêm') || text.includes('đăng ký') || text.includes('quản lý')) {
                    el.style.display = 'none';
                }
            });
        });
    }
});