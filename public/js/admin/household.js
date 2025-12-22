/* household.js - Đã sửa lỗi chuyển hướng và lỗi API */
//const e = require("cors");

// ==============================================
// 1. CÁC HÀM CƠ BẢN (MODAL, TAB)
// ==============================================

// Hàm mở Modal bất kỳ theo ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Hàm đóng Modal bất kỳ theo ID
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // ĐÃ SỬA: Bỏ dòng window.location.hash = 'resident' để tránh chuyển trang
    }
}

// Đóng modal khi click ra vùng ngoài (Overlay)
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
        // ĐÃ SỬA: Bỏ dòng window.location.hash = 'resident'
    }
}

// ==============================================
// 2. LOGIC CHI TIẾT HỘ KHẨU (DA XONG PHẦN GỌI API)
// ==============================================

// Wrapper: Mở modal chi tiết hộ khẩu
// ĐÃ SỬA: Chỉ dùng phiên bản UI (Giả lập), bỏ phiên bản gọi API lỗi
// Wrapper: Mở modal chi tiết hộ khẩu (ĐÃ SỬA LỖI)
async function openDetailModal(hkCode) {
    try {
        // 1. Gọi API và chờ dữ liệu về (dùng await)
        const response = await fetch(`/api/hokhau/show/${hkCode}`);
        const data = await response.json(); // Lấy dữ liệu vào biến 'data'

        // 2. Cập nhật tiêu đề modal
        const titleElement = document.getElementById('detailHKCode');
        if (titleElement) titleElement.innerText = hkCode;

        // 3. Cập nhật thông tin chung (Kiểm tra null trước khi gán)
        const HoTen = document.getElementById('detailChuHo');
        if (HoTen) HoTen.innerText = data.HoTen || '---';
        
        const NgayLap = document.getElementById('detailNgayLap');
        // Xử lý hiển thị ngày tháng cho đẹp
        if (NgayLap) NgayLap.innerText = data.NgayLap ? new Date(data.NgayLap).toLocaleDateString('vi-VN') : '---';

        const DiaChi = document.getElementById('detailDiaChi');
        if (DiaChi) DiaChi.innerText = data.DiaChi || '---';

        // 4. Cập nhật danh sách thành viên
        const memberListBody = document.getElementById('detailMemberTable');
        if (memberListBody) {
            memberListBody.innerHTML = ''; // XÓA DỮ LIỆU CŨ TRƯỚC KHI THÊM MỚI
            
            const thanhvien = data.danhSachNhanKhau || []; // Nếu null thì gán mảng rỗng để không lỗi
            
            thanhvien.forEach(function(member) { // Sửa cú pháp forEach
                var row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.HoTenTV || ''}</td>
                    <td>${member.NgaySinh ? new Date(member.NgaySinh).toLocaleDateString('vi-VN') : ''}</td>
                    <td>${member.QuanHeChuHo || ''}</td>
                    <td>${member.CCCD || ''}</td>
                    <td>${member.TrangThai || ''}</td>
                    <td class="text-center">
                        <button class="icon-btn warning" onclick="openEditMemberModal('${member.CCCD}')"><i class="fas fa-edit"></i></button>
                        <button class="icon-btn danger" onclick="deleteMemberFromHousehold('${hkCode}', '${member.CCCD}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                memberListBody.appendChild(row);
            });
        }

        // 5. Xử lý logic cho nút thêm thành viên
        const addBtn = document.querySelector('#detailModal .btn-primary');
        if (addBtn) {
            // Gán lại onclick để truyền đúng mã hộ khẩu hiện tại
            addBtn.setAttribute('onclick', `openAddMemberModal('${hkCode}')`);
        }

        // 6. Cập nhật lịch sử biến động (Nếu có)
        const historyList = document.getElementById('detailHistoryList');
        if (historyList) {
            historyList.innerHTML = ''; 
            const LichSu = data.lichSuBienDong || [];
            
            if (LichSu.length === 0) {
                historyList.innerHTML = '<li><small>--- Chưa có thay đổi nào ---</small></li>';
            } else {
                LichSu.forEach(entry => {
                    const listItem = document.createElement('li');                
                    const ngayHienThi = entry.NgayBienDoi 
                        ? new Date(entry.NgayBienDoi).toLocaleDateString('vi-VN') 
                        : '---';
                    listItem.innerHTML = `
                        <div style="margin-bottom: 5px;">
                            <small style="color: #666;">${ngayHienThi}:</small> 
                            <strong>${entry.NoiDung}</strong> 
                            <span style="color: var(--primary-color);">(${entry.TenNguoiThayDoi})</span>
                        </div>`;
                    
                    historyList.appendChild(listItem);
                });
            }
        }

        // 7. Cuối cùng mới mở Modal
        openModal('detailModal');

    } catch (err) {
        console.error("Lỗi khi tải chi tiết hộ khẩu:", err);
        alert("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
    }
}

