/** FILE: js/admin/request.js **/

// Dữ liệu giả lập (Sau này thay bằng fetch API từ DB)
let requestsData = [
    { 
        id: 1, 
        sender: '001099000123', 
        senderName: 'Nguyễn Văn A', 
        type: 'Sửa Nhân Khẩu', 
        date: '2026-01-06T10:30:00', 
        content: { field: 'nghe_nghiep', oldVal: 'Sinh viên', newVal: 'Kỹ sư phần mềm', lyDo: 'Đã tốt nghiệp' },
        status: 'Chờ duyệt',
        adminNote: ''
    },
    { 
        id: 2, 
        sender: '001099000456', 
        senderName: 'Trần Thị B', 
        type: 'Đăng ký Tạm Trú', 
        date: '2026-01-05T14:20:00', 
        content: { cccd: '034234...', tungay: '2026-01-01', denngay: '2026-06-01', lyDo: 'Làm việc' },
        status: 'Đã duyệt',
        adminNote: 'Đã kiểm tra giấy tờ'
    },
    { 
        id: 3, 
        sender: '001099000789', 
        senderName: 'Lê Văn C', 
        type: 'Sửa Hộ Khẩu', 
        date: '2026-01-06T09:00:00', 
        content: { field: 'dia_chi', oldVal: 'Số 1', newVal: 'Số 10', lyDo: 'Nhập sai' },
        status: 'Từ chối',
        adminNote: 'Cần giấy xác nhận số nhà'
    }
];

// Hàm khởi tạo
function initCitizenRequestManager() {
    renderCitizenRequestTable(requestsData);
}

// Render Bảng
function renderCitizenRequestTable(data) {
    const tbody = document.getElementById('requestTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có yêu cầu nào.</td></tr>';
        return;
    }

    data.forEach(req => {
        const row = document.createElement('tr');
        
        let statusClass = 'req-pending';
        if(req.status === 'Đã duyệt') statusClass = 'req-approved';
        if(req.status === 'Từ chối') statusClass = 'req-rejected';

        // Format ngày
        const dateStr = new Date(req.date).toLocaleString('vi-VN');

        // Tóm tắt nội dung
        let summary = '';
        if(req.type.includes('Sửa')) summary = `Sửa ${req.content.field}: ${req.content.oldVal} -> ${req.content.newVal}`;
        else summary = `Lý do: ${req.content.lyDo}`;

        row.innerHTML = `
            <td><b>${req.sender}</b><br><small>${req.senderName}</small></td>
            <td>${req.type}</td>
            <td>${dateStr}</td>
            <td>${summary}</td>
            <td><span class="req-badge ${statusClass}">${req.status}</span></td>
            <td class="text-center">
        <button class="btn-view-req" onclick="openCitizenRequestDetail(${req.id})" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
        </button>
    </td>
        `;
        tbody.appendChild(row);
    });
}



// Bộ lọc
function filterCitizenRequests() {
    const term = document.getElementById('reqSearch').value.toLowerCase();
    const type = document.getElementById('reqTypeFilter').value;
    const status = document.getElementById('reqStatusFilter').value;

    const filtered = requestsData.filter(req => {
        const matchTerm = req.sender.includes(term) || req.senderName.toLowerCase().includes(term);
        const matchType = type === 'all' || req.type === type;
        const matchStatus = status === 'all' || req.status === status;
        return matchTerm && matchType && matchStatus;
    });
    renderCitizenRequestTable(filtered);
}

// --- LOGIC MODAL ---
function openCitizenRequestDetail(id) {
    const req = requestsData.find(r => r.id === id);
    if(!req) return;

    document.getElementById('currentReqId').value = req.id;
    document.getElementById('modalSender').innerText = `${req.senderName} (${req.sender})`;
    document.getElementById('modalType').innerText = req.type;
    document.getElementById('modalDate').innerText = new Date(req.date).toLocaleString('vi-VN');

    // Hiển thị nội dung chi tiết dạng JSON đẹp hơn
    let contentHtml = '';
    for (const [key, value] of Object.entries(req.content)) {
        contentHtml += `<div><strong>${key}:</strong> ${value}</div>`;
    }
    document.getElementById('modalContent').innerHTML = contentHtml;

    // Ẩn/Hiện vùng xử lý dựa trên trạng thái
    const actionArea = document.getElementById('adminActionArea');
    const resultArea = document.getElementById('resultArea');

    if(req.status === 'Chờ duyệt') {
        actionArea.style.display = 'block';
        resultArea.style.display = 'none';
        document.getElementById('adminNote').value = '';
    } else {
        actionArea.style.display = 'none';
        resultArea.style.display = 'block';
        document.getElementById('resultStatus').innerText = req.status;
        document.getElementById('resultStatus').className = req.status === 'Đã duyệt' ? 'req-badge req-approved' : 'req-badge req-rejected';
        document.getElementById('resultNote').innerText = req.adminNote || 'Không có ghi chú';
    }

    document.getElementById('requestModal').style.display = 'flex';
}

function closeCitizenRequestModal() {
    document.getElementById('requestModal').style.display = 'none';
}

function processCitizenRequest(action) {
    const id = parseInt(document.getElementById('currentReqId').value);
    const note = document.getElementById('adminNote').value;
    const req = requestsData.find(r => r.id === id);

    if(action === 'Từ chối' && !note) {
        alert("Vui lòng nhập lý do từ chối vào ô Ghi chú!");
        return;
    }

    if(confirm(`Bạn có chắc muốn ${action} yêu cầu này?`)) {
        // Cập nhật dữ liệu (Giả lập)
        req.status = action;
        req.adminNote = note;
        
        alert("Đã xử lý thành công!");
        closeCitizenRequestModal();
        renderCitizenRequestTable(requestsData); // Re-render
    }
}

// Export global
window.initCitizenRequestManager = initCitizenRequestManager;
window.filterCitizenRequests = filterCitizenRequests;
window.refreshCitizenRequestData = () => { renderCitizenRequestTable(requestsData); };
window.openCitizenRequestDetail = openCitizenRequestDetail;
window.closeCitizenRequestModal = closeCitizenRequestModal;
window.processCitizenRequest = processCitizenRequest;