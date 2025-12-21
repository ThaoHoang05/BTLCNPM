/* household.js - Đã sửa lỗi chuyển hướng và lỗi API */

// ==============================================
// 1. CÁC HÀM CƠ BẢN (MODAL, TAB)
// ==============================================

// Hàm mở Modal bất kỳ theo ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Hàm đóng Modal bất kỳ theo ID
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // ĐÃ SỬA: Bỏ dòng window.location.hash = 'resident' để tránh chuyển trang
    }
}

// Đóng modal khi click ra vùng ngoài (Overlay)
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
        // ĐÃ SỬA: Bỏ dòng window.location.hash = 'resident'
    }
}

// ==============================================
// 2. LOGIC CHI TIẾT HỘ KHẨU (SỬA LỖI MODAL KHÔNG HIỆN)
// ==============================================

// Wrapper: Mở modal chi tiết hộ khẩu
// ĐÃ SỬA: Chỉ dùng phiên bản UI (Giả lập), bỏ phiên bản gọi API lỗi
function openDetailModal(hkCode) {
    // 1. Cập nhật tiêu đề modal
    const titleElement = document.getElementById('detailHKCode');
    if (titleElement) {
        titleElement.innerText = hkCode;
    }

    // 2. Điền dữ liệu giả lập (Demo) để test giao diện
    const chuHoEl = document.getElementById('detailChuHo');
    if(chuHoEl) chuHoEl.innerText = "Nguyễn Văn A (Dữ liệu Demo)";
    
    const ngayLapEl = document.getElementById('detailNgayLap');
    if(ngayLapEl) ngayLapEl.innerText = "15/05/2010";

    const diaChiEl = document.getElementById('detailDiaChi');
    if(diaChiEl) diaChiEl.innerText = "10A, Nguyễn Trãi, La Khê";

    // 3. Cập nhật nút "Thêm Thành Viên" trong modal chi tiết
    // Để khi bấm vào nó biết là đang thêm cho Hộ nào
    const addBtn = document.querySelector('#detailModal .btn-primary');
    if (addBtn) {
        addBtn.setAttribute('onclick', `openAddMemberModal('${hkCode}')`);
    }

    const historyList = document.getElementById('detailHistoryList');
    if(historyList) {
        // Dữ liệu giả lập (Sau này lấy từ API / bảng biendonghokhau)
        const mockHistory = [
            { date: '20/10/2024', content: 'Biến động nhân khẩu: Bà Trần Q qua đời.' },
            { date: '28/10/2023', content: 'Tách hộ: Chuyển Tô Thị M sang HK012.' },
            { date: '15/05/2010', content: 'Lập sổ hộ khẩu mới.' }
        ];

        // Render HTML
        historyList.innerHTML = mockHistory.map(item => `
            <li>
                <small>${item.date}:</small> 
                ${item.content}
            </li>
        `).join('');
    }

    // 4. Mở Modal
    openModal('detailModal');
}

// Wrapper: Mở modal tách hộ
function openSplitModal(hkCode) {
    openModal('splitModal');
}

// Wrapper: Xử lý xóa hộ khẩu
function deleteHousehold(hkCode) {
    if(confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ thông tin của hộ ' + hkCode + ' không? Hành động này không thể hoàn tác.')) {
        alert('Đã gửi yêu cầu xóa hộ ' + hkCode);
    }
}

// ==============================================
// 3. LOGIC THÊM & SỬA HỘ KHẨU
// ==============================================

// Hàm mở Modal Sửa và Binding dữ liệu mẫu
function openEditHouseholdModal(hkCode) {
    const form = document.getElementById('editHouseholdForm');
    
    // Giả lập dữ liệu (Data Binding)
    if (hkCode === 'HK001') {
        form.querySelector('input[name="sohokhau"]').value = 'HK001';
        form.querySelector('input[name="chuhocccd"]').value = '001190000001'; 
        form.querySelector('input[name="chuhoten"]').value = 'Nguyễn Văn A';
        form.querySelector('input[name="ngaylap"]').value = '2010-05-15';
        
        form.querySelector('input[name="sonha"]').value = '10A';
        form.querySelector('input[name="duong"]').value = 'Nguyễn Trãi';
        form.querySelector('input[name="phuong"]').value = 'La Khê';
        form.querySelector('input[name="quan"]').value = 'Hà Đông';
        form.querySelector('input[name="tinh"]').value = 'Hà Nội';
        
        form.querySelector('input[name="ghichu"]').value = 'Hộ Tổ trưởng';
    } else {
        form.reset();
        form.querySelector('input[name="sohokhau"]').value = hkCode;
    }
    openModal('editHouseholdModal');
}

