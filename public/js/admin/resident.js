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

// Đóng modal khi click ra vùng ngoài (Overlay)
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

// ==============================================
// 2. CHỨC NĂNG: THÊM HỘ KHẨU MỚI
// ==============================================

// Hàm thêm dòng thành viên mới vào bảng nhập liệu
function addMemberRow() {
    const tbody = document.getElementById('memberListBody');
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

// Hàm xóa dòng thành viên
function removeRow(btn) {
    const row = btn.closest('tr');
    row.remove();
}

// Hàm reset bảng thành viên về mặc định (chỉ còn chủ hộ)
function resetMemberTable() {
    const tbody = document.getElementById('memberListBody');
    // Giữ lại dòng đầu tiên (class owner-row), xóa các dòng sau
    while (tbody.rows.length > 1) {
        tbody.deleteRow(1);
    }
}

// Xử lý sự kiện Submit Form Thêm Hộ
document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addHouseholdForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Chặn load lại trang
            
            // Logic lấy dữ liệu tại đây (Demo)
            const rowCount = document.getElementById('memberListBody').rows.length;
            
            alert(`Đã thêm hộ khẩu mới thành công gồm ${rowCount} thành viên!`);
            closeModal('addHouseholdModal');
        });
    }
});

// ==============================================
// 3. CHỨC NĂNG: CHI TIẾT HỘ KHẨU
// ==============================================

async function openDetailModal(hkCode) {
    try {
        const response = await fetch(`/api/hokhau/${hkCode}`);
        const data = await response.json();

        if (response.ok) {
            // Điền thông tin chung
            document.getElementById('detailHKCode').innerText = hkCode;

            // Sử dụng ID để gán dữ liệu chính xác
            document.getElementById('detailChuHo').innerText = data.tenChuHo;
            document.getElementById('detailDiaChi').innerText = data.diaChi;
            
            document.getElementById('detailNgayLap').innerText = data.ngayLapSo 
                ? new Date(data.ngayLapSo).toLocaleDateString('vi-VN') 
                : "Chưa có dữ liệu";

            // Render danh sách nhân khẩu
            const memberTable = document.querySelector('#detailModal .member-table tbody');
            memberTable.innerHTML = data.danhSachNhanKhau.map(m => `
                <tr>
                    <td>${m.hoTen}</td>
                    <td>${new Date(m.ngaySinh).toLocaleDateString('vi-VN')}</td>
                    <td>
                        <span class="role-badge ${m.quanHeWithChuHo === 'Chủ hộ' ? 'head' : ''}">
                            ${m.quanHeWithChuHo}
                        </span>
                    </td>
                    <td>${m.cccd || '-'}</td>
                    <td>
                        ${m.quanHeWithChuHo !== 'Chủ hộ' ? `
                            <div class="action-dropdown">
                                <button class="btn-text text-warning" onclick="openMoveModal('${m.hoTen}')">Chuyển đi</button>
                                <button class="btn-text text-danger" onclick="openDeathModal('${m.hoTen}')">Khai tử</button>
                            </div>
                        ` : '-'}
                    </td>
                </tr>
            `).join('');

            // Render lịch sử biến động
            const historyList = document.querySelector('#detailModal .history-list');
            historyList.innerHTML = data.lichSuBienDong.map(h => `
                <li>
                    <small>${new Date(h.ngayBienDoi).toLocaleDateString('vi-VN')}:</small> 
                    <strong>${h.loaiBienDong}</strong> - ${h.tenNguoiThayDoi} 
                    ${h.noiDen ? `(Đến: ${h.noiDen})` : ''}
                </li>
            `).join('');

            openModal('detailModal');
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
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

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Quản lý Hộ khẩu đã sẵn sàng!');
});