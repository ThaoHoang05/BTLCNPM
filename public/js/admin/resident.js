// Hàm mở Modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Hàm đóng Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Mở modal Chi tiết hộ
function openDetailModal(hkCode) {
    const titleElement = document.getElementById('detailHKCode');
    if (titleElement) {
        titleElement.innerText = hkCode;
    }
    // Gán onclick cho nút Thêm thành viên bên trong Modal Chi tiết để nó biết đang thêm vào hộ nào
    const addBtn = document.querySelector('#detailModal .btn-primary');
    if(addBtn) {
        addBtn.setAttribute('onclick', `openAddMemberModal('${hkCode}')`);
    }
    openModal('detailModal');
}

// Mở modal Thêm thành viên (Có tham số hkCode)
function openAddMemberModal(hkCode) {
    const form = document.getElementById('memberForm');
    form.reset();
    
    // Nếu có mã hộ truyền vào, điền tự động và khóa lại
    if(hkCode) {
        const hkInput = form.querySelector('input[name="sohokhau"]');
        if(hkInput) {
            hkInput.value = hkCode;
        }
    }
    openModal('addMemberModal');
}

function openSplitModal(hkCode) {
    openModal('splitModal');
}

function deleteHousehold(hkCode) {
    if(confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ thông tin của hộ ' + hkCode + ' không?')) {
        alert('Đã xóa hộ ' + hkCode);
    }
}

// Hàm mở Modal Sửa và Binding dữ liệu mẫu
function openEditHouseholdModal(hkCode) {
    const form = document.getElementById('editHouseholdForm');
    
    // Giả lập dữ liệu (Data Binding)
    if (hkCode === 'HK001') {
        form.querySelector('input[name="sohokhau"]').value = 'HK001';
        form.querySelector('input[name="ngaylap"]').value = '2010-05-15';

        // --- Dữ liệu Chủ hộ ---
        form.querySelector('input[name="chuhoten"]').value = 'Nguyễn Văn A'; // Mới thêm
        form.querySelector('input[name="chuhocccd"]').value = '001190000001'; 
        
        // --- Dữ liệu Địa chỉ ---
        form.querySelector('input[name="sonha"]').value = '10A';
        form.querySelector('input[name="duong"]').value = 'Nguyễn Trãi';
        form.querySelector('input[name="phuong"]').value = 'La Khê';
        form.querySelector('input[name="quan"]').value = 'Hà Đông';
        form.querySelector('input[name="tinh"]').value = 'Hà Nội';

        form.querySelector('input[name="ghichu"]').value = 'Hộ Tổ trưởng';
    } else {
        // Reset form cho trường hợp thêm mới hoặc không tìm thấy
        form.reset();
        form.querySelector('input[name="sohokhau"]').value = hkCode;
    }

    openModal('editHouseholdModal');
}

// --- LOGIC CHO MODAL THÊM THÀNH VIÊN (TAB) ---

// 1. Hàm chuyển Tab
function switchTab(tabId) {
    // Ẩn tất cả nội dung tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Bỏ active ở tất cả nút tab
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Hiện tab được chọn
    document.getElementById(tabId).classList.add('active');
    
    // Active nút được chọn (Dựa vào sự kiện click hoặc logic tìm nút)
    // Cách đơn giản: Loop qua nút để set active dựa trên onclick
    const buttons = document.querySelectorAll('.tab-btn');
    if (tabId === 'tabSearch') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

// 2. Cập nhật hàm mở Modal để nhận mã hộ và reset Tab về mặc định
function openAddMemberModal(hkCode) {
    closeModal('detailModal'); // Đóng modal chi tiết để tránh chồng lấn
    
    // Reset về Tab 1 (Tìm kiếm)
    switchTab('tabSearch');
    
    // Ẩn kết quả tìm kiếm cũ
    document.getElementById('searchResultArea').style.display = 'none';
    document.getElementById('searchCCCDInput').value = '';

    // Điền Mã hộ vào cả 2 Form (Search & New)
    if(hkCode) {
        // Form tìm kiếm
        const hkInputSearch = document.querySelector('input[name="sohokhau_search"]');
        if(hkInputSearch) hkInputSearch.value = hkCode;

        // Form nhập mới
        const hkInputNew = document.querySelector('#memberForm input[name="sohokhau"]');
        if(hkInputNew) hkInputNew.value = hkCode;
    }
    
    openModal('addMemberModal');
}

// 3. Giả lập hàm Tìm kiếm CCCD (Dùng cho nút "Tìm")
function mockSearchCitizen() {
    const cccd = document.getElementById('searchCCCDInput').value;
    if(!cccd) {
        alert('Vui lòng nhập số CCCD!');
        return;
    }

    // Giả lập loading
    const btn = document.querySelector('#tabSearch .btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tìm...';

    setTimeout(() => {
        // Giả lập tìm thấy
        document.getElementById('searchResultArea').style.display = 'block';
        document.getElementById('resName').value = 'Trần Văn Demo (Tìm thấy)';
        document.getElementById('resDob').value = '1995-01-01';
        
        btn.innerHTML = originalText;
    }, 500);
}

// --- LOGIC SỬA NHÂN KHẨU (RIÊNG BIỆT) ---

function openEditMemberModal(cccd) {
    // 1. Đóng modal danh sách/chi tiết hộ (nếu cần nhìn cho thoáng)
    // closeModal('detailModal'); // Tùy chọn: Có thể giữ nguyên để đối chiếu

    const form = document.getElementById('editMemberForm');
    form.reset();

    // 2. Giả lập lấy dữ liệu từ Server dựa trên CCCD (Data Binding)
    // Ví dụ: Đang sửa ông Nguyễn Văn A
    if(cccd === '001190000001') {
        form.querySelector('input[name="hoten"]').value = 'Nguyễn Văn A';
        form.querySelector('input[name="ngaysinh"]').value = '1990-01-01';
        form.querySelector('select[name="gioitinh"]').value = 'Nam';
        form.querySelector('input[name="dantoc"]').value = 'Kinh';
        form.querySelector('input[name="nguyenquan"]').value = 'Hà Nội';
        form.querySelector('input[name="noisinh"]').value = 'Hà Nội';
        
        form.querySelector('input[name="cccd"]').value = '001190000001';
        form.querySelector('input[name="ngaycapcccd"]').value = '2020-01-01';
        form.querySelector('input[name="noicapcccd"]').value = 'CA Hà Nội';
        
        form.querySelector('input[name="nghenghiep"]').value = 'Tổ trưởng';
        form.querySelector('input[name="noilamviec"]').value = 'UBND Phường';
        
        form.querySelector('input[name="sohokhau"]').value = 'HK001';
        form.querySelector('input[name="quanhevoichuho"]').value = 'Chủ hộ';
        form.querySelector('select[name="trangthai"]').value = 'Thường trú';
    } 
    // Ví dụ khác...
    else {
        // Nếu không có data mẫu thì điền tạm CCCD để test
        form.querySelector('input[name="cccd"]').value = cccd;
    }

    // 3. Mở Modal Sửa
    openModal('editMemberModal');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Quản lý Hộ khẩu đã sẵn sàng!');
});