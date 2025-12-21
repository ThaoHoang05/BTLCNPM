/* household.js - Đã sửa lỗi chuyển hướng và lỗi API */

const e = require("cors");

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
// 2. LOGIC CHI TIẾT HỘ KHẨU (DA XONG PHẦN GỌI API)
// ==============================================

// Wrapper: Mở modal chi tiết hộ khẩu
// ĐÃ SỬA: Chỉ dùng phiên bản UI (Giả lập), bỏ phiên bản gọi API lỗi
async function openDetailModal(hkCode) {
    var dataDetail = {};
    fetch(`/api/hokhau/${hkCode}`)
    .then(request => request.json())
    .then(data =>{
        dataDetail = data;
    })
    // 1. Cập nhật tiêu đề modal
    const titleElement = document.getElementById('detailHKCode');
    if (titleElement) {
        titleElement.innerText = hkCode;
    }

    // Cap nhat du lieu thong tin chung cua ho khau
    var HoTen = document.getElementById('detailChuHo');
    if(dataDetail.HoTen) HoTen.innerText = dataDetail.HoTen;
    else console.error("Loi khi tai du lieu");
    
    var NgayLap = document.getElementById('detailNgayLap');
    if(dataDetail.NgayLap) NgayLap.innerText = dataDetail.NgayLap;
    else console.error("Loi khi tai du lieu");

    var DiaChi = document.getElementById('detailDiaChi');
    if(dataDetail.DiaChi) DiaChi.innerText = dataDetail.DiaChi;
    else console.error("Loi khi tai du lieu");

    // 2. Cập nhật danh sách thành viên trong hộ khẩu
    var thanhvien = data.ThanhVien;
    var memberListBody = document.getElementById('detailMemberTable');
    forEach(thanhvien, function(member) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.HoTen}</td>
            <td>${member.NgaySinh}</td>
            <td>${member.QuanHe}</td>
            <td>${member.CCCD}</td>
            <td>${member.NgheNghiep}</td>
            <td class="text-center">
                <button class="icon-btn warning" onclick="openEditMemberModal('${member.CCCD}')"><i class="fas fa-edit"></i></button>
                <button class="icon-btn danger" onclick="deleteMemberFromHousehold('${hkCode}', '${member.CCCD}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        memberListBody.appendChild(row);
    })
    //3. Xu ly logic cho nut them thanh vien
    const addBtn = document.querySelector('#detailModal .btn-primary');
    if (addBtn) {
        addBtn.setAttribute('onclick', `openAddMemberModal('${hkCode}')`);
    }
    // 4. Cap nhat lich su bien dong cua ho khau
    var historyList = document.getElementById('detailHistoryList');
    var LichSu = data.LichSu;
    if(historyList) {
        // Dữ liệu giả lập (Sau này lấy từ API / bảng biendonghokhau)
        LichSu.forEach(entry => {
            var listItem = document.createElement('li');
            listItem.innerText = `${entry.NgayBienDoi}: ${entry.NoiDung}`;
            historyList.appendChild(listItem);
        });
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
async function openEditHouseholdModal(hkCode) {
    const dataHousehold = {};
    var form = document.getElementById('editHouseholdForm');
    fetch(`/api/hokhau/${hkCode}`)
    .then(request => request.json())
    .then(data =>{
        // Binding dữ liệu từ API vào form (nếu có)
        dataHousehold = data;
        form.querySelector('input[name="sohokhau"]').value = data.soHoKhau || hkCode;
        form.querySelector('input[name="chuhocccd"]').value = data.cccdChuHo || '';
        form.querySelector('input[name="chuhoten"]').value = data.tenChuHo || '';
        form.querySelector('input[name="ngaylap"]').value = data.ngayLapSo ? new Date(data.ngayLapSo).toISOString().split('T')[0] : '';
        
        form.querySelector('input[name="sonha"]').value = data.soNha || '';
        form.querySelector('input[name="duong"]').value = data.duong || '';
        form.querySelector('input[name="phuong"]').value = data.phuong || '';
        form.querySelector('input[name="quan"]').value = data.quan || '';
        form.querySelector('input[name="tinh"]').value = data.tinh || '';
        
        form.querySelector('input[name="ghichu"]').value = data.ghiChu || '';
    })
    .catch(err => {
        console.error("Lỗi tải dữ liệu hộ khẩu để sửa:", err);
    })  
    // Giả lập dữ liệu (Data Binding)
    openModal('editHouseholdModal');
}

async function editHousehold(hkCode) {
    let dataToUpdate = {};
    
    try{

    }catch(err){
        console.error("Lỗi sửa hộ khẩu:", err);
    }
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
// 5. API LOAD DANH SÁCH HỘ KHẨU (đã xong)
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