// Wrapper: Mở modal tách hộ
function openSplitModal(hkCode) {
    openModal('splitModal');
}

// Wrapper: Xử lý xóa hộ khẩu ok 
async function deleteHousehold(hkCode) {
    try{
        fetch('/api/hokhau/' + hkCode,{
            method: 'DELETE',
        })
        .then(request => {
            if(request.ok){
                alert("Xóa hộ khẩu thành công!");
                loadHouseHoldList(); // Tải lại danh sách bên ngoài
            } else {
                alert("Xóa hộ khẩu thất bại!");
            }
        }
        );
    }catch(err){
        console.error("Lỗi xóa hộ khẩu:", err);
    }
}

// ==============================================
// 3. LOGIC THÊM & SỬA HỘ KHẨU
// ==============================================

// Hàm mở Modal Sửa và Binding dữ liệu mẫu
async function openEditHouseholdModal(hkCode) {
    const form = document.getElementById('editHouseholdForm');
    
    try {
        const response = await fetch(`/api/hokhau/${hkCode}`);
        const data = await response.json();

        // Binding dữ liệu
        form.querySelector('input[name="sohokhau"]').value = data.soHoKhau || hkCode;
        form.querySelector('input[name="chuhocccd"]').value = data.cccdChuHo || '';
        form.querySelector('input[name="chuhoten"]').value = data.tenChuHo || '';
        // Cắt chuỗi ngày để vừa với input type="date"
        form.querySelector('input[name="ngaylap"]').value = data.ngayLap ? new Date(data.ngayLap).toISOString().split('T')[0] : '';
        
        form.querySelector('input[name="sonha"]').value = data.soNha || '';
        form.querySelector('input[name="duong"]').value = data.duong || '';
        form.querySelector('input[name="phuong"]').value = data.phuong || '';
        form.querySelector('input[name="quan"]').value = data.quan || '';
        form.querySelector('input[name="tinh"]').value = data.tinh || '';
        form.querySelector('input[name="ghichu"]').value = data.ghiChu || '';
        
        // Cập nhật nút Submit để nó biết đang sửa hộ nào
        const submitBtn = form.querySelector('button[type="submit"]');
        // Thay đổi type để không submit form reload trang, chuyển sang gọi hàm JS
        submitBtn.type = "button"; 
        submitBtn.onclick = () => editHousehold(hkCode);

        openModal('editHouseholdModal');

    } catch (err) {
        console.error("Lỗi tải dữ liệu sửa:", err);
    }
}

