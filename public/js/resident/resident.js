// --- 1. HELPER: Định dạng ngày tháng ---
function formatDate(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Trả về ngày/tháng/năm
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return isoString;
    }
}

// --- 2. LOGIC GIAO DIỆN (MODAL & TABS) ---
function openRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'flex';
}

function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'none';
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

window.onclick = function(event) {
    var modal = document.getElementById('requestModal');
    if (event.target == modal) {
        closeRequestModal();
    }
}

// --- 3. LOGIC GỌI API (FETCHING) ---

// API 1: Lấy chi tiết hộ khẩu
async function fetchUserData(codeUser){
    try {
        const res = await fetch(`/api/hokhau/show/${codeUser}`);
        if(!res.ok){
            // Nếu lỗi 404 hoặc 500, ném lỗi để dừng quy trình
            throw new Error(`API Error: ${res.status}`);
        }
        return await res.json();
    }
    catch(err){
        console.error('Lỗi khi gọi API xem chi tiết:', err);
        return null; // Trả về null để xử lý hiển thị lỗi
    }
}

// API 2: Tìm mã hộ khẩu từ CCCD
async function fetchMaHK(cccd) {
    try{
        const res = await fetch(`/api/hokhau/find-by-cccd/${cccd}`);
        if(!res.ok){
            throw new Error(`API Error: ${res.status}`);
        }
        const data = await res.json();
        // Chỉ trả về mã hộ khẩu thực, không fallback
        return data.sohokhau; 
    }
    catch(err){
        console.error('Lỗi khi tìm mã hộ khẩu:', err);
        return null; 
    }
}