// Ham chinh sua thong tin nhan khau trong ho khau
function openEditMemberModal(cccd){
    const form = document.getElementById('editMemberForm');

    // Giả lập dữ liệu (Data Binding)
    if(cccd === '001190000001'){
        form.querySelector('input[name="cccd"]').value = '001190000001';
        form.querySelector('input[name="hoten"]').value = 'Nguyễn Văn A';
        form.querySelector('input[name="ngaysinh"]').value = '1990-01-01';
        form.querySelector('select[name="quanhe"]').value = 'Chồng';
        form.querySelector('input[name="nghenghiep"]').value = 'Kỹ sư';
    } else {
        form.reset();
        form.querySelector('input[name="cccd"]').value = cccd;
    }
    openModal('editMemberModal');
}

// Hàm thêm dòng thành viên mới vào bảng nhập liệu (Giữ nguyên logic cũ của bạn)
function addMemberRow() {
    const tbody = document.getElementById('memberListBody');
    if(!tbody) return;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Họ và tên" required></td>
        <td><input type="date" required></td>
        <td>
            <select style="width:100%; border:none; padding:10px; outline:none;">
                <option value="Vợ">Vợ</option>
                <option value="Chồng">Chồng</option>
                <option value="Con">Con</option>
                <option value="Bố">Bố</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Khác">Khác</option>
            </select>
        </td>
        <td><input type="text" placeholder="Số CCCD"></td>
        <td><input type="text" placeholder="Nghề nghiệp"></td>
        <td class="text-center">
            <button type="button" class="btn-delete-row" onclick="removeRow(this)">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    tbody.appendChild(newRow);
}

function removeRow(btn) {
    const row = btn.closest('tr');
    row.remove();
}

// ==============================================
// 4. LOGIC THÊM THÀNH VIÊN & TÌM KIẾM (TABS)
// ==============================================

// Hàm chuyển Tab (Tìm kiếm <-> Nhập mới)
function switchTab(tabId) {
    // Ẩn tất cả nội dung tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Bỏ active ở tất cả nút tab
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Hiện tab được chọn
    document.getElementById(tabId).classList.add('active');
    
    // Active nút được chọn
    const buttons = document.querySelectorAll('.tab-btn');
    if (tabId === 'tabSearch') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

// Hàm mở Modal Thêm Thành Viên (Được gọi từ nút trong Modal Chi tiết)
function openAddMemberModal(hkCode) {
    // Đóng modal chi tiết để tránh bị che khuất
    closeModal('detailModal'); 
    
    // Reset về Tab tìm kiếm
    switchTab('tabSearch');
    
    // Ẩn kết quả tìm kiếm cũ
    const resArea = document.getElementById('searchResultArea');
    if(resArea) resArea.style.display = 'none';
    
    const searchInput = document.getElementById('searchCCCDInput');
    if(searchInput) searchInput.value = '';

    // Điền Mã hộ vào các form con để tiện nhập liệu
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

// Giả lập hàm Tìm kiếm CCCD
function mockSearchCitizen() {
    const cccd = document.getElementById('searchCCCDInput').value;
    if(!cccd) {
        alert('Vui lòng nhập số CCCD!');
        return;
    }
    // Giả lập tìm thấy
    const resArea = document.getElementById('searchResultArea');
    if(resArea) resArea.style.display = 'block';
    
    const resName = document.getElementById('resName');
    if(resName) resName.value = 'Trần Văn Demo (Tìm thấy)';
    
    const resDob = document.getElementById('resDob');
    if(resDob) resDob.value = '1995-01-01';
}

// ==============================================
// 5. API LOAD DANH SÁCH (GIỮ NGUYÊN)
// ==============================================
async function loadHouseHoldList(){
    try{
        fetch('/api/hokhau')
        .then(response => response.json())
        .then(
            data =>{
                const tbody = document.querySelector('#householdTable tbody');
                if(!tbody) return;
                tbody.innerHTML = ''; 

                data.forEach(hk => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${hk.soHoKhau}</td>
                        <td>${hk.tenChuHo}</td>
                        <td>${hk.diaChi}</td>
                        <td>${new Date(hk.ngayLapSo).toLocaleDateString('vi-VN')}</td>
                        <td class="text-center">
                            <button class="icon-btn info" onclick="openDetailModal('${hk.soHoKhau}')"><i class="fas fa-eye"></i></button>
                            <button class="icon-btn warning" onclick="openEditHouseholdModal('${hk.soHoKhau}')"><i class="fas fa-edit"></i></button>
                            <button class="icon-btn primary" onclick="openSplitModal('${hk.soHoKhau}')"><i class="fas fa-cut"></i></button>
                            <button class="icon-btn danger" onclick="deleteHousehold('${hk.soHoKhau}')"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        )
    }catch(err){
        console.error("Lỗi tải danh sách hộ khẩu (Có thể do chưa có Backend):", err);
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quản lý Hộ khẩu đã sẵn sàng!');
});