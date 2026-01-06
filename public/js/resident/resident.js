/** FILE: resident.js - ĐÃ SỬA LỖI **/

// 1. Đưa hàm formatDate lên đầu để tránh lỗi ReferenceError
function formatDate(dateString) {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN');
}

let globalMembers = [];
let currentUserCCCD = '';
let isHouseholdHead = false;

// --- PHẦN THÊM MỚI: Hàm khởi tạo chính (Entry Point) ---
window.renderResidentMain = async function() {
    console.log("Đang khởi tạo trang Resident...");

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        alert("Vui lòng đăng nhập lại!");
        window.location.href = '../../login.html';
        return;
    }
    const user = JSON.parse(userStr);
    const cccd = user.username; 

    try {
        // Gọi API lấy thông tin
        const response = await fetch(`/api/resident/hokhau/detail?cccd=${cccd}`); 
        
        if (response.ok) {
            const data = await response.json();
            renderResidentData(data, cccd);
        } else {
            console.error("Lỗi API:", response.statusText);
            document.getElementById('view-household').innerHTML = `<p style="color:red; padding:20px">Không tải được dữ liệu (Lỗi ${response.status}).</p>`;
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
    }
};

function renderResidentData(data, codeUser) {
    if (!data) return;
    
    globalMembers = data.danhSachNhanKhau || [];
    
    // Lấy CCCD người dùng hiện tại
    const userJson = localStorage.getItem('currentUser');
    const userObj = JSON.parse(userJson);
    currentUserCCCD = userObj.username;

    // --- BƯỚC 1: XÁC ĐỊNH VAI TRÒ ---
    const myProfile = globalMembers.find(m => m.CCCD === currentUserCCCD);
    
    // Logic xác định chủ hộ
    if (myProfile && myProfile.QuanHeChuHo === 'Chủ hộ') {
        isHouseholdHead = true;
    } else {
        isHouseholdHead = false;
    }

    // --- BƯỚC 2: RENDER GIAO DIỆN ---
    if (isHouseholdHead) {
        // === VIEW CHỦ HỘ ===
        document.getElementById('view-household').style.display = 'block';
        document.getElementById('view-individual').style.display = 'none';

        document.getElementById('soHoKhauID').innerText = codeUser;
        document.getElementById('valHoTen').innerText = data.HoTen || '';
        document.getElementById('valDiaChi').innerText = data.DiaChi || '';
        document.getElementById('valNgayLap').innerText = formatDate(data.NgayLap);

        // Render bảng thành viên
        const tbody = document.getElementById('tableThanhVien').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        // --- Trong file resident.js ---
// Thay thế đoạn render bảng cũ bằng đoạn này:

globalMembers.forEach(tv => {
    const row = tbody.insertRow();
    
    // Xử lý Badge (Màu sắc) cho Quan hệ và Trạng thái
    let roleClass = tv.QuanHeChuHo === 'Chủ hộ' ? 'badge-role-head' : 'badge-role-member';
    
    let statusClass = 'badge-status-active'; // Mặc định Thường trú
    if (tv.TrangThai === 'Tạm trú') statusClass = 'badge-status-temp';
    else if (tv.TrangThai === 'Qua đời' || tv.TrangThai === 'Chuyển đi') statusClass = 'badge-status-leave';

    // HTML cho hàng
    row.innerHTML = `
        <td><span style="font-weight: 600; color: #2c3e50;">${tv.HoTenTV}</span></td>
        <td>${formatDate(tv.NgaySinh)}</td>
        
        <td><span class="badge ${roleClass}">${tv.QuanHeChuHo}</span></td>
        
        <td><span class="badge ${statusClass}">${tv.TrangThai}</span></td>
        
        <td>
            <button class="btn-action-small btn-view" onclick="viewMemberDetail('${tv.id}')">
                <i class="fas fa-eye"></i> Xem
            </button>
            <button class="btn-action-small btn-edit" onclick="openRequestModal('tabNhanKhau', '${tv.CCCD}')">
                <i class="fas fa-pen"></i> Sửa
            </button>
        </td>
    `;
});
        
        // Load lịch sử yêu cầu chung
        loadRequestHistory('requestHistoryList');

        // [MỚI] Render Lịch sử biến động cho Chủ hộ (Xem toàn bộ)
        renderHistoryTable(data, 'tableLichSuHoKhau');

    } else {
        // === VIEW CÁ NHÂN ===
        document.getElementById('view-household').style.display = 'none';
        document.getElementById('view-individual').style.display = 'block';

        if(myProfile) {
            document.getElementById('indHoTen').innerText = myProfile.HoTenTV;
            document.getElementById('indNgaySinh').innerText = formatDate(myProfile.NgaySinh);
            document.getElementById('indCCCD').innerText = myProfile.CCCD;
            document.getElementById('indGioiTinh').innerText = myProfile.GioiTinh || '--'; 
            document.getElementById('indDanToc').innerText = myProfile.DanToc || 'Kinh';
            document.getElementById('indQuanHe').innerText = myProfile.QuanHeChuHo;
            document.getElementById('indTrangThai').innerText = myProfile.TrangThai;
        }

        // Render Lịch sử biến động cho Cá nhân
        renderHistoryTable(data, 'tableLichSuCaNhan');
        
        // Load lịch sử yêu cầu cá nhân
        loadRequestHistory('indRequestHistory');
    }
}

