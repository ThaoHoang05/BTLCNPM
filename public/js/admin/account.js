/** FILE: js/admin/account.js **/

// Dữ liệu mẫu
let accountsData = [
    { id: 1, username: '001234567890', fullname: 'Nguyễn Văn A', role: 'admin', status: 'active' },
    { id: 2, username: '001099123456', fullname: 'Trần Thị B', role: 'totruong', status: 'active' },
    { id: 3, username: '001099987654', fullname: 'Lê Văn C', role: 'user', status: 'locked' }
];

// Hàm khởi chạy chính (được gọi từ dashboard.js)
function initAccountManager() {
    renderAccountTable(accountsData);
}

// Hàm render bảng
function renderAccountTable(data) {
    const tbody = document.getElementById('accountTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Kiểm tra quyền Tổ phó
    const isUserToPho = (typeof isToPho === 'function') ? isToPho() : false;

    data.forEach((acc, index) => {
        const row = document.createElement('tr');
        
        // Badge cho Role
        let roleBadge = '';
    if (acc.role === 'admin') {
        roleBadge = '<span class="badge badge-success">Admin</span>';
    } else if (acc.role === 'totruong') {
        roleBadge = '<span class="badge badge-primary">Tổ trưởng</span>';
    } else {
        roleBadge = '<span class="badge badge-secondary">Cư dân</span>';
    }

    let statusBadge = '';
    if (acc.status === 'active') {
        // Dùng style inline hoặc class riêng nếu muốn
        statusBadge = '<span class="badge" style="background-color: #d1e7dd; color: #0f5132;">Hoạt động</span>';
    } else {
        statusBadge = '<span class="badge" style="background-color: #f8d7da; color: #842029;">Đã khóa</span>';
    }

        // Xử lý cột Hành động dựa trên quyền
        let actionButtons = '';
        if (isUserToPho) {
            // Nếu là Tổ phó: Chỉ xem, hoặc không có nút hành động nào
            actionButtons = `<span class="text-muted" style="font-size:0.8rem">Không có quyền</span>`;
        } else {
            // Nếu là Admin/Tổ trưởng: Hiển thị đầy đủ
            actionButtons = `
                <button class="btn-icon" onclick="openEditAccount(${acc.id})" title="Sửa"><i class="fas fa-pen"></i></button>
                <button class="btn-icon" onclick="resetPassword(${acc.id})" title="Reset Pass"><i class="fas fa-key"></i></button>
                <button class="btn-icon" style="color:red" onclick="toggleLockAccount(${acc.id})" title="Khóa/Mở"><i class="fas fa-lock"></i></button>
            `;
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><b>${acc.username}</b></td>
            <td>${acc.fullname}</td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>
            <td class="text-center">${actionButtons}</td>
        `;
        tbody.appendChild(row);
    });
}

// Hàm lọc (Filter)
function filterAccounts() {
    const text = document.getElementById('accountSearch').value.toLowerCase();
    const role = document.getElementById('roleFilter').value;
    const status = document.getElementById('statusFilter').value;

    const filtered = accountsData.filter(acc => {
        const matchText = acc.username.includes(text) || acc.fullname.toLowerCase().includes(text);
        const matchRole = role === 'all' || acc.role === role;
        const matchStatus = status === 'all' || acc.status === status;
        return matchText && matchRole && matchStatus;
    });

    renderAccountTable(filtered);
}

// --- Các hàm Modal (Mở/Đóng) ---
function openAccountModal() {
    // Logic mở modal thêm mới (đã có trong HTML của bạn)
    document.getElementById('accountModal').style.display = 'flex';
    document.getElementById('accountForm').reset();
    document.getElementById('modalTitle').innerText = 'Thêm Tài Khoản Mới';
}

function closeAccountModal() {
    document.getElementById('accountModal').style.display = 'none';
}

// Các hàm placeholder cho hành động
function openEditAccount(id) { alert("Chức năng sửa ID: " + id); }
function resetPassword(id) { alert("Reset mật khẩu ID: " + id); }
function toggleLockAccount(id) { alert("Khóa/Mở tài khoản ID: " + id); }

// Export các hàm ra window để HTML gọi được (onclick)
window.filterAccounts = filterAccounts;
window.openAccountModal = openAccountModal;
window.closeAccountModal = closeAccountModal;
window.initAccountManager = initAccountManager;
window.openEditAccount = openEditAccount;
window.resetPassword = resetPassword;
window.toggleLockAccount = toggleLockAccount;