// fetching api de lay thong tin tu csdl
// ==============================================
// 1. QUẢN LÝ MODAL (MỞ / ĐÓNG CHUNG)
// ==============================================

// Hàm mở Modal theo ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Reset form nếu là modal thêm mới
        if (modalId === 'addHouseholdModal') {
            document.getElementById('addHouseholdForm').reset();
            resetMemberTable(); 
        }
    }
}

// Hàm đóng Modal theo ID
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

// Các action con trong chi tiết
// ==============================================
// SỬA HÀM openAddMemberModal
// ==============================================

function openAddMemberModal() {
    // 1. Tìm thẻ tbody của bảng trong Modal Chi tiết (detailModal)
    // Lưu ý: Chúng ta dùng querySelector để tìm đúng bảng class .member-table bên trong #detailModal
    const tbody = document.querySelector('#detailModal .member-table tbody');

    if (!tbody) {
        console.error("Không tìm thấy bảng thành viên trong Modal Chi tiết");
        return;
    }

    // 2. Tạo dòng mới
    const newRow = document.createElement('tr');
    
    // Đánh dấu dòng này đang nhập liệu (để style nếu cần)
    newRow.classList.add('editing-row'); 
    
    // 3. Tạo HTML cho các ô input
    // Cấu trúc cột phải khớp với bảng Chi Tiết: [Họ tên] | [Ngày sinh] | [Quan hệ] | [CCCD] | [Thao tác]
    newRow.innerHTML = `
        <td>
            <input type="text" class="form-control" placeholder="Nhập họ tên..." style="width: 100%">
        </td>
        <td>
            <input type="date" class="form-control" style="width: 100%">
        </td>
        <td>
            <select class="form-control" style="width: 100%">
                <option value="Con">Con</option>
                <option value="Vợ">Vợ</option>
                <option value="Chồng">Chồng</option>
                <option value="Bố">Bố</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Khác">Khác</option>
            </select>
        </td>
        <td>
            <input type="text" class="form-control" placeholder="Số CCCD" style="width: 100%">
        </td>
        <td>
            <div class="action-dropdown">
                <button class="btn-text text-success" title="Lưu" onclick="saveNewMember(this)">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-text text-danger" title="Hủy" onclick="removeRow(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </td>
    `;

    // 4. Thêm dòng vào cuối bảng
    tbody.appendChild(newRow);
}

// ==============================================
// HÀM HỖ TRỢ: LƯU THÀNH VIÊN MỚI (Giả lập)
// ==============================================
function saveNewMember(btn) {
    // Tìm dòng cha (tr) của nút vừa bấm
    const row = btn.closest('tr');
    
    // Lấy giá trị từ các ô input
    const inputs = row.querySelectorAll('input, select');
    const name = inputs[0].value;
    const dob = inputs[1].value;
    const relation = inputs[2].value;
    const cccd = inputs[3].value;

    if(!name) {
        alert("Vui lòng nhập tên thành viên!");
        return;
    }

    // Gửi API lưu vào CSDL tại đây...
    // Sau khi lưu thành công, ta chuyển dòng input thành dòng text bình thường
    
    alert(`Đã thêm thành viên: ${name}`);

    // (Tùy chọn) Chuyển đổi giao diện từ Input sang Text để hiển thị đẹp hơn
    row.innerHTML = `
        <td>${name}</td>
        <td>${dob}</td>
        <td>${relation}</td>
        <td>${cccd}</td>
        <td>
            <div class="action-dropdown">
                <button class="btn-text text-warning" onclick="openMoveModal('${name}')">Chuyển đi</button>
                <button class="btn-text text-danger" onclick="openDeathModal('${name}')">Khai tử</button>
            </div>
        </td>
    `;
    row.classList.remove('editing-row');
}

function openMoveModal(memberName) {
    const date = prompt(`Nhập ngày chuyển đi của ${memberName}:`);
    if (date) alert(`Đã ghi nhận chuyển đi cho ${memberName}`);
}

function openDeathModal(memberName) {
    if (confirm(`Xác nhận khai tử cho: ${memberName}?`)) {
        alert("Đã cập nhật trạng thái: Qua đời");
    }
}

// ==============================================
// 4. CHỨC NĂNG: TÁCH HỘ & XÓA
// ==============================================

function openSplitModal(hkCode) {
    // Logic: Load danh sách thành viên của hkCode vào checkbox list để chọn tách
    console.log("Đang tách hộ: " + hkCode);
    openModal('splitModal');
}

function deleteHousehold(hkCode) {
    if (confirm(`CẢNH BÁO QUAN TRỌNG:\nBạn có chắc chắn muốn xóa toàn bộ thông tin của hộ ${hkCode} không?`)) {
        alert("Đã xóa hộ khẩu thành công!");
        // Logic xóa dòng khỏi bảng HTML...
    }
}