// --- HÀM RENDER LỊCH SỬ CHUNG (Dùng cho cả 2 view) ---
// --- HÀM RENDER LỊCH SỬ CHUNG (Đã sửa logic lọc quyền xem) ---
function renderHistoryTable(data, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return; 
    
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    let mergedHistory = [];

    // 1. LẤY LỊCH SỬ CỦA THÀNH VIÊN
    if (data.lichSu && data.lichSu.nhanKhau) {
        let listNhanKhau = data.lichSu.nhanKhau;

        // === [LOGIC MỚI] ===
        // Nếu không phải chủ hộ, lọc chỉ lấy lịch sử của chính mình
        if (!isHouseholdHead) {
            // LƯU Ý: Đảm bảo API trả về object lịch sử có trường 'cccd' để so sánh
            listNhanKhau = listNhanKhau.filter(h => h.cccd === currentUserCCCD);
        }
        // ===================

        const allMembersHistory = listNhanKhau.map(h => {
            let detail = h.ghiChu || '';
            if (h.noiDen) detail += ` - Chuyển đến: ${h.noiDen}`;
            
            return {
                ngay: h.ngayThayDoi, 
                loai: h.loaiBienDong,
                noiDung: `<span style="font-weight:600; color:#2c3e50">[${h.hoTen}]</span> ${detail || '-'}`, 
                isHoKhau: false
            };
        });
        mergedHistory = mergedHistory.concat(allMembersHistory);
    }

    // 2. LẤY LỊCH SỬ HỘ KHẨU
    // === [LOGIC MỚI] ===
    // Chỉ hiển thị lịch sử biến động hộ khẩu nếy là Chủ hộ
    if (isHouseholdHead && data.lichSu && data.lichSu.hoKhau) {
        const householdMapped = data.lichSu.hoKhau.map(h => ({
            ngay: h.ngayThayDoi,
            loai: 'Biến động Hộ khẩu',
            noiDung: h.noiDung,
            isHoKhau: true
        }));
        mergedHistory = mergedHistory.concat(householdMapped);
    }

    // 3. SẮP XẾP & RENDER
    if (mergedHistory.length > 0) {
        mergedHistory.sort((a, b) => new Date(b.ngay) - new Date(a.ngay));

        mergedHistory.forEach(h => {
            const row = tbody.insertRow();
            const typeStyle = h.isHoKhau 
                ? 'color:#d63384; font-weight:bold' 
                : 'color:#007bff; font-weight:500';
                
            row.innerHTML = `
                <td style="white-space:nowrap; color:#666">${formatDate(h.ngay)}</td>
                <td><span style="${typeStyle}">${h.loai}</span></td>
                <td>${h.noiDung}</td>
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#999; padding: 15px;">Chưa có biến động nào liên quan</td></tr>';
    }
}

// --- LOGIC MODAL & TABS (Giữ nguyên logic cũ của bạn) ---
function openRequestModal(defaultTabId, targetCCCD = null) {
    const modal = document.getElementById('requestModal');
    if(modal) modal.style.display = 'flex';

    if(defaultTabId) {
        const tabBtn = document.querySelector(`.tab-link[onclick*="${defaultTabId}"]`);
        if(tabBtn) tabBtn.click();
    }
    
    populateMemberSelects(targetCCCD);

    // Tự động điền Mã Hộ Khẩu nếu đang xem View Hộ Khẩu
    const currentView = document.getElementById('view-household');
    if (currentView && currentView.style.display !== 'none') {
        const currentMaHK = document.getElementById('soHoKhauID')?.innerText;
        const inpMaHK = document.getElementById('ttMaHoKhau');
        if (inpMaHK && currentMaHK && currentMaHK !== 'Loading...') {
            inpMaHK.value = currentMaHK;
            loadDiaChiTamTru(); 
        }
    }
}

function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if(modal) modal.style.display = 'none';
}

function populateMemberSelects(preSelectCCCD) {
    const nkSelect = document.getElementById('nkSelectMember');
    if(!nkSelect) return;
    nkSelect.innerHTML = '';
    
    let listToShow = isHouseholdHead ? globalMembers : globalMembers.filter(m => m.CCCD === currentUserCCCD);
    
    listToShow.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.CCCD;
        opt.text = `${m.HoTenTV} (${m.QuanHeChuHo})`;
        if(preSelectCCCD && m.CCCD === preSelectCCCD) opt.selected = true;
        nkSelect.appendChild(opt);
    });

    const tvSelect = document.getElementById('tvSelectMember');
    if(tvSelect) {
        tvSelect.innerHTML = '';
        const livingMembers = listToShow.filter(m => m.TrangThai !== 'Qua đời' && m.TrangThai !== 'Chuyển đi');
        livingMembers.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.CCCD;
            opt.text = m.HoTenTV;
            tvSelect.appendChild(opt);
        });
    }
    updateOldValuePlaceholder();
}

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function updateOldValuePlaceholder() {
    const nkSelect = document.getElementById('nkSelectMember');
    if(!nkSelect) return;
    
    const cccd = nkSelect.value;
    const field = document.getElementById('nkField').value;
    const member = globalMembers.find(m => m.CCCD === cccd);
    const inp = document.getElementById('nkOldVal');
    
    if(!member) { inp.value = ''; return; }

    if(field === 'hoten') inp.value = member.HoTenTV;
    else if(field === 'ngaysinh') inp.value = formatDate(member.NgaySinh);
    else inp.value = 'Chưa có data';
}

// Logic load lịch sử yêu cầu (Fake data - Bạn cần thay bằng API thật sau)
function formatRequestDetail(jsonInfo) {
    if (!jsonInfo) return '-';
    
    // Postgres trả về JSON object trực tiếp, không cần parse nếu dùng thư viện 'pg'
    // Nhưng để chắc chắn, ta kiểm tra loại dữ liệu
    let info = jsonInfo;
    if (typeof info === 'string') {
        try { info = JSON.parse(info); } catch (e) { return info; }
    }

    let html = '';
    // Hiển thị các trường thông dụng
    if (info.lyDo) html += `<div><strong>Lý do:</strong> ${info.lyDo}</div>`;
    if (info.ghiChu) html += `<div><em>Ghi chú: ${info.ghiChu}</em></div>`;
    
    // Hiển thị thay đổi (nếu có trường oldVal/newVal)
    if (info.oldVal || info.newVal) {
        html += `<div style="font-size: 0.9em; color: #555; margin-top:4px;">
                    ${info.field ? `<b>${info.field}:</b> ` : ''} 
                    ${info.oldVal || '(Trống)'} <i class="fas fa-arrow-right"></i> <b>${info.newVal}</b>
                 </div>`;
    }
    
    // Fallback nếu không có các trường trên
    if (html === '') html = JSON.stringify(info).substring(0, 50) + '...';

    return html;
}

// --- HÀM CHÍNH: LOAD LỊCH SỬ ---
// --- THAY THẾ HÀM loadRequestHistory TRONG resident.js ---

async function loadRequestHistory(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Hiển thị trạng thái đang tải
    container.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">Đang tải dữ liệu...</div>';

    try {
        if (!currentUserCCCD) {
            container.innerHTML = '<div style="color:red; text-align:center;">Lỗi: Chưa đăng nhập</div>';
            return;
        }

        // Gọi API
        const response = await fetch(`/api/resident/requests/history/${currentUserCCCD}`);
        
        if (response.ok) {
            const requests = await response.json();

            if (!requests || requests.length === 0) {
                container.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">Bạn chưa gửi yêu cầu nào.</div>';
                return;
            }

            // Xóa nội dung cũ (loading)
            container.innerHTML = '';

            // Render từng yêu cầu thành 1 thẻ Card
            requests.forEach(req => {
                // Xử lý class màu sắc cho trạng thái
                let statusClass = 'status-cho-duyet';
                if (req.trang_thai === 'Đã duyệt') statusClass = 'status-da-duyet';
                else if (req.trang_thai === 'Từ chối') statusClass = 'status-tu-choi';

                // Format ngày giờ
                const timeString = new Date(req.ngay_yeu_cau).toLocaleDateString('vi-VN') + ' ' + 
                                   new Date(req.ngay_yeu_cau).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                
                // Format nội dung chi tiết (dùng hàm cũ của bạn)
                const detailHtml = formatRequestDetail(req.thong_tin_yeu_cau);

                // Tạo chuỗi HTML cho Card
                const cardHtml = `
                    <div class="request-card">
                        <div class="req-header">
                            <span class="req-type">${req.loai_yeu_cau}</span>
                            <span class="req-date"><i class="far fa-clock"></i> ${timeString}</span>
                        </div>
                        <div class="req-body">
                            ${detailHtml}
                        </div>
                        <div class="req-footer">
                            <span class="badge-status ${statusClass}">${req.trang_thai}</span>
                            ${req.ket_qua_duyet ? `<div style="margin-top:5px; font-size:0.8rem; color:#d63384">Phản hồi: ${req.ket_qua_duyet}</div>` : ''}
                        </div>
                    </div>
                `;

                // Chèn vào container
                container.innerHTML += cardHtml;
            });

        } else {
            container.innerHTML = `<div style="color:red; text-align:center;">Lỗi tải dữ liệu (${response.status})</div>`;
        }
    } catch (error) {
        console.error("Connection Error:", error);
        container.innerHTML = '<div style="color:red; text-align:center;">Lỗi kết nối server</div>';
    }
}

async function loadDiaChiTamTru() {
    const inputMaHK = document.getElementById('ttMaHoKhau');
    const inputDiaChi = document.getElementById('ttDiaChiHienThi');
    
    const maHK = inputMaHK.value.trim();
    if (!maHK) {
        inputDiaChi.value = "";
        return;
    }

    inputDiaChi.value = "Đang tìm kiếm...";
    inputDiaChi.style.color = "#999";

    try {
        const res = await fetch(`/api/hokhau/detail/${maHK}`); // Đảm bảo route này đúng
        if (res.ok) {
            const data = await res.json();
            if (data && data.DiaChi) {
                inputDiaChi.value = data.DiaChi;
                inputDiaChi.style.color = "#009688";
            } else {
                inputDiaChi.value = "Không tìm thấy địa chỉ";
                inputDiaChi.style.color = "red";
            }
        } else {
            inputDiaChi.value = "Mã hộ khẩu không tồn tại";
            inputDiaChi.style.color = "red";
        }
    } catch (err) {
        console.error(err);
        inputDiaChi.value = "Lỗi kết nối server";
    }
}

// --- File: resident.js ---

async function viewMemberDetail(cccd) {
    const modal = document.getElementById('modalViewDetail');
    if(!modal) return;

    // Hiển thị modal và loading
    modal.style.display = 'flex';
    document.getElementById('viewHoTen').innerText = "Đang tải...";

    try {
        // Gọi API Backend
        const res = await fetch(`/api/nhankhau/detail/${cccd}`);
        
        if(res.ok) {
            const info = await res.json();
            
            // --- CẬP NHẬT MAPPING DỮ LIỆU KHỚP VỚI JSON CỦA BẠN ---
            
            document.getElementById('viewHoTen').innerText = info.hoTen || '--';
            document.getElementById('viewBiDanh').innerText = info.biDanh || 'Không';
            document.getElementById('viewNgaySinh').innerText = formatDate(info.ngaySinh);
            document.getElementById('viewGioiTinh').innerText = info.gioiTinh || '--';
            document.getElementById('viewNguyenQuan').innerText = info.nguyenQuan || '--';
            document.getElementById('viewDanToc').innerText = info.danToc || '--';
            document.getElementById('viewTonGiao').innerText = info.tonGiao || 'Không';
            document.getElementById('viewCCCD').innerText = info.cccd || '--';
            
            // Sửa key: ngayCap (Thay vì ngaycapcccd)
            document.getElementById('viewNgayCap').innerText = formatDate(info.ngayCap);
            
            // Sửa key: noiCap (Thay vì noicapcccd)
            document.getElementById('viewNoiCap').innerText = info.noiCap || '--';
            
            // Sửa key: ngheNghiep (camelCase)
            document.getElementById('viewNgheNghiep').innerText = info.ngheNghiep || 'Chưa cập nhật';
            
            // Sửa key: noiLamViec (camelCase)
            document.getElementById('viewNoiLamViec').innerText = info.noiLamViec || 'Chưa cập nhật';
            
            // Lưu ý: JSON bạn gửi chưa có 'ngayDKTT' và 'diaChiCu'
            // Mình để mặc định là '--' để tránh lỗi undefined
            
        } else {
            alert("Không tìm thấy thông tin chi tiết!");
            closeDetailModal();
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối server");
        closeDetailModal();
    }
}

function closeDetailModal() {
    const modal = document.getElementById('modalViewDetail');
    if(modal) modal.style.display = 'none';
}
// --- THAY THẾ TOÀN BỘ HÀM submitForm TRONG resident.js BẰNG CODE NÀY ---

async function submitForm(formId) {
    // 1. Kiểm tra người dùng
    if (!currentUserCCCD) {
        alert("Lỗi phiên đăng nhập: Không tìm thấy CCCD người dùng.");
        return;
    }

    // 2. Lấy Form và Nút bấm để xử lý UI
    const form = document.getElementById(formId);
    if (!form) return console.error("Không tìm thấy form:", formId);

    const btn = form.querySelector('button'); 
    const originalText = btn.innerText;
    btn.innerText = "Đang gửi...";
    btn.disabled = true;

    let url = '';
    let bodyData = {};

    try {
        // --- XỬ LÝ DỮ LIỆU TỪNG FORM ---
        
        // CASE 1: SỬA HỘ KHẨU
        if (formId === 'formHoKhau') {
            const maHK = document.getElementById('soHoKhauID').innerText;
            const reason = form.querySelector('textarea').value; 
            
            if (maHK === 'Loading...') throw new Error("Chưa tải được Mã Hộ Khẩu");
            if (!reason) throw new Error("Vui lòng nhập lý do!");

            url = `/api/resident/hokhau/${maHK}`;
            
            // Cấu trúc khớp với Controller requestEditHoKhau
            bodyData = {
                senderCCCD: currentUserCCCD,  // -> nguoiYeuCau
                status: 'Chờ duyệt',          // [SỬA] Phải là string, không được để true/false
                data: {                       // -> thongTin (JSONB)
                    field: document.getElementById('hkField').value,
                    oldVal: document.getElementById('hkOldVal').value,
                    newVal: document.getElementById('hkNewVal').value,
                    lyDo: reason,
                    ghiChu: "Yêu cầu sửa Hộ khẩu"
                }
            };
        } 
        // CASE 2: SỬA NHÂN KHẨU
        else if (formId === 'formNhanKhau') {
            const targetCCCD = document.getElementById('nkSelectMember').value;
            const reasonInput = document.getElementById('nkReason');
            const reason = reasonInput ? reasonInput.value : "Cập nhật thông tin";

            if (!document.getElementById('nkNewVal').value) throw new Error("Vui lòng nhập giá trị mới");

            url = `/api/resident/nhankhau/${targetCCCD}`;
            
            // Cấu trúc khớp với Controller requestEditNhanKhau
            bodyData = {
                senderCCCD: currentUserCCCD,
                status: 'Chờ duyệt',          // [THÊM] Để đồng bộ
                data: {
                    field: document.getElementById('nkField').value,
                    oldVal: document.getElementById('nkOldVal').value,
                    newVal: document.getElementById('nkNewVal').value,
                    lyDo: reason,
                    ghiChu: "Yêu cầu sửa Nhân khẩu"
                }
            };
        } 
        // CASE 3: TẠM TRÚ (Controller requestTamTru lấy id từ URL params, data từ body)
        else if (formId === 'formTamTru') {
            const formData = new FormData(form);
            bodyData = Object.fromEntries(formData.entries());
            
            if (!bodyData.cccd || !bodyData.tungay) throw new Error("Thiếu thông tin bắt buộc");
            
            // Lưu ý: Controller TamTru dùng req.params.id làm nguoiYeuCau
            url = `/api/resident/tamtru/${currentUserCCCD}`;
        } 
        // CASE 4: TẠM VẮNG (Controller requestTamVang tương tự TamTru)
        else if (formId === 'formTamVang') {
            const formData = new FormData(form);
            bodyData = Object.fromEntries(formData.entries());
            
            if (!bodyData.noiDen || !bodyData.tungay) throw new Error("Thiếu nơi đến hoặc ngày đi");

            url = `/api/resident/tamvang/${currentUserCCCD}`;
        }

        // --- GỬI API ---
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || "Gửi yêu cầu thành công!");
            
            // Xử lý UI sau khi thành công
            if(typeof closeRequestModal === 'function') closeRequestModal();
            form.reset(); 
            
            // Reload lịch sử nếu hàm tồn tại
            if (typeof loadRequestHistory === 'function') {
                const isHouseholdView = document.getElementById('view-household').style.display !== 'none';
                loadRequestHistory(isHouseholdView ? 'requestHistoryList' : 'indRequestHistory');
            }
        } else {
            alert("Thất bại: " + (result.message || "Lỗi server"));
        }

    } catch (error) {
        console.error("Lỗi submit:", error);
        alert("Lỗi: " + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Export ra window để HTML gọi được onclick="submitForm(...)"
window.submitForm = submitForm;

// Export function cho HTML gọi
window.openTab = openTab;
window.closeRequestModal = closeRequestModal;
window.openRequestModal = openRequestModal;
window.loadRequestHistory = loadRequestHistory;
window.viewMemberDetail = viewMemberDetail;
window.closeDetailModal = closeDetailModal;