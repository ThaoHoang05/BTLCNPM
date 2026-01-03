let globalMembers = [];
let currentUserCCCD = '';
let isHouseholdHead = false;

function renderResidentData(data, codeUser) {
    if (!data) return;
    
    // Lưu lại dữ liệu global
    globalMembers = data.danhSachNhanKhau || [];
    
    // Lấy CCCD người đang đăng nhập từ localStorage (đã lưu ở bước renderResidentMain)
    const userJson = localStorage.getItem('currentUser');
    const userObj = JSON.parse(userJson);
    currentUserCCCD = userObj.username;

    // --- BƯỚC 1: XÁC ĐỊNH VAI TRÒ ---
    // Tìm thông tin của người đang đăng nhập trong danh sách thành viên
    const myProfile = globalMembers.find(m => m.CCCD === currentUserCCCD);
    
    // Kiểm tra xem có phải chủ hộ không
    // (Dựa vào cột QuanHeChuHo hoặc so sánh với data.HoTen chủ hộ nếu logic cho phép)
    if (myProfile && myProfile.QuanHeChuHo === 'Chủ hộ') {
        isHouseholdHead = true;
    } else {
        isHouseholdHead = false;
    }

    // --- BƯỚC 2: RENDER GIAO DIỆN TƯƠNG ỨNG ---
    if (isHouseholdHead) {
        // === VIEW CHỦ HỘ ===
        document.getElementById('view-household').style.display = 'block';
        document.getElementById('view-individual').style.display = 'none';

        // Render thông tin Hộ
        document.getElementById('soHoKhauID').innerText = codeUser;
        document.getElementById('valHoTen').innerText = data.HoTen || '';
        document.getElementById('valDiaChi').innerText = data.DiaChi || '';
        document.getElementById('valNgayLap').innerText = formatDate(data.NgayLap);

        // Render bảng thành viên
        const tbody = document.getElementById('tableThanhVien').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        globalMembers.forEach(tv => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><strong>${tv.HoTenTV}</strong></td>
                <td>${formatDate(tv.NgaySinh)}</td>
                <td>${tv.QuanHeChuHo}</td>
                <td>${tv.TrangThai}</td>
                <td>
                    <button class="btn-action-small" onclick="openRequestModal('tabNhanKhau', '${tv.CCCD}')">
                        <i class="fas fa-pen"></i> Sửa
                    </button>
                </td>
            `;
        });
        
        // Load lịch sử chung
        loadRequestHistory('requestHistoryList');

    } else {
        // === VIEW CÁ NHÂN (THÀNH VIÊN) ===
        document.getElementById('view-household').style.display = 'none';
        document.getElementById('view-individual').style.display = 'block';

        if(myProfile) {
            document.getElementById('indHoTen').innerText = myProfile.HoTenTV;
            document.getElementById('indNgaySinh').innerText = formatDate(myProfile.NgaySinh);
            document.getElementById('indCCCD').innerText = myProfile.CCCD;
            document.getElementById('indGioiTinh').innerText = 'Chưa có data'; // Cần bổ sung API trả về Giới tính
            document.getElementById('indDanToc').innerText = 'Kinh'; // Cần bổ sung API trả về Dân tộc
            document.getElementById('indNgheNghiep').innerText = 'Chưa có data';
            document.getElementById('indQuanHe').innerText = myProfile.QuanHeChuHo;
            document.getElementById('indTrangThai').innerText = myProfile.TrangThai;
        } else {
            alert("Không tìm thấy thông tin cá nhân của bạn trong hộ này.");
        }

        // Render lịch sử cá nhân (Lấy từ data.lichSu.nhanKhau và lọc ra)
        const tbodyInd = document.getElementById('tableLichSuCaNhan').getElementsByTagName('tbody')[0];
        tbodyInd.innerHTML = '';
        if(data.lichSu && data.lichSu.nhanKhau) {
            const myHistory = data.lichSu.nhanKhau.filter(h => h.hoTen === myProfile?.HoTenTV);
            myHistory.forEach(h => {
                const row = tbodyInd.insertRow();
                row.innerHTML = `<td>${formatDate(h.ngayBienDong)}</td><td>${h.loaiBienDong}</td><td>${h.ghiChu || '-'}</td>`;
            });
        }
        
        // Load lịch sử yêu cầu của riêng mình
        loadRequestHistory('indRequestHistory');
    }
}

// --- LOGIC MODAL & TABS ---
function openRequestModal(defaultTabId, targetCCCD = null) {
    const modal = document.getElementById('requestModal');
    if(modal) modal.style.display = 'flex';

    // Mặc định mở tab được yêu cầu
    if(defaultTabId) {
        // Giả lập sự kiện click vào tab
        const tabBtn = document.querySelector(`.tab-link[onclick*="${defaultTabId}"]`);
        if(tabBtn) tabBtn.click();
    }

    // Đổ dữ liệu vào Select Box trong Modal (Quan trọng)
    populateMemberSelects(targetCCCD);
}

function populateMemberSelects(preSelectCCCD) {
    // 1. Select cho Tab Nhân Khẩu
    const nkSelect = document.getElementById('nkSelectMember');
    nkSelect.innerHTML = '';
    
    // Nếu là Chủ hộ -> List hết thành viên
    // Nếu là Cá nhân -> Chỉ list chính mình
    let listToShow = isHouseholdHead ? globalMembers : globalMembers.filter(m => m.CCCD === currentUserCCCD);
    
    listToShow.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.CCCD;
        opt.text = `${m.HoTenTV} (${m.QuanHeChuHo})`;
        if(preSelectCCCD && m.CCCD === preSelectCCCD) opt.selected = true;
        nkSelect.appendChild(opt);
    });

    // 2. Select cho Tab Tạm Vắng (Chỉ hiện người đang Thường trú)
    const tvSelect = document.getElementById('tvSelectMember');
    tvSelect.innerHTML = '';
    const livingMembers = listToShow.filter(m => m.TrangThai !== 'Qua đời' && m.TrangThai !== 'Chuyển đi');
    livingMembers.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.CCCD;
        opt.text = m.HoTenTV;
        tvSelect.appendChild(opt);
    });

    // Trigger update giá trị cũ nếu có người được chọn
    updateOldValuePlaceholder();
}

// Logic Tab Switching
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

// Hàm điền giá trị cũ (đã có từ trước, cập nhật lại để tìm đúng member)
function updateOldValuePlaceholder() {
    const cccd = document.getElementById('nkSelectMember').value;
    const field = document.getElementById('nkField').value;
    const member = globalMembers.find(m => m.CCCD === cccd);
    const inp = document.getElementById('nkOldVal');
    
    if(!member) { inp.value = ''; return; }

    if(field === 'hoten') inp.value = member.HoTenTV;
    else if(field === 'ngaysinh') inp.value = formatDate(member.NgaySinh);
    else inp.value = 'Chưa có data';
}

// Logic load lịch sử yêu cầu (Giả lập)
function loadRequestHistory(containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    container.innerHTML = '<div style="padding:10px; text-align:center">Đang tải...</div>';
    
    // Fake data
    setTimeout(() => {
        container.innerHTML = '';
        // Trong thực tế: filter theo người dùng nếu là view cá nhân
        const mockData = [
            { type: 'Sửa Nhân Khẩu', status: 'Chờ duyệt', date: '02/01/2026', note: 'Sửa nghề nghiệp' },
            { type: 'Tạm Vắng', status: 'Đã duyệt', date: '28/12/2025', note: 'Về quê' }
        ];

        mockData.forEach(item => {
            let badgeColor = item.status === 'Đã duyệt' ? '#28a745' : '#ffc107';
            container.innerHTML += `
                <div style="border-bottom:1px solid #eee; padding: 10px 0;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                        <span>${item.type}</span>
                        <span style="color:${badgeColor}">${item.status}</span>
                    </div>
                    <div style="font-size:13px; color:#666;">${item.note}</div>
                    <div style="font-size:12px; color:#999; margin-top:4px;">${item.date}</div>
                </div>
            `;
        });
    }, 500);
}

// --- THÊM HÀM NÀY VÀO JS: Gọi API lấy chi tiết hộ khẩu để hiển thị địa chỉ ---
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
        // Gọi API lấy chi tiết hộ khẩu (API này đã có trong hoKhauController)
        // Route giả định: GET /api/hokhau/detail/:id
        const res = await fetch(`/api/hokhau/detail/${maHK}`);
        
        if (res.ok) {
            const data = await res.json();
            // Theo hoKhauModel.js: data trả về có trường "DiaChi"
            if (data && data.DiaChi) {
                inputDiaChi.value = data.DiaChi;
                inputDiaChi.style.color = "#009688"; // Màu xanh thành công
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

// --- CẬP NHẬT HÀM openRequestModal ---
// Để khi Chủ hộ mở tab này, nó tự điền mã hộ của họ luôn
function openRequestModal(defaultTabId, targetCCCD = null) {
    const modal = document.getElementById('requestModal');
    if(modal) modal.style.display = 'flex';

    if(defaultTabId) {
        const tabBtn = document.querySelector(`.tab-link[onclick*="${defaultTabId}"]`);
        if(tabBtn) tabBtn.click();
    }
    
    populateMemberSelects(targetCCCD);

    // [MỚI] Tự động điền Mã Hộ Khẩu vào tab Tạm Trú nếu đang xem View Hộ Khẩu
    const currentView = document.getElementById('view-household');
    if (currentView && currentView.style.display !== 'none') {
        // Lấy mã hộ đang hiển thị trên header (id="soHoKhauID")
        const currentMaHK = document.getElementById('soHoKhauID')?.innerText;
        
        const inpMaHK = document.getElementById('ttMaHoKhau');
        if (inpMaHK && currentMaHK && currentMaHK !== 'Loading...') {
            inpMaHK.value = currentMaHK;
            // Gọi hàm load địa chỉ ngay lập tức
            loadDiaChiTamTru(); 
        }
    }
}

// --- CẬP NHẬT LOGIC SUBMIT FORM TẠM TRÚ ---
// Cần gửi cả mã hộ khẩu lên server
setTimeout(() => {
    const formTamTru = document.getElementById('formTamTru');
    if(formTamTru) {
        formTamTru.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Lấy dữ liệu từ form
            const formData = new FormData(formTamTru);
            const payload = Object.fromEntries(formData.entries());
            
            // Bổ sung: Kiểm tra xem người dùng đã load được địa chỉ chưa
            const diaChiCheck = document.getElementById('ttDiaChiHienThi').value;
            if(!diaChiCheck || diaChiCheck.includes("Không tìm thấy") || diaChiCheck.includes("Lỗi")) {
                alert("Vui lòng kiểm tra lại Mã Hộ Khẩu nơi tạm trú.");
                return;
            }

            // Gửi dữ liệu: mahokhau, cccd, hoten, diaphuong, tungay, denngay, lydo
            // Cần tạo API POST tương ứng
            console.log("Gửi đăng ký tạm trú:", payload);
            
            try {
                // Ví dụ gọi API:
                // const res = await fetch('/api/resident/tamtru', { 
                //    method: 'POST', 
                //    headers: {'Content-Type': 'application/json'},
                //    body: JSON.stringify(payload) 
                // });
                
                alert("Đã gửi đăng ký Tạm Trú thành công!");
                closeRequestModal();
                loadRequestHistory('requestHistoryList'); // Reload lịch sử
            } catch (err) {
                alert("Lỗi hệ thống.");
            }
        });
    }
}, 1000); // Timeout để đảm bảo DOM đã load xong nếu file js load trễ

window.openTab = openTab; // Export để HTML gọi được