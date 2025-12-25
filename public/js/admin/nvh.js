/* nvh.js - Quản lý Đăng ký Sử dụng Nhà Văn Hóa (Phiên bản tích hợp API) */

// ============================================================
// 1. CẤU HÌNH & TRẠNG THÁI
// ============================================================
const API_BASE_URL = ''; // Để rỗng nếu API cùng domain, hoặc điền http://localhost:3000...
let currentList = [];    // Lưu danh sách đang hiển thị hiện tại
let currentTab = 'pending'; // 'pending' hoặc 'history'
let currentSelectedId = null;

// ============================================================
// 2. CÁC HÀM GỌI API (FETCH)
// ============================================================

// API: Lấy danh sách chờ duyệt (Có lọc ngày)
async function fetchPendingList() {
    try {
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        
        // Nếu có chọn ngày thì thêm params
        if (fromDate && toDate) {
            url += `?from=${fromDate}&to=${toDate}`;
        }

        const response = await fetch(`/api/nvh/pending`);
        if (!response.ok) throw new Error('Lỗi khi tải danh sách chờ');
        
        const data = await response.json();
        // Map dữ liệu API vào cấu trúc chung để render
        currentList = data.map(item => ({
            id: item.id,
            name: item.hoTen,
            from: item.thoiGian.tu,
            to: item.thoiGian.den,
            type: item.loaiHinh || 'Chưa xác định', // API pending không có loại hình, fallback
            reason: item.tenHD, // API pending trả về tenHD
            status: 'pending'
        }));

        renderRequestTable(currentList);
    } catch (error) {
        console.error(error);
        document.getElementById('requestTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Lỗi kết nối API</td></tr>`;
    }
}

// API: Lấy danh sách lịch sử
async function fetchHistoryList() {
    try {
        const response = await fetch(`/api/nvh/history`);
        if (!response.ok) throw new Error('Lỗi khi tải lịch sử');
        
        const data = await response.json();
        
        currentList = data.map(item => ({
            id: item.id,
            name: item.hoTen,
            from: item.thoiGian.tu,
            to: item.thoiGian.den,
            type: item.loaiHinh,
            reason: item.tenHD,
            status: 'history'
        }));

        renderRequestTable(currentList);
    } catch (error) {
        console.error(error);
        alert("Không thể tải dữ liệu lịch sử");
    }
}

// API: Lấy chi tiết đơn lịch sử
async function fetchHistoryDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/nvh/history/${id}`);
        if (!response.ok) throw new Error('Không tìm thấy chi tiết đơn');
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        alert("Lỗi khi tải chi tiết đơn hàng");
        return null;
    }
}

// API: Duyệt đơn
async function postApprove(payload) {
    const response = await fetch(`${API_BASE_URL}/nvh/pending/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return response;
}

