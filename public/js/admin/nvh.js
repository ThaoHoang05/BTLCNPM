/* nvh.js - Quản lý Đăng ký Sử dụng Nhà Văn Hóa */

// ============================================================
// 1. DỮ LIỆU GIẢ LẬP (MOCK DATA)
// ============================================================
// Do chưa có API, mình tạo dữ liệu mẫu để test giao diện
let requestsData = [
    {
        id: 101,
        name: "Nguyễn Văn A",
        phone: "0987654321",
        email: "nguyenvana@gmail.com",
        type: "Thuê sân bóng",
        from: "2024-05-20 08:00",
        to: "2024-05-20 10:00",
        reason: "Tổ chức giải bóng đá giao hữu thanh niên",
        status: "pending", // pending, approved, rejected
        fee: 0,
        rejectReason: ""
    },
    {
        id: 102,
        name: "Trần Thị B",
        phone: "0912345678",
        email: "tranthib@gmail.com",
        type: "Thuê hội trường",
        from: "2024-06-01 14:00",
        to: "2024-06-01 17:00",
        reason: "Họp chi bộ khu phố",
        status: "history", // Giả sử đơn này đã xử lý xong hoặc lưu lịch sử
        result: "Đã duyệt",
        fee: 500000
    }
];

// Biến lưu ID của đơn đang thao tác
let currentSelectedId = null;

// ============================================================
// 2. CÁC HÀM CƠ BẢN (MODAL & TAB)
// ============================================================

// Hàm mở Modal theo ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

// Hàm đóng Modal theo ID
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Đóng modal khi click ra vùng ngoài (Overlay)
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

// Hàm chuyển tab (Chờ duyệt / Lịch sử)
function filterRequests(tabType) {
    // 1. Cập nhật UI tab active
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Tìm nút bấm tương ứng để active (cách đơn giản)
    if(tabType === 'pending') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');

    // 2. Render lại bảng dữ liệu
    renderRequestTable(tabType);
}

// ============================================================
// 3. LOGIC HIỂN THỊ DỮ LIỆU (RENDER)
// ============================================================

function renderRequestTable(filterStatus) {
    const tbody = document.getElementById('requestTableBody');
    tbody.innerHTML = ''; // Xóa dữ liệu cũ

    // Lọc dữ liệu theo tab
    // Nếu tab là 'pending', lấy status = 'pending'
    // Nếu tab là 'history', lấy status != 'pending'
    const filteredData = requestsData.filter(item => {
        if (filterStatus === 'pending') return item.status === 'pending';
        return item.status !== 'pending';
    });

    // Cập nhật số lượng badge
    if (filterStatus === 'pending') {
        document.getElementById('countPending').innerText = filteredData.length;
    }

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        const row = document.createElement('tr');
        
        // Cột Thao tác: Nếu đang chờ duyệt thì hiện nút Xem/Duyệt, nếu lịch sử thì chỉ xem
        let actionBtn = `
            <button class="btn-sm btn-info" onclick="openNVHDetailModal(${item.id})">
                <i class="fas fa-eye"></i> Xem
            </button>
        `;

        row.innerHTML = `
            <td>#${item.id}</td>
            <td>
                <strong>${item.name}</strong><br>
                <small>${item.phone}</small>
            </td>
            <td>
                ${item.from}<br>
                <i class="fas fa-arrow-down"></i><br>
                ${item.to}
            </td>
            <td><span class="badge badge-primary">${item.type}</span></td>
            <td>${item.reason}</td>
            <td class="text-center">${actionBtn}</td>
        `;
        tbody.appendChild(row);
    });
}

// ============================================================
// 4. LOGIC CHI TIẾT & CHUYỂN TIẾP MODAL
// ============================================================

// Mở Modal Chi tiết và đổ dữ liệu
function openNVHDetailModal(id) {
    currentSelectedId = id; // Lưu ID lại để dùng cho các nút Duyệt/Từ chối sau này
    const item = requestsData.find(r => r.id === id);

    if (!item) return;

    // Binding dữ liệu vào HTML (dựa theo ID trong file html của bạn)
    document.getElementById('detailId').innerText = item.id;
    document.getElementById('detailName').innerText = item.name;
    document.getElementById('detailPhone').innerText = item.phone;
    document.getElementById('detailEmail').innerText = item.email;
    document.getElementById('detailType').innerText = item.type;
    document.getElementById('detailFrom').innerText = item.from;
    document.getElementById('detailTo').innerText = item.to;
    document.getElementById('detailReason').innerText = item.reason;

    // Ẩn/Hiện các nút hành động dựa trên trạng thái
    const actionDiv = document.getElementById('detailActions');
    if (item.status === 'pending') {
        actionDiv.style.display = 'flex'; // Hiện nút Duyệt/Từ chối
    } else {
        actionDiv.style.display = 'none'; // Ẩn nếu đã xử lý rồi
    }

    openModal('detailModal');
}

// [Nút trong Modal Chi tiết] -> Chuyển sang Modal Từ chối
function triggerRejectFromDetail() {
    closeModal('detailModal'); // Đóng chi tiết
    
    // Reset form từ chối
    document.getElementById('rejectReason').value = '';
    
    openModal('rejectModal'); // Mở confirm từ chối
}

// [Nút trong Modal Chi tiết] -> Chuyển sang Modal Duyệt
function triggerApproveFromDetail() {
    const item = requestsData.find(r => r.id === currentSelectedId);
    if (!item) return;

    closeModal('detailModal'); // Đóng chi tiết

    // Điền tên người duyệt để xác nhận cho chắc
    document.getElementById('approveName').innerText = item.name;
    document.getElementById('feeInput').value = 0; // Reset phí

    openModal('approveModal'); // Mở confirm duyệt
}

// ============================================================
// 5. LOGIC XÁC NHẬN (SUBMIT)
// ============================================================

// Xác nhận Duyệt (trong approveModal)
function confirmApprove() {
    const fee = document.getElementById('feeInput').value;
    
    // Logic cập nhật dữ liệu (Thay bằng gọi API thật ở đây)
    const index = requestsData.findIndex(r => r.id === currentSelectedId);
    if (index !== -1) {
        requestsData[index].status = 'approved';
        requestsData[index].fee = fee;
        
        alert(`Đã duyệt đơn #${currentSelectedId} thành công! Phí: ${fee} VNĐ`);
        
        closeModal('approveModal');
        renderRequestTable('pending'); // Load lại bảng
        
        // Cập nhật số badge đếm (tạm thời trừ thủ công hoặc gọi lại hàm count)
        const countSpan = document.getElementById('countPending');
        countSpan.innerText = parseInt(countSpan.innerText) - 1;
    }
}

// Xác nhận Từ chối (trong rejectModal)
function confirmReject() {
    const reason = document.getElementById('rejectReason').value;
    
    if (!reason.trim()) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
    }

    // Logic cập nhật dữ liệu
    const index = requestsData.findIndex(r => r.id === currentSelectedId);
    if (index !== -1) {
        requestsData[index].status = 'rejected';
        requestsData[index].rejectReason = reason;
        
        alert(`Đã từ chối đơn #${currentSelectedId}. Lý do: ${reason}`);
        
        closeModal('rejectModal');
        renderRequestTable('pending'); // Load lại bảng
        
        // Cập nhật số badge đếm
        const countSpan = document.getElementById('countPending');
        countSpan.innerText = parseInt(countSpan.innerText) - 1;
    }
}

// ============================================================
// 6. KHỞI TẠO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Mặc định load tab Chờ duyệt
    renderRequestTable('pending');
});