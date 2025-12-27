// --- 1. KHỞI TẠO DỮ LIỆU NGƯỜI DÙNG ---
let userData = { cccd: "", hoten: "" };

try {
    const userStorage = localStorage.getItem('currentUser');
    if (userStorage) {
        const parsed = JSON.parse(userStorage);
        if (parsed && parsed.username) {
            userData.cccd = parsed.username;
        }
    }
} catch (e) {
    console.warn("Lỗi LocalStorage:", e);
}

// --- 2. HÀM XỬ LÝ GỬI FORM (HANDLE SUBMIT) ---
async function handleFormSubmit(event) {
    if(event) event.preventDefault();
    console.log("Đang chuẩn bị dữ liệu gửi đi...");

    const submitBtn = document.querySelector('#bookingForm .btn-submit');
    const oldText = submitBtn ? submitBtn.innerText : "Gửi";
    
    if(submitBtn) {
        submitBtn.innerText = "Đang gửi...";
        submitBtn.disabled = true;
    }

    try {
        // Helper lấy giá trị từ ID
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : "";
        };

        // --- VALIDATION TRƯỚC KHI GỬI ---
        const phongIdCheck = parseInt(getVal('place')) || 0;
        if (phongIdCheck === 0) {
            alert("Vui lòng chọn địa điểm!");
            // Mở lại nút bấm
            if(submitBtn) { submitBtn.innerText = oldText; submitBtn.disabled = false; }
            return;
        }

        const start = new Date(getVal('from'));
        const end = new Date(getVal('to'));
        if (end <= start) {
            alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
            if(submitBtn) { submitBtn.innerText = oldText; submitBtn.disabled = false; }
            return;
        }

        // --- TẠO PAYLOAD ĐÚNG YÊU CẦU CỦA BẠN ---
        const payload = {
            hoten: getVal('fullname'),        // hoten: fullname
            cccd: getVal('cccd'),             // cccd: cccd
            phone: getVal('numberphone'),     // phone: numberphone
            email: getVal('email'),           // email: email
            loai: getVal('type'),             // loai: type
            tenSuKien: getVal('event'),       // tenSuKien: eventName (ID là event)
            phongId: phongIdCheck,            // phongId: parseInt(place)
            lydo: getVal('reason'),           // lydo: reason
            batdau: getVal('from'),           // batdau: from
            ketthuc: getVal('to')             // ketthuc: to
        };

        console.log("Payload gửi đi:", payload);

        // --- GỬI API ---
        const response = await fetch('/api/nvh/submit-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Đăng ký thành công!");
            closeBookingModal();
            // Load lại lịch sử nếu cần
            if (userData.cccd) loadBookingHistory(userData.cccd);
        } else {
            const err = await response.json();
            alert("Lỗi server: " + (err.message || "Vui lòng kiểm tra lại thông tin"));
            console.error("Chi tiết lỗi:", err);
        }

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Không thể kết nối tới máy chủ.");
    } finally {
        if(submitBtn) {
            submitBtn.innerText = oldText;
            submitBtn.disabled = false;
        }
    }
}

// Gắn hàm vào window để HTML gọi được
window.handleFormSubmit = handleFormSubmit;

// --- 3. CÁC LOGIC KHÁC (LOAD TRANG, MODAL) ---
window.initNVHPage = async function() {
    console.log("Đang khởi tạo trang Nhà văn hóa...");
    
    // 1. Lấy thông tin User
    await initUserData();

    // 2. Tải lịch sử ngay lập tức
    if (userData.cccd) {
        console.log("Đang tải lịch sử cho CCCD:", userData.cccd);
        loadBookingHistory(userData.cccd);
    } else {
        console.log("Chưa có CCCD, không tải lịch sử.");
    }

    // 3. Gắn lại sự kiện đóng modal (vì DOM mới vừa được sinh ra)
    const modal = document.getElementById("bookingModal");
    window.onclick = function(event) {
        if (event.target == modal) closeBookingModal();
    }
};

// Vẫn giữ cái này để chạy nếu người dùng F5 trực tiếp tại trang (nếu có)
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem đang ở trang nào, nếu có bảng lịch sử thì chạy
    if(document.getElementById('history-table-body')){
        window.initNVHPage();
    }
});

async function initUserData() {
    if (userData.cccd) {
        const ten = await fetchHoTen(userData.cccd);
        if(ten) userData.hoten = ten;
    }
}

// Các hàm đóng mở Modal
window.openBookingModal = function() {
    const modal = document.getElementById("bookingModal");
    const form = document.getElementById("bookingForm");
    if (!modal) return;

    if (form) form.reset();
    fillUserData();
    modal.style.display = "flex";
    setDefaultDateTime();
}

window.closeBookingModal = function() {
    const modal = document.getElementById("bookingModal");
    if (modal) modal.style.display = "none";
}

function fillUserData() {
    const setVal = (id, val, lock) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val || "";
            if (lock && val) {
                el.setAttribute('readonly', true);
                el.style.backgroundColor = "#e9ecef";
            } else {
                el.removeAttribute('readonly');
                el.style.backgroundColor = "white";
            }
        }
    };
    // Điền CCCD và Họ tên
    setVal('cccd', userData.cccd, !!userData.cccd);
    setVal('fullname', userData.hoten, !!userData.hoten);
}

function setDefaultDateTime() {
    try {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const toISO = (d) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        
        const start = document.getElementById("from");
        const end = document.getElementById("to");
        
        tomorrow.setHours(8, 0, 0, 0);
        if(start) start.value = toISO(tomorrow);
        
        tomorrow.setHours(11, 0, 0, 0);
        if(end) end.value = toISO(tomorrow);
    } catch(e) {}
}

async function fetchHoTen(key) {
    if(!key) return "";
    try {
        const res = await fetch(`/api/hokhau/find-by-cccd/${key}`);
        if(res.ok) {
            const d = await res.json();
            return d.hoten;
        }
    } catch(e) {}
    return "";
}

async function loadBookingHistory(key) {
    if(!key) return;
    const tbody = document.getElementById('history-table-body');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Đang tải...</td></tr>';
    
    try {
        const res = await fetch(`/api/nvh/request/${key}`);
        const json = await res.json();
        if(res.ok && json.data && json.data.length > 0) {
            tbody.innerHTML = "";
            json.data.forEach(item => {
                const tr = document.createElement('tr');
                let cls = 'status-pending';
                if(item.TrangThai === 'Đã duyệt') cls = 'status-approved';
                if(item.TrangThai === 'Từ chối') cls = 'status-rejected';
                
                const t1 = new Date(item.Thoigian.tu).toLocaleString('vi-VN');
                const t2 = new Date(item.Thoigian.den).toLocaleTimeString('vi-VN');
                
                tr.innerHTML = `<td>${item.TenHD}</td><td>${item.Diadiem}</td><td>${t1} - ${t2}</td><td><span class="status-badge ${cls}">${item.TrangThai}</span></td><td>${item.GhiChu||''}</td>`;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Chưa có dữ liệu</td></tr>';
        }
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Lỗi tải dữ liệu</td></tr>';
    }
}