// API: Từ chối đơn
async function postReject(payload) {
    const response = await fetch(`${API_BASE_URL}/nvh/pending/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return response;
}

// ============================================================
// 3. LOGIC HIỂN THỊ (RENDER & TABS)
// ============================================================

// Chuyển Tab
function filterRequests(tabType) {
    currentTab = tabType;
    
    // Update UI Tab
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (tabType === 'pending') {
        buttons[0].classList.add('active');
        fetchPendingList(); // Gọi API Pending
        // Ẩn/Hiện nút lọc ngày (chỉ pending mới có API lọc ngày theo yêu cầu)
        document.querySelector('.filter-toolbar').style.display = 'flex';
    } else {
        buttons[1].classList.add('active');
        fetchHistoryList(); // Gọi API History
        // Ẩn thanh lọc nếu API history không hỗ trợ lọc (tùy chỉnh)
    }
}

// Nút lọc dữ liệu (cho tab Pending)
function filterByRange() {
    if (currentTab === 'pending') {
        fetchPendingList();
    } else {
        alert("Chức năng lọc ngày hiện chỉ áp dụng cho danh sách chờ duyệt.");
    }
}

// Render Bảng
function renderRequestTable(data) {
    const tbody = document.getElementById('requestTableBody');
    tbody.innerHTML = '';

    // Cập nhật số lượng
    if (currentTab === 'pending') {
        document.getElementById('countPending').innerText = data.length;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Format ngày giờ cho đẹp (Tuỳ chọn)
        const formatTime = (timeStr) => {
            return timeStr ? timeStr.replace('T', ' ') : '';
        };

        let actionBtn = '';
        if (currentTab === 'pending') {
            actionBtn = `<button class="btn-sm btn-info" onclick="openNVHDetailModal(${item.id})"><i class="fas fa-eye"></i> Duyệt/Xem</button>`;
        } else {
            actionBtn = `<button class="btn-sm btn-secondary" onclick="openNVHDetailModal(${item.id})"><i class="fas fa-history"></i> Chi tiết</button>`;
        }

        row.innerHTML = `
            <td>#${item.id}</td>
            <td><strong>${item.name}</strong></td>
            <td>
                ${formatTime(item.from)}<br>
                <i class="fas fa-arrow-down"></i><br>
                ${formatTime(item.to)}
            </td>
            <td><span class="badge badge-primary">${item.type || 'HĐ chung'}</span></td>
            <td>${item.reason}</td>
            <td class="text-center">${actionBtn}</td>
        `;
        tbody.appendChild(row);
    });
}

// ============================================================
// 4. MODAL & CHI TIẾT
// ============================================================

// Mở Modal chung
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

// Xử lý khi click vào nút Xem chi tiết
async function openNVHDetailModal(id) {
    currentSelectedId = id;
    let detailData = null;

    // Trường hợp 1: Đang ở tab Lịch sử -> Gọi API chi tiết
    if (currentTab === 'history') {
        const apiData = await fetchHistoryDetail(id);
        if (!apiData) return;
        
        // Map dữ liệu từ API history detail
        detailData = {
            id: id,
            name: apiData.hoTen,
            phone: apiData.sdt,
            email: apiData.email,
            type: apiData.loaiHinh,
            from: apiData.thoigian.tu,
            to: apiData.thoigian.den,
            reason: apiData.tenHD, // Hoặc apiData.tenHD
            status: 'history'
        };
    } 
    // Trường hợp 2: Đang ở tab Pending
    // Vì không có API lấy chi tiết pending, ta lấy tạm dữ liệu từ danh sách đã load
    // Lưu ý: List Pending không có sdt, email -> sẽ hiển thị trống hoặc N/A
    else {
        const item = currentList.find(r => r.id === id);
        if (!item) return;
        
        detailData = {
            id: item.id,
            name: item.name,
            phone: "---", // API Pending list không trả về SĐT
            email: "---", // API Pending list không trả về Email
            type: item.type,
            from: item.from,
            to: item.to,
            reason: item.reason,
            status: 'pending'
        };
    }

    // Binding dữ liệu lên Modal
    document.getElementById('detailId').innerText = detailData.id;
    document.getElementById('detailName').innerText = detailData.name;
    document.getElementById('detailPhone').innerText = detailData.phone;
    document.getElementById('detailEmail').innerText = detailData.email;
    document.getElementById('detailType').innerText = detailData.type;
    document.getElementById('detailFrom').innerText = detailData.from;
    document.getElementById('detailTo').innerText = detailData.to;
    document.getElementById('detailReason').innerText = detailData.reason;

    // Ẩn/Hiện nút Duyệt/Hủy
    const actionDiv = document.getElementById('detailActions');
    actionDiv.style.display = (currentTab === 'pending') ? 'flex' : 'none';

    openModal('detailModal');
}

// Chuyển tiếp Modal
function triggerRejectFromDetail() {
    closeModal('detailModal');
    document.getElementById('rejectReason').value = '';
    openModal('rejectModal');
}

function triggerApproveFromDetail() {
    const item = currentList.find(r => r.id === currentSelectedId);
    if (!item) return;

    closeModal('detailModal');
    document.getElementById('approveName').innerText = item.name;
    document.getElementById('feeInput').value = 0; 
    document.getElementById('roomSelect').selectedIndex = 0; // Reset select

    openModal('approveModal');
}

// ============================================================
// 5. XỬ LÝ SUBMIT (APPROVE / REJECT)
// ============================================================

// Xác nhận DUYỆT
async function confirmApprove() {
    const fee = document.getElementById('feeInput').value;
    const roomSelect = document.getElementById('roomSelect');
    const roomName = roomSelect.options[roomSelect.selectedIndex].text;

    if (roomSelect.value === "") {
        alert("Vui lòng chọn phòng phân công!");
        return;
    }

    const payload = {
        id: currentSelectedId, // Thêm ID vào payload để backend biết duyệt đơn nào
        phi: parseInt(fee),
        trangthai: "approved",
        canbo: "admin_01", // ID cán bộ (Hardcode hoặc lấy từ session đăng nhập)
        phong: roomName
    };

    const btn = document.querySelector('#approveModal .btn-primary');
    const oldText = btn.innerText;
    btn.innerText = "Đang xử lý...";
    btn.disabled = true;

    try {
        const response = await postApprove(payload);
        if (response.ok) {
            alert("Đã duyệt đơn thành công!");
            closeModal('approveModal');
            fetchPendingList(); // Load lại danh sách
        } else {
            const err = await response.json();
            alert("Lỗi: " + (err.message || "Không thể duyệt đơn"));
        }
    } catch (e) {
        alert("Lỗi kết nối server");
    } finally {
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

// Xác nhận TỪ CHỐI
async function confirmReject() {
    const reason = document.getElementById('rejectReason').value;
    
    if (!reason.trim()) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
    }

    const payload = {
        id: currentSelectedId, // Thêm ID để biết từ chối đơn nào
        trangthai: "rejected",
        lyDo: reason
    };

    const btn = document.querySelector('#rejectModal .btn-danger');
    const oldText = btn.innerText;
    btn.innerText = "Đang xử lý...";
    btn.disabled = true;

    try {
        const response = await postReject(payload);
        if (response.ok) {
            alert("Đã từ chối đơn!");
            closeModal('rejectModal');
            fetchPendingList(); // Load lại danh sách
        } else {
            alert("Lỗi khi gửi yêu cầu từ chối.");
        }
    } catch (e) {
        alert("Lỗi kết nối server");
    } finally {
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

// ============================================================
// 6. KHỞI TẠO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Mặc định load tab Chờ duyệt
    fetchPendingList();
});