async function editHousehold(hkCode) {
    const form = document.getElementById('editHouseholdForm');
    
    // 1. Lấy dữ liệu từ form
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    const payload = {
        "HoTen": formValues.chuhoten,       
        "CCCD": formValues.chuhocccd,       
        "NgayLap": formValues.ngaylap,
        "DiaChi": {                        // Gom nhóm địa chỉ nếu BE yêu cầu object con
            "SoNha": formValues.sonha,
            "Duong": formValues.duong,
            "Phuong": formValues.phuong,
            "Quan": formValues.quan,
            "Tinh": formValues.tinh
        },
        "GhiChu": formValues.ghichu
    };

    try {
        // 3. Gọi API với method PATCH
        // Lưu ý đường dẫn: /api/hokhau/:id/general (như bạn yêu cầu)
        const response = await fetch(`/api/hokhau/${hkCode}/general`, {
            method: 'PATCH', // Dùng PATCH để cập nhật một phần
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Cập nhật thông tin chung thành công!');
            closeModal('editHouseholdModal');
            loadHouseHoldList(); // Tải lại danh sách bên ngoài để thấy thay đổi
        } else {
            const errorData = await response.json(); 
            alert('Cập nhật thất bại: ' + (errorData.message || 'Lỗi không xác định'));
        }
    } catch (err) {
        console.error("Lỗi kết nối API:", err);
        alert('Không thể kết nối đến server.');
    }
}

// Ham chinh sua thong tin nhan khau trong ho khau
async function openEditMemberModal(cccd){
    var form = document.getElementById('editMemberForm');
    // Lấy dữ liệu người dùng bằng cccd
    openModal('editMemberModal');
}

// Hàm thêm hộ khẩu mới
// Hàm thêm mới hộ khẩu
async function createNewHousehold(event) {
    // Ngăn chặn hành động submit mặc định của form (tránh reload trang)
    event.preventDefault(); 
    
    const form = document.getElementById('addHouseholdForm');
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());

    // 1. Xử lý địa chỉ: Nối các trường rời rạc thành 1 chuỗi
    const fullAddress = `${formValues.sonha || ''} ${formValues.duong || ''}, ${formValues.phuong || ''}, ${formValues.tinh || ''}`;

    // 2. Chuẩn bị Payload đúng cấu trúc yêu cầu
    const payload = {
        "Ma": formValues.sohokhau,
        "NgayLap": formValues.ngaylap,
        "DiaChi": fullAddress.trim().replace(/^,/, '').trim(), // Xử lý xóa dấu phẩy thừa nếu không nhập số nhà
        "ChuHo": {
            "HoTen": formValues.chuhoten,
            "CCCD": formValues.chuhocccd, 
        },
        "GhiChu": formValues.ghichu || ''
    };

    try {
        console.log("Đang gửi payload:", payload); // Log để kiểm tra trước khi gửi

        const response = await fetch('/hokhau/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Thêm hộ khẩu mới thành công!');
            closeModal('addHouseholdModal'); // Đóng modal
            form.reset(); // Xóa dữ liệu cũ trên form
            
            // Gọi hàm tải lại danh sách (đã viết ở các bước trước)
            if (typeof loadHouseHoldList === 'function') {
                loadHouseHoldList(); 
            }
        } else {
            // Xử lý lỗi từ server trả về
            const errorData = await response.json();
            alert('Thất bại: ' + (errorData.message || 'Lỗi không xác định từ server'));
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert('Không thể kết nối đến máy chủ.');
    }
}

// Gán sự kiện submit cho form ngay khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addHouseholdForm');
    if (addForm) {
        addForm.addEventListener('submit', createNewHousehold);
    }
});