// --- 4. LOGIC HIỂN THỊ (RENDERING) ---
// Hàm này chỉ chạy khi CÓ dữ liệu thật
function renderResidentData(data, codeUser) {
    if (!data) return;

    // --- A. Render Thông tin chung ---
    // Gán trực tiếp dữ liệu, nếu null thì để trống hoặc hiện "---" (UI Placeholder)
    if(document.getElementById('soHoKhauID')) document.getElementById('soHoKhauID').innerText = codeUser;
    if(document.getElementById('valHoTen')) document.getElementById('valHoTen').innerText = data.HoTen || '';
    if(document.getElementById('valDiaChi')) document.getElementById('valDiaChi').innerText = data.DiaChi || '';
    if(document.getElementById('valNgayLap')) document.getElementById('valNgayLap').innerText = formatDate(data.NgayLap);
    if(document.getElementById('valGhiChu')) document.getElementById('valGhiChu').innerText = data.GhiChu || '';

    // --- B. Render Danh sách thành viên ---
    const tableThanhVien = document.getElementById('tableThanhVien');
    if (tableThanhVien) {
        const tbody = tableThanhVien.getElementsByTagName('tbody')[0];
        tbody.innerHTML = ''; // Xóa sạch dữ liệu cũ/mẫu trong HTML

        if (data.danhSachNhanKhau && data.danhSachNhanKhau.length > 0) {
            data.danhSachNhanKhau.forEach(tv => {
                // Xử lý hiển thị chức vụ
                let quanHeHTML = tv.QuanHeChuHo || '';
                if (quanHeHTML.toLowerCase().includes('chủ hộ')) {
                    quanHeHTML = `<span class="badge-role role-head">${quanHeHTML}</span>`;
                }

                // Xử lý màu trạng thái
                let trangThaiClass = 'status-normal';
                let trangThaiText = tv.TrangThai || '';
                if (trangThaiText.toLowerCase().includes('tạm vắng') || trangThaiText.toLowerCase().includes('chuyển đi')) {
                    trangThaiClass = 'status-temp';
                }

                const row = tbody.insertRow();
                row.innerHTML = `
                    <td><strong>${tv.HoTenTV || ''}</strong></td>
                    <td>${formatDate(tv.NgaySinh)}</td>
                    <td>${quanHeHTML}</td>
                    <td>${tv.CCCD || '-'}</td>
                    <td><span class="${trangThaiClass}">${trangThaiText}</span></td>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Không có thành viên nào</td></tr>';
        }
    }

    // --- C. Render Lịch sử ---
    if (data.lichSu) {
        // C1. Lịch sử Hộ Khẩu
        const tableHistoryHK = document.getElementById('tableLichSuHoKhau');
        if (tableHistoryHK) {
            const tbodyHK = tableHistoryHK.getElementsByTagName('tbody')[0];
            tbodyHK.innerHTML = ''; // Xóa sạch dữ liệu HTML tĩnh
            
            if (data.lichSu.hoKhau && data.lichSu.hoKhau.length > 0) {
                data.lichSu.hoKhau.forEach(item => {
                    const row = tbodyHK.insertRow();
                    row.innerHTML = `<td>${formatDate(item.ngayThayDoi)}</td><td>${item.noiDung || ''}</td>`;
                });
            } else {
                tbodyHK.innerHTML = '<tr><td colspan="2" style="text-align:center">Chưa có dữ liệu lịch sử</td></tr>';
            }
        }

        // C2. Lịch sử Nhân Khẩu
        const tableHistoryNK = document.getElementById('tableLichSuNhanKhau');
        if (tableHistoryNK) {
            const tbodyNK = tableHistoryNK.getElementsByTagName('tbody')[0];
            tbodyNK.innerHTML = ''; // Xóa sạch dữ liệu HTML tĩnh
            
            if (data.lichSu.nhanKhau && data.lichSu.nhanKhau.length > 0) {
                data.lichSu.nhanKhau.forEach(item => {
                    const row = tbodyNK.insertRow();
                    row.innerHTML = `
                        <td><strong>${item.hoTen || ''}</strong></td>
                        <td><span class="badge-move">${item.loaiBienDong || ''}</span></td>
                        <td>${formatDate(item.ngayBienDong)}</td>
                        <td>${item.noiDen || '-'}</td>
                        <td>${item.ghiChu || ''}</td>
                    `;
                });
            } else {
                tbodyNK.innerHTML = '<tr><td colspan="5" style="text-align:center">Chưa có biến động nhân khẩu</td></tr>';
            }
        }
    }
}

// --- 5. HÀM MAIN (KHỞI CHẠY) ---
async function renderResidentMain(){
    console.log("Đang tải dữ liệu thực...");
    
    // BƯỚC 1: Lấy thông tin đăng nhập
    const userJson = localStorage.getItem('currentUser');
    
    // Nếu không có user -> Dừng, không hiển thị gì cả
    if(!userJson){
        alert("Phiên đăng nhập hết hạn hoặc chưa đăng nhập.");
        // Có thể redirect về trang login nếu muốn: window.location.href = '/login.html';
        return;
    }

    const userObj = JSON.parse(userJson);
    const cccd = userObj.username; 

    // Nếu user không có CCCD -> Dừng
    if(!cccd){
        console.error("User object thiếu CCCD:", userObj);
        alert("Lỗi dữ liệu tài khoản (Thiếu CCCD).");
        return;
    }

    // BƯỚC 2: Gọi API tìm mã hộ khẩu thật
    const userCode = await fetchMaHK(cccd);
    
    // Nếu API lỗi hoặc không tìm thấy hộ -> Dừng
    if(!userCode) {
        alert("Không tìm thấy thông tin Hộ khẩu cho tài khoản này.");
        return;
    }

    // BƯỚC 3: Gọi API lấy chi tiết hộ khẩu thật
    const userData = await fetchUserData(userCode);

    // BƯỚC 4: Render
    // Chỉ render khi có userData thật
    if(userData){
        renderResidentData(userData, userCode);
    } else {
        alert("Lỗi tải dữ liệu chi tiết từ máy chủ.");
    }
}

// Export hàm ra window để dashboard.js gọi
window.renderResidentMain = renderResidentMain;