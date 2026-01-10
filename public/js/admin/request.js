/** FILE: js/admin/request.js **/

let allRequests = []; // Lưu dữ liệu gốc để filter local

// 1. Khởi tạo: Load dữ liệu từ API
async function initCitizenRequestManager() {
    try {
        const response = await fetch('/api/resident/admin/all');
        const res = await response.json();
        
        if (res.status === 'success') {
            allRequests = res.data;
            renderCitizenRequestTable(allRequests);
        }
    } catch (error) {
        console.error("Lỗi khi tải yêu cầu:", error);
    }
}

// 2. Render bảng (Khớp với tên cột SQL)
function renderCitizenRequestTable(data) {
    const tbody = document.getElementById('requestTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(req => {
        const row = document.createElement('tr');
        const dateStr = new Date(req.ngay_yeu_cau).toLocaleString('vi-VN');
        
        // CSS cho trạng thái
        let statusClass = 'req-pending';
        if (req.trang_thai === 'Đã duyệt') statusClass = 'req-approved';
        if (req.trang_thai === 'Từ chối') statusClass = 'req-rejected';

        // Tóm tắt nội dung từ JSONB
        const info = req.thong_tin_yeu_cau || {};
        let summary = req.loai_yeu_cau;
        if (info.field) summary = `Sửa ${info.field}: ${info.oldVal} → ${info.newVal}`;

        row.innerHTML = `
            <td><b>${req.nguoi_yeu_cau}</b><br><small>${req.sender_name}</small></td>
            <td>${req.loai_yeu_cau}</td>
            <td>${dateStr}</td>
            <td><div class="text-truncate" style="max-width: 250px;">${summary}</div></td>
            <td><span class="req-badge ${statusClass}">${req.trang_thai}</span></td>
            <td class="text-center">
                <button class="btn-view-req" onclick="openCitizenRequestDetail(${req.id})">
                    <i class="fas fa-eye"></i>
                </td>
        `;
        tbody.appendChild(row);
    });
}

// 3. Xử lý logic Duyệt/Từ chối qua API
window.processCitizenRequest = async function(action) {
    const id = document.getElementById('currentReqId').value;
    const note = document.getElementById('adminNote').value;

    if (action === 'Từ chối' && !note) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
    }

    if (!confirm(`Xác nhận ${action} yêu cầu này?`)) return;

    try {
        const response = await fetch(`/api/resident/admin/process/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action, note: note })
        });

        const res = await response.json();
        if (res.status === 'success') {
            alert(res.message);
            closeCitizenRequestModal();
            initCitizenRequestManager(); // Refresh bảng
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ");
    }
};

// 4. Mở chi tiết (Khớp tên cột SQL)
window.openCitizenRequestDetail = function(id) {
    const req = allRequests.find(r => r.id === id);
    if (!req) return;

    // Mapping các từ khóa kỹ thuật sang tiếng Việt
    const labelMap = {
        'lyDo': 'Lý do',
        'field': 'Trường thay đổi',
        'ghiChu': 'Ghi chú',
        'newVal': 'Giá trị mới',
        'oldVal': 'Giá trị cũ',
        'cccd': 'Số CCCD',
        'tungay': 'Từ ngày',
        'denngay': 'Đến ngày',
        'hoten': 'Họ và tên',
        'nghe_nghiep': 'Nghề nghiệp',
        'dia_chi': 'Địa chỉ'
    };

    // Mapping giá trị của trường "field" (nếu có)
    const fieldMap = {
        'hoten': 'Họ và tên',
        'nghe_nghiep': 'Nghề nghiệp',
        'dia_chi': 'Địa chỉ',
        'ngay_sinh': 'Ngày sinh'
    };

    document.getElementById('currentReqId').value = req.id;
    document.getElementById('modalSender').innerText = `${req.sender_name} (${req.nguoi_yeu_cau})`;
    document.getElementById('modalType').innerText = req.loai_yeu_cau;
    document.getElementById('modalDate').innerText = new Date(req.ngay_yeu_cau).toLocaleString('vi-VN');

    // Hiển thị nội dung chi tiết với nhãn tiếng Việt
    let contentHtml = '<div style="display: grid; gap: 8px;">';
    for (let [key, value] of Object.entries(req.thong_tin_yeu_cau || {})) {
        const label = labelMap[key] || key; // Nếu không có trong map thì dùng key gốc
        
        // Nếu là trường 'field', dịch giá trị bên trong nó
        if (key === 'field' && fieldMap[value]) {
            value = fieldMap[value];
        }

        contentHtml += `
            <div style="border-bottom: 1px solid #eee; padding-bottom: 4px;">
                <strong style="color: #555;">${label}:</strong> 
                <span style="margin-left: 5px;">${value}</span>
            </div>`;
    }
    contentHtml += '</div>';
    
    document.getElementById('modalContent').innerHTML = contentHtml;

    // Logic ẩn/hiện adminActionArea và resultArea giữ nguyên như cũ...
    const actionArea = document.getElementById('adminActionArea');
    const resultArea = document.getElementById('resultArea');

    if (req.trang_thai === 'Chờ duyệt') {
        actionArea.style.display = 'block';
        resultArea.style.display = 'none';
        document.getElementById('adminNote').value = '';
    } else {
        actionArea.style.display = 'none';
        resultArea.style.display = 'block';
        document.getElementById('resultStatus').innerText = req.trang_thai;
        document.getElementById('resultNote').innerText = req.ket_qua_duyet || 'Không có ghi chú';
    }

    document.getElementById('requestModal').style.display = 'flex';
};

// 5. Bộ lọc Local
window.filterCitizenRequests = function() {
    const term = document.getElementById('reqSearch').value.toLowerCase();
    const type = document.getElementById('reqTypeFilter').value;
    const status = document.getElementById('reqStatusFilter').value;

    const filtered = allRequests.filter(req => {
        const matchTerm = req.nguoi_yeu_cau.includes(term) || req.sender_name.toLowerCase().includes(term);
        const matchType = type === 'all' || req.loai_yeu_cau === type;
        const matchStatus = status === 'all' || req.trang_thai === status;
        return matchTerm && matchType && matchStatus;
    });
    renderCitizenRequestTable(filtered);
};

// Các hàm đóng/refresh khác...
window.initCitizenRequestManager = initCitizenRequestManager;
window.closeCitizenRequestModal = () => document.getElementById('requestModal').style.display = 'none';
window.refreshCitizenRequestData = initCitizenRequestManager;