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
        
        let url = `/api/nvh/pending`;
        // Nếu có chọn ngày thì thêm params
        if (fromDate && toDate) {
            url += `?from=${fromDate}&to=${toDate}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Lỗi khi tải danh sách chờ');
        
        const data = await response.json();
        // Map dữ liệu API vào cấu trúc chung để render
        currentList = data.map(item => ({
            id: item.id,
            name: item.hoTen,
            sdt: item.dienThoai,
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
// API: Lấy danh sách lịch sử
// API: Lấy danh sách lịch sử
async function fetchHistoryList() {
    const tbody = document.getElementById('requestTableBody');
    if (!tbody) return;

    try {
        const fromDate = document.getElementById('fromDate')?.value;
        const toDate = document.getElementById('toDate')?.value;
        let url = `/api/nvh/history`;
        if (fromDate && toDate) url += `?from=${fromDate}&to=${toDate}`;
        
        const response = await fetch(url);
        const resData = await response.json();
        
        // Xử lý payload (vì payload của bạn là một mảng trực tiếp)
        let rawList = Array.isArray(resData) ? resData : (resData.data || []);

        currentList = rawList.map(item => {
            // --- LOGIC CHUẨN HÓA TRẠNG THÁI ---
            // Mặc định là chờ duyệt
            let mappedStatus = 'pending'; 
            
            // Kiểm tra chuỗi tiếng Việt từ API
            if (item.trangThai === 'Từ chối') {
                mappedStatus = 'reject';
            } else if (item.trangThai === 'Đã duyệt' || item.trangThai === 'Đồng ý') {
                mappedStatus = 'approved';
            }

            return {
                id: item.id,
                name: item.hoTen,
                sdt: item.dienThoai,
                from: item.thoiGian.tu, // Payload của bạn đã lồng thoiGian
                to: item.thoiGian.den,
                type: item.loaiHinh,
                reason: item.tenHD,
                status: mappedStatus // <-- LƯU Ý QUAN TRỌNG: Dùng biến đã chuẩn hóa
            };
        });

        renderRequestTable(currentList);
    } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
    }
}
// API: Lấy chi tiết đơn lịch sử
async function fetchHistoryDetail(id) {
    try {
        const response = await fetch(`/api/nvh/history/${id}`);
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
    const response = await fetch(`/api/nvh/pending/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return response;
}