// ==============================================
// TÁCH HỘ KHẨU
// ==============================================
// 1. Hàm mở Modal và nạp dữ liệu thành viên để chọn tách
async function openSplitModal(hkCode) {
    // Lưu mã hộ cũ vào thẻ HTML để dùng sau này
    document.getElementById('srcHkCode').innerText = hkCode;
    document.getElementById('srcHkCode').dataset.id = hkCode;

    const container = document.getElementById('splitMemberContainer');
    const ownerSelect = document.getElementById('newOwnerSelect');
    
    container.innerHTML = '<p>Đang tải dữ liệu...</p>';
    ownerSelect.innerHTML = '<option value="">-- Chọn chủ hộ --</option>';

    try {
        // Gọi API lấy chi tiết hộ cũ để biết có những ai
        const response = await fetch(`/api/hokhau/${hkCode}`);
        const data = await response.json();
        
        container.innerHTML = ''; // Xóa loading
        
        // Render danh sách checkbox
        // Giả sử API trả về data.thanhVien là mảng các thành viên
        if (data.thanhVien && data.thanhVien.length > 0) {
            data.thanhVien.forEach(member => {
                // Tạo checkbox cho từng thành viên
                const div = document.createElement('div');
                div.className = 'checkbox-item';
                div.innerHTML = `
                    <label style="display:block; padding: 5px 0;">
                        <input type="checkbox" class="split-member-check" 
                               value="${member.cccd}" 
                               data-name="${member.hoTen}"
                               onchange="updateNewOwnerList()"> 
                        ${member.hoTen} (${member.cccd})
                    </label>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p class="text-danger">Hộ này không có thành viên nào!</p>';
        }

        openModal('splitModal');
    } catch (err) {
        console.error("Lỗi tải thành viên:", err);
        alert("Không thể tải danh sách thành viên.");
    }
}

// Hàm phụ: Cập nhật dropdown "Chủ hộ mới" dựa trên những người được tick chọn
function updateNewOwnerList() {
    const checkboxes = document.querySelectorAll('.split-member-check:checked');
    const select = document.getElementById('newOwnerSelect');
    
    // Giữ lại lựa chọn hiện tại nếu vẫn còn trong danh sách checked
    const currentVal = select.value;
    
    select.innerHTML = '<option value="">-- Chọn chủ hộ --</option>';
    
    checkboxes.forEach(chk => {
        const option = document.createElement('option');
        option.value = chk.dataset.name; // API yêu cầu gửi "Họ Tên", không phải CCCD
        option.innerText = chk.dataset.name;
        select.appendChild(option);
    });

    if (currentVal) select.value = currentVal;
}

// 2. Hàm xử lý logic Tách hộ (Gửi API)
async function submitSplitHousehold(event) {
    event.preventDefault(); // Chặn reload trang

    const oldHkId = document.getElementById('srcHkCode').dataset.id;
    const form = document.getElementById('splitHouseholdForm');
    const formData = new FormData(form);

    // Lấy danh sách thành viên đã chọn
    const checkedBoxes = document.querySelectorAll('.split-member-check:checked');
    if (checkedBoxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 thành viên để tách!");
        return;
    }

    // Tạo mảng thành viên (Giả sử API cần mảng tên hoặc mảng object, ở đây gửi mảng CCCD hoặc Tên tùy quy ước BE)
    // Dựa vào payload "ThanhVien", thường là danh sách định danh. 
    // Nếu BE cần Tên: dùng chk.dataset.name. Nếu BE cần CCCD: dùng chk.value
    // Ở đây tôi lấy CCCD cho chính xác, nhưng nếu API bắt buộc là "Tên" thì bạn đổi lại.
    const listThanhVien = Array.from(checkedBoxes).map(chk => chk.value); 

    // Chuẩn bị payload
    const payload = {
        "HoTen": formData.get('newOwner'), // Họ tên chủ hộ mới
        "ThanhVien": listThanhVien,        // Danh sách thành viên đi cùng
        "NgayTach": formData.get('ngayTach'),
        "LyDo": formData.get('lyDo'),
        "DiaChi": formData.get('diaChi')
    };

    console.log("Payload tách hộ:", payload);

    try {
        const response = await fetch(`/hokhau/${oldHkId}/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Tách hộ thành công!');
            closeModal('splitModal');
            loadHouseHoldList(); // Tải lại danh sách bên ngoài
        } else {
            const errData = await response.json();
            alert('Lỗi: ' + (errData.message || 'Tách hộ thất bại'));
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert('Lỗi kết nối đến server');
    }
}

// Đăng ký sự kiện submit form khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
    const splitForm = document.getElementById('splitHouseholdForm');
    if (splitForm) {
        splitForm.addEventListener('submit', submitSplitHousehold);
    }
});

// ==============================================
// 4. LOGIC THÊM THÀNH VIÊN & TÌM KIẾM (TABS)
// ==============================================

// Hàm chuyển Tab (Tìm kiếm <-> Nhập mới)
function switchTab(tabId) {
    // Ẩn tất cả nội dung tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Bỏ active ở tất cả nút tab
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Hiện tab được chọn
    document.getElementById(tabId).classList.add('active');
    
    // Active nút được chọn
    const buttons = document.querySelectorAll('.tab-btn');
    if (tabId === 'tabSearch') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

// Hàm mở Modal Thêm Thành Viên (Được gọi từ nút trong Modal Chi tiết)
function openAddMemberModal(hkCode) {
    // Đóng modal chi tiết để tránh bị che khuất
    closeModal('detailModal'); 
    
    // Reset về Tab tìm kiếm
    switchTab('tabSearch');
    
    // Ẩn kết quả tìm kiếm cũ
    const resArea = document.getElementById('searchResultArea');
    if(resArea) resArea.style.display = 'none';
    
    const searchInput = document.getElementById('searchCCCDInput');
    if(searchInput) searchInput.value = '';

    // Điền Mã hộ vào các form con để tiện nhập liệu
    if(hkCode) {
        // Form tìm kiếm
        const hkInputSearch = document.querySelector('input[name="sohokhau_search"]');
        if(hkInputSearch) hkInputSearch.value = hkCode;

        // Form nhập mới
        const hkInputNew = document.querySelector('#memberForm input[name="sohokhau"]');
        if(hkInputNew) hkInputNew.value = hkCode;
    }
    
    openModal('addMemberModal');
}

// Giả lập hàm Tìm kiếm CCCD
function mockSearchCitizen() {
    const cccd = document.getElementById('searchCCCDInput').value;
    if(!cccd) {
        alert('Vui lòng nhập số CCCD!');
        return;
    }
    // Giả lập tìm thấy
    const resArea = document.getElementById('searchResultArea');
    if(resArea) resArea.style.display = 'block';
    
    const resName = document.getElementById('resName');
    if(resName) resName.value = 'Trần Văn Demo (Tìm thấy)';
    
    const resDob = document.getElementById('resDob');
    if(resDob) resDob.value = '1995-01-01';
}

// ==============================================
// 5. API LOAD DANH SÁCH HỘ KHẨU (đã xong)
// ==============================================
async function loadHouseHoldList(){
    try {
        // Sửa selector để tìm đúng vào tbody của bảng có ID householdTable
        const tbody = document.getElementById('householdList'); 
        
        if (!tbody) {
            console.error("Lỗi: Không tìm thấy tbody có id='householdList'");
            return;
        }
        tbody.innerHTML = ''; 
        const response = await fetch('/api/hokhau/show');
        const data = await response.json();
        data.forEach(hk => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${hk['Mã hộ khẩu']}</strong></td>
                <td>${hk['Chủ hộ']} <br><small>(${hk[''] || '---'})</small></td>
                <td>${hk['Địa chỉ']}</td>
                <td>${hk['Ngày lập sổ'] ? new Date(hk['Ngày lập sổ']).toLocaleDateString('vi-VN') : '---'}</td>
                <td>
                    <button class="icon-btn info" onclick="openDetailModal('${hk['Mã hộ khẩu']}')"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn primary" onclick="openEditHouseholdModal('${hk['Mã hộ khẩu']}')"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn warning" onclick="openSplitModal('${hk['Mã hộ khẩu']}')"><i class="fas fa-random"></i></button>
                    <button class="icon-btn danger" onclick="deleteHousehold('${hk['Mã hộ khẩu']}')"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch(err) {
        console.error("Lỗi tải danh sách:", err);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadHouseHoldList(); // Gọi hàm này để nạp dữ liệu vào bảng ngay khi mở trang
});


// Hàm mở Modal Quản lý Cư trú
function openManageResidence() {
    loadResidenceData(); // Gọi hàm tải dữ liệu gộp
    openModal('manageResidenceModal');
}

// Hàm tải và gộp dữ liệu
async function loadResidenceData() {
    const tbody = document.getElementById('residentListBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>';

    try {
        // 1. Gọi song song 2 API (Giả sử bạn đã có API)
        // Nếu chưa có backend, bạn có thể comment lại và dùng dữ liệu giả bên dưới
        /*
        const [resTamtru, resTamvang] = await Promise.all([
            fetch('/api/tamtru'),
            fetch('/api/tamvang')
        ]);
        const listTamTru = await resTamtru.json();
        const listTamVang = await resTamvang.json();
        */

        // --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
        const listTamTru = [
            { id: 1, hoTen: "Nguyễn Thị B", cccd: "0381990001", diaChi: "Số 5, Ao Sen", tuNgay: "2024-01-01", denNgay: "2024-06-01" }
        ];
        const listTamVang = [
            { id: 10, hoTen: "Lê Văn C", cccd: "0012000009", noiDen: "KTX Bách Khoa", tuNgay: "2024-09-01", denNgay: "2025-06-01" }
        ];
        // -----------------------------------

        // 2. Chuẩn hóa dữ liệu để gộp vào chung 1 cấu trúc
        // Đánh dấu type: 'TAM_TRU' hoặc 'TAM_VANG' để dễ xử lý giao diện
        const standardizedTamTru = listTamTru.map(item => ({
            ...item,
            type: 'TAM_TRU',
            displayAddress: item.diaChi, // Map địa chỉ vào chung 1 key
            displayStatus: 'Tạm trú'
        }));

        const standardizedTamVang = listTamVang.map(item => ({
            ...item,
            type: 'TAM_VANG',
            displayAddress: item.noiDen, // Map nơi đến vào chung 1 key
            displayStatus: 'Tạm vắng'
        }));

        // 3. Gộp 2 mảng lại
        const combinedList = [...standardizedTamTru, ...standardizedTamVang];

        // (Tùy chọn) Sắp xếp theo tên hoặc ngày
        // combinedList.sort((a, b) => a.hoTen.localeCompare(b.hoTen));

        // 4. Render ra bảng
        tbody.innerHTML = '';
        if (combinedList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có dữ liệu cư trú</td></tr>';
            return;
        }

        combinedList.forEach(item => {
            const row = document.createElement('tr');
            
            // Xử lý giao diện khác nhau dựa trên Type
            let badgeClass = item.type === 'TAM_TRU' ? 'badge-status active' : 'badge-status warning'; // Xanh vs Vàng
            let actionBtn = '';

            if (item.type === 'TAM_TRU') {
                // Nút xóa cho tạm trú
                actionBtn = `
                    <button class="icon-btn danger" onclick="deleteTempResidence('${item.id}')" title="Xóa/Hết hạn">
                        <i class="fas fa-trash-alt"></i>
                    </button>`;
            } else {
                // Nút báo về cho tạm vắng
                actionBtn = `
                    <button class="icon-btn success" onclick="confirmReturnEarly('${item.id}')" title="Đã về">
                        <i class="fas fa-undo-alt"></i>
                    </button>`;
            }

            row.innerHTML = `
                <td>${item.hoTen}</td>
                <td>${item.cccd}</td>
                <td>${item.displayAddress}</td>
                <td>${item.tuNgay} <br> <small>đến ${item.denNgay}</small></td>
                <td><span class="${badgeClass}">${item.displayStatus}</span></td>
                <td class="text-center">${actionBtn}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
    }
}

// Hàm chuyển đổi Tab trong Modal Cư trú
function switchResidenceTab(tabId, btnElement) {
    // 1. Ẩn tất cả nội dung các tab (xóa class active khỏi tab-panel)
    document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
    
    // 2. Bỏ trạng thái active ở tất cả các nút bấm (tab-item)
    document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));

    // 3. Hiển thị nội dung tab được chọn
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // 4. Đánh dấu nút vừa bấm là active
    if (btnElement) {
        btnElement.classList.add('active');
    }
}
// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quản lý Hộ khẩu đã sẵn sàng!');
});