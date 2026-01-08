/** FILE: js/admin/account.js **/

// 1. Khởi tạo Namespace an toàn để tránh lỗi "already been declared"
if (typeof AccountState === 'undefined') {
    var AccountState = {
        allData: [],
        filteredData: [],
        currentPage: 1,
        rowsPerPage: 10
    };
    
    var roleMapping = {
        1: { name: 'Tổ trưởng', class: 'badge-primary' },
        2: { name: 'Tổ phó', class: 'badge-info' },
        3: { name: 'Cán bộ', class: 'badge-warning' },
        4: { name: 'Cư dân', class: 'badge-secondary' }
    };
}

// 2. Hàm khởi chạy chính
async function initAccountManager() {
    try {
        const response = await fetch('/api/accounts/'); 
        const res = await response.json();

        if (res.status === 'success') {
            AccountState.allData = res.data.map(acc => ({
                username: acc.tendangnhap,
                fullname: acc.hoten || 'Chưa cập nhật',
                roleId: parseInt(acc.vaitroid), // vaitroid là kiểu SERIAL/số
                status: acc.trangthai
            }));
            
            AccountState.filteredData = [...AccountState.allData];
            displayPage(1); 
            
            // Đảm bảo Modal đã nạp xong mới gán sự kiện
            setTimeout(setupAccountEvents, 300);
        }
    } catch (error) {
        console.error("Lỗi tải danh sách tài khoản:", error);
    }
}

// 3. Quản lý sự kiện: TỰ ĐỘNG LOAD TÊN (Chỉ dành cho Cư dân - ID 4)
function setupAccountEvents() {
    const userInp = document.getElementById('accUsername');
    const roleSel = document.getElementById('accRole');
    const nameInp = document.getElementById('accFullname');
    const form = document.getElementById('accountForm');

    if (userInp && !userInp.dataset.hasListener) {
        const handleResidentCheck = async function() {
            const roleId = roleSel.value; 
            const cccd = userInp.value.trim();

            // Chỉ tự động load tên nếu chọn vai trò Cư dân và đang thêm mới
            if (roleId === "4" && cccd.length >= 9 && !userInp.readOnly) {
                try {
                    const res = await fetch(`/api/accounts/check-resident/${cccd}`).then(r => r.json());
                    if (res.status === 'success') {
                        nameInp.value = res.hoten;
                        nameInp.classList.add('is-valid');
                    } else {
                        nameInp.value = '';
                        alert(res.message);
                        nameInp.classList.remove('is-valid');
                    }
                } catch (e) { console.error("Lỗi API check-resident"); }
            } else if (roleId !== "4") {
                nameInp.classList.remove('is-valid');
            }
        };

        userInp.addEventListener('blur', handleResidentCheck);
        roleSel.addEventListener('change', handleResidentCheck);
        userInp.dataset.hasListener = "true";
    }

    if (form && !form.dataset.hasListener) {
        form.addEventListener('submit', handleFormSubmit);
        form.dataset.hasListener = "true";
    }
}

// 4. KHÔI PHỤC BỘ LỌC (Filter)
window.filterAccounts = function() {
    const text = (document.getElementById('accountSearch')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('roleFilter')?.value; // Giá trị: all, ToTruong, ToPho...
    const statusFilter = document.getElementById('statusFilter')?.value; // Giá trị: all, active, locked

    // Mapping ngược từ mã chữ sang ID số để lọc
    const roleIdMap = { "ToTruong": 1, "ToPho": 2, "CanBo": 3, "NguoiDan": 4 };
    const statusMap = { "active": "HoatDong", "locked": "Khoa" };

    AccountState.filteredData = AccountState.allData.filter(acc => {
        // Lọc theo từ khóa tìm kiếm
        const matchText = acc.username.includes(text) || acc.fullname.toLowerCase().includes(text);
        
        // Lọc theo vai trò (Chuyển đổi roleFilter sang ID số để so sánh)
        const targetRoleId = roleIdMap[roleFilter];
        const matchRole = (roleFilter === 'all') || (acc.roleId === targetRoleId);
        
        // Lọc theo trạng thái
        const targetStatus = statusMap[statusFilter];
        const matchStatus = (statusFilter === 'all') || (acc.status === targetStatus);

        return matchText && matchRole && matchStatus;
    });

    displayPage(1); // Luôn quay về trang 1 sau khi lọc
};

// 5. Hiển thị bảng và Phân trang
function renderAccountTable(data, startIndex) {
    const tbody = document.getElementById('accountTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach((acc, index) => {
        const row = document.createElement('tr');
        const role = roleMapping[acc.roleId] || { name: 'Khác', class: 'badge-secondary' };
        
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td><b>${acc.username}</b></td>
            <td>${acc.fullname}</td>
            <td><span class="badge ${role.class}">${role.name}</span></td>
            <td>${acc.status === 'HoatDong' ? 'Hoạt động' : 'Đã khóa'}</td>
            <td class="text-center">
                <button class="btn-icon" onclick="openEditAccount('${acc.username}')"><i class="fas fa-pen"></i></button>
                <button class="btn-icon" onclick="handleResetPassword('${acc.username}')"><i class="fas fa-key"></i></button>
                <button class="btn-icon" style="color:${acc.status === 'HoatDong' ? 'red' : 'green'}" 
                        onclick="handleToggleLock('${acc.username}', '${acc.status}')">
                    <i class="fas ${acc.status === 'HoatDong' ? 'fa-lock' : 'fa-lock-open'}"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 6. Đăng ký các hàm Global
window.displayPage = function(page) {
    AccountState.currentPage = page;
    const start = (page - 1) * AccountState.rowsPerPage;
    renderAccountTable(AccountState.filteredData.slice(start, start + AccountState.rowsPerPage), start);
    renderPagination();
};

window.renderPagination = function() {
    const controls = document.querySelector('.pagination-controls');
    if (!controls) return;
    const totalPages = Math.ceil(AccountState.filteredData.length / AccountState.rowsPerPage);
    controls.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        controls.innerHTML += `<button class="btn-page ${i === AccountState.currentPage ? 'active' : ''}" onclick="displayPage(${i})">${i}</button>`;
    }
};

window.openAccountModal = function() {
    const modal = document.getElementById('accountModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('accountForm').reset();
        document.getElementById('accUsername').readOnly = false;
        document.getElementById('modalTitle').innerText = 'Thêm Tài Khoản Mới';
    }
};

window.closeAccountModal = function() {
    if (document.getElementById('accountModal')) document.getElementById('accountModal').style.display = 'none';
};

// Đăng ký khởi chạy
window.initAccountManager = initAccountManager;