// API: Từ chối đơn
async function postReject(payload) {
    const response = await fetch(`/api/nvh/pending/reject`, {
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
// Chuyển đổi giữa Tab "Chờ duyệt" và "Lịch sử"
function filterRequests(type) {
    currentTab = type;
    const searchInput = document.getElementById('keyword');
    if (searchInput) searchInput.value = ''; // Xoá ô tìm kiếm khi đổi tab
    // 1. Cập nhật giao diện nút bấm (Tab)
    // Giả sử HTML của bạn có 2 nút với class .tab-btn
    const buttons = document.querySelectorAll('.tab-btn');
    if (buttons.length >= 2) {
        buttons.forEach(btn => btn.classList.remove('active'));
        if (type === 'pending') {
            buttons[0].classList.add('active'); // Nút đầu tiên là Chờ duyệt
        } else {
            buttons[1].classList.add('active'); // Nút thứ hai là Lịch sử
        }
    }

    // 2. Ẩn/Hiện bộ lọc ngày (Tuỳ chọn: thường lịch sử mới cần lọc ngày kỹ)
    const filterToolbar = document.querySelector('.filter-toolbar');
    if (filterToolbar) {
        // Ví dụ: Luôn hiện hoặc chỉ hiện khi cần
        filterToolbar.style.display = 'flex'; 
    }

    // 3. Gọi API tương ứng
    if (type === 'pending') {
        fetchPendingList();
    } else {
        fetchHistoryList();
    }
}

// Nút lọc dữ liệu (cho tab Pending)
function filterByRange() {
    // Kiểm tra đầu vào cơ bản
    const from = document.getElementById('fromDate').value;
    const to = document.getElementById('toDate').value;
    
    if ((from && !to) || (!from && to)) {
        alert("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc!");
        return;
    }

    // Tự động gọi hàm fetch tương ứng với Tab đang mở
    if (currentTab === 'pending') {
        fetchPendingList();
    } else {
        fetchHistoryList();
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
            actionBtn = `<button class="btn-sm btn-info" onclick="openNVHDetailModal(${item.id})"><i class="fas fa-history"></i> Chi tiết</button>`;
        }
        const isRestricted = isToPho();

    if (currentTab === 'pending') {
        if (isRestricted) {
             // Tổ phó chỉ xem, không hiện nút Duyệt
             actionBtn = `<button class="btn-sm btn-secondary" onclick="openNVHDetailModal(${item.id})"><i class="fas fa-eye"></i> Xem chi tiết</button>`;
        } else {
             // Admin thì hiện nút Duyệt/Xem
             actionBtn = `<button class="btn-sm btn-info" onclick="openNVHDetailModal(${item.id})"><i class="fas fa-eye"></i> Duyệt/Xem</button>`;
        }
    } else {
        // Tab lịch sử ai cũng xem được
        actionBtn = `<button class="btn-sm btn-info" onclick="openNVHDetailModal(${item.id})"><i class="fas fa-history"></i> Chi tiết</button>`;
    }

        row.innerHTML = `
            <td>#${item.id}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.sdt || '---'}</td>
            <td>
                ${formatTime(item.from)}<br>
                <i class="fas fa-arrow-down"></i><br>
                ${formatTime(item.to)}
            </td>
            <td><span class="badge badge-primary">${item.type || 'HĐ chung'}</span></td>
            <td>${item.reason}</td>
            <td class="text-center">
                ${(() => {
                    if (item.status === 'reject') {
                        // Dùng class .status-fail (Màu đỏ)
                        return '<span class="my-badge status-fail">Đã từ chối</span>';
                    } 
                    else if (item.status === 'approved') {
                        // Dùng class .status-ok (Màu xanh)
                        return '<span class="my-badge status-ok">Đã duyệt</span>';
                    } 
                    else {
                        // Dùng class .status-wait (Màu vàng)
                        return '<span class="my-badge status-wait">Chờ duyệt</span>';
                    }
                })()}
            </td>
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
// Xử lý khi click vào nút Xem chi tiết / Duyệt
async function openNVHDetailModal(id) {
    currentSelectedId = id;

    // 1. Luôn gọi API lấy chi tiết để có đầy đủ dữ liệu (CCCD, Email, Địa điểm...)
    // Endpoint này dùng model getHistoryDetail nên trả về được cả đơn chờ duyệt.
    const data = await fetchHistoryDetail(id);

    if (!data) {
        alert("Không thể tải chi tiết đơn.");
        return;
    }

    // 2. Binding dữ liệu chung vào các thẻ HTML
    document.getElementById('detailId').innerText = id;
    document.getElementById('detailName').innerText = data.hoTen;
    document.getElementById('detailCCCD').innerText = data.cccd || "---"; // Trường mới
    document.getElementById('detailPhone').innerText = data.sdt || "---";
    document.getElementById('detailEmail').innerText = data.email || "---";
    document.getElementById('detailCode').innerText = data.tenHD;     // Tên sự kiện
    document.getElementById('detailType').innerText = data.loaiHinh;  // Loại hình
    document.getElementById('detailReason').innerText = data.lyDo || "---"; // Nội dung/Lý do

    // Format thời gian hiển thị (dd/mm/yyyy hh:mm)
    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    document.getElementById('detailFrom').innerText = formatDateTime(data.thoigian.tu);
    document.getElementById('detailTo').innerText = formatDateTime(data.thoigian.den);

    // 3. Xử lý Ẩn/Hiện thông tin theo Trạng thái đơn (Logic quan trọng)
    
    // Kiểm tra: Nếu đơn đang ở tab Chờ duyệt
    if (currentTab === 'pending') {
        // --- TRƯỜNG HỢP: CHỜ DUYỆT ---
        
        // Hiện "Địa điểm mong muốn"
        const rowReq = document.getElementById('rowRequestedPlace');
        if(rowReq) {
            rowReq.style.display = 'flex';
            document.getElementById('detailRequestedPlace').innerText = data.diaDiemMongMuon || "---";
        }

        // Ẩn "Phòng được duyệt" và "Phí" (vì chưa có)
        if(document.getElementById('rowAssignedRoom')) document.getElementById('rowAssignedRoom').style.display = 'none';
        if(document.getElementById('rowFee')) document.getElementById('rowFee').style.display = 'none';

        // Hiện nút hành động (Duyệt/Từ chối)
        if(document.getElementById('detailActions')) document.getElementById('detailActions').style.display = 'flex';
    
    } else {
        // --- TRƯỜNG HỢP: LỊCH SỬ (Đã duyệt hoặc Từ chối) ---
        
        // Kiểm tra xem đơn này là Đã duyệt (có phòng) hay Từ chối
        const isApproved = data.phong && !data.phong.includes("Chưa xếp phòng") && !data.phong.includes("Từ chối");

        if (isApproved) {
            // ĐÃ DUYỆT:
            // Ẩn "Địa điểm mong muốn" (để gọn, hoặc hiện tùy ý)
            if(document.getElementById('rowRequestedPlace')) document.getElementById('rowRequestedPlace').style.display = 'none';
            
            // Hiện "Phòng được duyệt"
            if(document.getElementById('rowAssignedRoom')) {
                document.getElementById('rowAssignedRoom').style.display = 'flex';
                document.getElementById('detailAssignedRoom').innerText = data.phong;
            }

            // Hiện "Phí"
            if(document.getElementById('rowFee')) {
                document.getElementById('rowFee').style.display = 'flex';
                document.getElementById('detailFee').innerText = data.phi;
            }
        } else {
            // TỪ CHỐI:
            // Hiện lại địa điểm mong muốn ban đầu
            if(document.getElementById('rowRequestedPlace')) {
                document.getElementById('rowRequestedPlace').style.display = 'flex';
                document.getElementById('detailRequestedPlace').innerText = data.diaDiemMongMuon || "---";
            }
            // Ẩn các trường kết quả
            if(document.getElementById('rowAssignedRoom')) document.getElementById('rowAssignedRoom').style.display = 'none';
            if(document.getElementById('rowFee')) document.getElementById('rowFee').style.display = 'none';
        }

        // Ẩn nút hành động (chỉ xem lịch sử)
        if(document.getElementById('detailActions')) document.getElementById('detailActions').style.display = 'none';
    }

    // Cuối cùng: Mở Modal
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
    const roomId = roomSelect.value;

    if (roomId === "") {
        alert("Vui lòng chọn phòng phân công!");
        return;
    }

    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    // Lấy ID cán bộ từ localStorage, nếu không có thì fallback về 1
    const approverId = (currentUser && currentUser.canboId) ? currentUser.canboId : 1;

    const payload = {
        id: currentSelectedId,
        phi: parseInt(fee),
        trangthai: "approved",
        canbo: approverId, // ID cán bộ 
        phong: parseInt(roomId)
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
        console.error(e);
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
    // 1. Mặc định load tab Chờ duyệt
    fetchPendingList();

    // 2. Gắn sự kiện gõ phím cho ô tìm kiếm
    const searchInput = document.getElementById('keyword');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchRequests);
    }
    
    // 3. Gắn sự kiện click cho icon kính lúp (nếu muốn)
    const searchIcon = document.querySelector('.search-group .search-icon');
    if(searchIcon) {
        searchIcon.addEventListener('click', searchRequests);
    }
});

// Hàm bỏ dấu tiếng Việt để tìm kiếm chính xác hơn
function removeVietnameseTones(str) {
    if (!str) return "";
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}

// Hàm tìm kiếm (Lọc trên dữ liệu đã tải)
function searchRequests() {
    const input = document.getElementById('keyword');
    const rawKeyword = input.value.trim().toLowerCase();
    const keywordNoTone = removeVietnameseTones(rawKeyword); // Từ khóa không dấu

    // Nếu ô tìm kiếm rỗng -> Hiển thị lại toàn bộ danh sách gốc
    if (!rawKeyword) {
        renderRequestTable(currentList);
        return;
    }

    // Lọc dữ liệu từ currentList (Biến này chứa data của tab đang mở)
    const filteredData = currentList.filter(item => {
        // 1. Kiểm tra ID (chuyển về chuỗi)
        const idMatch = item.id.toString().includes(rawKeyword);

        // 2. Kiểm tra Số điện thoại
        const phoneMatch = (item.sdt || "").includes(rawKeyword);

        // 3. Kiểm tra Tên (Bỏ dấu để so sánh tương đối)
        const nameNoTone = removeVietnameseTones(item.name || "");
        const nameMatch = nameNoTone.includes(keywordNoTone);

        // Trả về true nếu khớp bất kỳ điều kiện nào
        return idMatch || phoneMatch || nameMatch;
    });

    // Render lại bảng với dữ liệu đã lọc (Không gán đè vào currentList để tránh mất data gốc)
    renderRequestTable(filteredData);
}

document.addEventListener('DOMContentLoaded', () => {
    if (isToPho()) {
        // Danh sách các selector của nút Thêm Mới, Đăng ký...
        const restrictedSelectors = [
            '.btn-success[onclick*="openModal"]', // Các nút Thêm màu xanh
            '.btn-warning[onclick*="openManageResidence"]', // Nút Quản lý cư trú
            '.btn-warning[onclick*="openModal"]' // Các nút màu vàng khác
        ];

        restrictedSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Kiểm tra kỹ hơn nội dung text để tránh ẩn nhầm
                const text = el.innerText.toLowerCase();
                if (text.includes('thêm') || text.includes('đăng ký') || text.includes('quản lý')) {
                    el.style.display = 'none';
                }
            });
        });
    }
});