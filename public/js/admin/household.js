/* household.js - Đã sửa lỗi chuyển hướng và lỗi API */
//const e = require("cors");

// ==============================================
// 1. CÁC HÀM CƠ BẢN (MODAL, TAB)
// ==============================================

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quản lý Hộ khẩu đã sẵn sàng!');
    loadHouseHoldList(); // Gọi hàm này để nạp dữ liệu vào bảng ngay khi mở trang

    // Gán sự kiện submit cho form ngay khi trang tải xong
    const addForm = document.getElementById('addHouseholdForm');
    if (addForm) {
        addForm.addEventListener('submit', createNewHousehold);
    };

    const splitForm = document.getElementById('splitHouseholdForm');
    if (splitForm) {
        splitForm.addEventListener('submit', submitSplitHousehold);
    };

    const tamTruForm = document.getElementById('addTamTruForm');
    if (tamTruForm) {
        tamTruForm.addEventListener('submit', submitRegisterTamTru);
    }
});

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
            historyList.innerHTML = ''; // Xóa cũ
            const LichSu = data.lichSu || {}; 
            
            const lichSuNhanKhau = LichSu.nhanKhau || [];
            const lichSuHoKhau = LichSu.hoKhau || [];
            
            // Hàm phụ để tạo dòng lịch sử cho gọn code
            const createItem = (date, content, note) => {
                const li = document.createElement('li');
                // Định dạng ngày: dd/mm/yyyy
                const dateStr = new Date(date).toLocaleDateString('vi-VN');
                
                li.innerHTML = `
                    <span class="history-date">${dateStr}</span>
                    <span class="history-content">${content}</span>
                    ${note ? `<span class="history-note">(${note})</span>` : ' '}
                `;
                historyList.appendChild(li);
            };

            // Render Lịch sử Nhân khẩu
            lichSuNhanKhau.forEach(entry => {
                let text = `<b>${entry.hoTen}</b>: ${entry.loaiBienDong}`;
                if(entry.noiDen) text += ` đến ${entry.noiDen}`;
                createItem(entry.ngayThayDoi, text, entry.ghiChu);
            });

            // Render Lịch sử Hộ khẩu
            lichSuHoKhau.forEach(entry => {
                createItem(entry.ngayThayDoi, `<b>Hộ khẩu</b>: ${entry.noiDung}`, '');
            });

            // Nếu không có dữ liệu
            if (historyList.children.length === 0) {
                historyList.innerHTML = '<li style="color:#999; font-style:italic;">Chưa có lịch sử biến động.</li>';
            }
        }

        // 7. Cuối cùng mới mở Modal
        openModal('detailModal');

    } catch (err) {
        console.error("Lỗi khi tải chi tiết hộ khẩu:", err);
        alert("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
    }
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
    const v = Object.fromEntries(formData.entries());

        const payload = {
            "NgayLap": v.ngaylap,
            "DiaChi": { // Gửi dạng Object thay vì chuỗi
                "sonha": v.sonha,
                "duong": v.duong,
                "phuong": "La Khê",
                "quan": "Hà Đông",
                "tinh": "Hà Nội"
            },
            "ChuHo": { "HoTen": v.chuhoten, "CCCD": v.chuhocccd },
            "GhiChu": v.ghichu || ''
        };

    try {
        console.log("Đang gửi payload:", payload); // Log để kiểm tra trước khi gửi

        const response = await fetch('/api/hokhau/new', {
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
        const response = await fetch(`/api/hokhau/show/${hkCode}`);
        const data = await response.json();
        
        container.innerHTML = ''; 

        const members = data.danhSachNhanKhau || []; 

        if (members.length > 0) {
            members.forEach(member => {
                if (member.QuanHeChuHo === 'Chủ hộ') {
                    return; // Bỏ qua, không render checkbox cho chủ hộ cũ
                }
                const div = document.createElement('div');
                div.className = 'checkbox-item';
                div.innerHTML = `
                    <label style="display:block; padding: 5px 0;">
                        <input type="checkbox" class="split-member-check" 
                            value="${member.id}" 
                            data-name="${member.HoTenTV}"
                            onchange="updateNewOwnerList()"> 
                        ${member.HoTenTV} (${member.CCCD || 'Trẻ em'})
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
        option.value = chk.value;
        option.innerText = chk.dataset.name;
        select.appendChild(option);
    });

    if (currentVal) select.value = currentVal;
}

// 2. Hàm xử lý logic Tách hộ (Gửi API)
async function submitSplitHousehold(event) {
    event.preventDefault(); 

    const oldHkId = document.getElementById('srcHkCode').dataset.id;
    const form = document.getElementById('splitHouseholdForm');
    const formData = new FormData(form);

    const checkedBoxes = document.querySelectorAll('.split-member-check:checked');
    if (checkedBoxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 thành viên để tách!");
        return;
    }

    // Lấy danh sách ID từ value của checkbox
    const listThanhVienIDs = Array.from(checkedBoxes).map(chk => chk.value); 

    // Payload gửi ID
    const payload = {
        "HoTenID": formData.get('newOwner'), // ID chủ hộ mới
        "ThanhVienIDs": listThanhVienIDs,   // Mảng ID các thành viên
        "NgayTach": formData.get('ngayTach'),
        "LyDo": formData.get('lyDo'),
        "DiaChi": formData.get('diaChi')
    };

    try {
        const response = await fetch(`/api/hokhau/${oldHkId}/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Tách hộ thành công!');
            closeModal('splitModal');
            loadHouseHoldList();
        } else {
            const errData = await response.json();
            alert('Lỗi: ' + (errData.message || 'Tách hộ thất bại'));
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert('Lỗi kết nối đến server');
    }
}

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
                <td>${hk['Chủ hộ']} <br><small>(${hk['CCCD'] || '---'})</small></td>
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

// ==============================================
// 6. QUẢN LÝ CƯ TRÚ (TẠM TRÚ / TẠM VẮNG)
// ==============================================

// Hàm mở Modal Quản lý Cư trú
function openManageResidence() {
    loadTamTruData();  // Tải danh sách tạm trú
    loadTamVangData(); // Tải danh sách tạm vắng
    openModal('manageResidenceModal');
    
    // Mặc định active tab đầu tiên khi mở
    const firstTabBtn = document.querySelector('.custom-tabs .tab-item');
    if(firstTabBtn) switchResidenceTab('tabTamTru', firstTabBtn);
}

// --- HÀM 1: TẢI DANH SÁCH TẠM TRÚ ---
const ITEMS_PER_PAGE = 10;

async function loadTamTruData(page = 1) {
    currentTamTruPage = page;
    const tbody = document.getElementById('residentListBody');
    const paginationContainer = document.getElementById('tamTruPagination');

    // Hiển thị loading
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải...</td></tr>';

    try {
        const response = await fetch(`/api/tamtru?page=${page}`);
        const result = await response.json(); 
        // result = { data: [...], total: 50, currentPage: 1 }

        if(tbody) {
            tbody.innerHTML = '';
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';
                if(paginationContainer) paginationContainer.innerHTML = '';
                return;
            }

            // 1. Render dữ liệu bảng
            result.data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.HoTen}</td>
                    <td>${item.CCCD || '---'}</td>
                    <td>${item.DiaChi || '---'}</td>
                    <td>${new Date(item.Tu).toLocaleDateString('vi-VN')} <br> 
                        - ${new Date(item.Den).toLocaleDateString('vi-VN')}</td>
                    <td><b><span class="badge badge-success">${item.TrangThai}</span></b></td>
                    <td class="text-center">
                        <button class="icon-btn warning" onclick="confirmMoveOut('${item.ID}')" title="Chuyển đi">
                            <i class="fas fa-walking"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // 2. Render nút phân trang
            if(paginationContainer) {
                renderPagination(paginationContainer, result.total, page);
            }
        }
    } catch (err) {
        console.error("Lỗi tải tạm trú:", err);
    }
}

// --- HÀM VẼ NÚT PHÂN TRANG ---
function renderPagination(container, totalRecords, currentPage) {
    container.innerHTML = '';
    
    // Tính tổng số trang
    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
    
    // Nếu chỉ có 1 trang thì ẩn luôn cho gọn
    if (totalPages <= 1) return;

    // --- 1. NÚT PREV (<<) ---
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm'; // Class mặc định
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Dùng icon cho đẹp
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => loadTamTruData(currentPage - 1);
    container.appendChild(prevBtn);

    // --- 2. LOGIC TẠO SỐ TRANG (1 ... 4 5 6 ... 20) ---
    
    // Hàm phụ để tạo nút số
    const createPageBtn = (i) => {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => loadTamTruData(i);
        container.appendChild(btn);
    };

    // Hàm phụ để tạo dấu ...
    const createDots = () => {
        const span = document.createElement('span');
        span.className = 'btn btn-sm pagination-dots';
        span.innerText = '...';
        container.appendChild(span);
    };

    // THUẬT TOÁN HIỂN THỊ
    if (totalPages <= 7) {
        // Trường hợp ít trang (<= 7): Hiện hết (1 2 3 4 5 6 7)
        for (let i = 1; i <= totalPages; i++) createPageBtn(i);
    } else {
        // Trường hợp nhiều trang (> 7): Cần tính toán
        // Luôn hiện trang 1
        createPageBtn(1);

        // Xử lý đoạn đầu (Nếu đang ở trang > 3 thì hiện dấu ...)
        if (currentPage > 3) {
            createDots();
        }

        // Hiện các trang xung quanh trang hiện tại (Trừ trang 1 và trang Cuối ra)
        // Lấy khoảng [Current-1, Current+1]
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        // Điều chỉnh đặc biệt: Nếu đang ở gần đầu hoặc gần cuối để không bị hụt
        if (currentPage <= 3) { end = 4; }
        if (currentPage >= totalPages - 2) { start = totalPages - 3; }
        for (let i = start; i <= end; i++) {
            createPageBtn(i);
        }
        // Xử lý đoạn cuối (Nếu còn cách xa trang cuối thì hiện ...)
        if (currentPage < totalPages - 2) {
            createDots();
        }
        // Luôn hiện trang cuối
        createPageBtn(totalPages);
    }

    // --- 3. NÚT NEXT (>>) ---
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => loadTamTruData(currentPage + 1);
    container.appendChild(nextBtn);
}

// --- HÀM 2: TẢI DANH SÁCH TẠM VẮNG ---
async function loadTamVangData() {
    const tbodyTamVang = document.getElementById('listTamVang');
    if(tbodyTamVang) tbodyTamVang.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải...</td></tr>';

    try {
        // API này bạn sẽ cần xây dựng tương tự như /api/tamtru
        const response = await fetch('/api/tamvang'); 
        const listTamVang = await response.json();

        if(tbodyTamVang) {
            tbodyTamVang.innerHTML = '';
            if (listTamVang.length === 0) {
                tbodyTamVang.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu tạm vắng</td></tr>';
            } else {
                listTamVang.forEach(item => {
                    const row = document.createElement('tr');
                    // Sử dụng định dạng ngày Việt Nam
                    const tuNgay = new Date(item.tuNgay).toLocaleDateString('vi-VN');
                    const denNgay = new Date(item.denNgay).toLocaleDateString('vi-VN');

                    row.innerHTML = `
                        <td>${item.hoTen}</td>
                        <td>${item.noiDen}</td>
                        <td>${tuNgay} <br> <small>đến ${denNgay}</small></td>
                        <td>${item.lyDo}</td>
                        <td><span class="badge-status warning">${item.trangThai || 'Đang tạm vắng'}</span></td>
                        <td class="text-center">
                            <button class="icon-btn success" onclick="confirmReturnEarly('${item.id}')" title="Đã về trước hạn">
                                <i class="fas fa-undo-alt"></i>
                            </button>
                        </td>
                    `;
                    tbodyTamVang.appendChild(row);
                });
            }
        }
    } catch (err) {
        console.error("Lỗi tải dữ liệu tạm vắng:", err);
        if(tbodyTamVang) tbodyTamVang.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Lỗi kết nối server</td></tr>';
    }
}

// Hàm chuyển đổi Tab trong Modal Cư trú
function switchResidenceTab(tabId, btnElement) {
    // 1. Ẩn tất cả nội dung các tab (tab-panel)
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

// Hàm giả lập xóa tạm trú
async function confirmMoveOut(id) {
    if(confirm('Xác nhận công dân này đã kết thúc tạm trú và chuyển đi?')) {
        const response = await fetch(`/api/tamtru/${id}/chuyendi`, { method: 'POST' });
        if(response.ok) {
            alert('Cập nhật thành công!');
            loadTamTruData(currentTamTruPage);
        }
    }
}

// Hàm xử lý submit form Đăng ký tạm trú
async function submitRegisterTamTru(event) {
    event.preventDefault();
    const form = document.getElementById('addTamTruForm'); // Đảm bảo ID form đúng
    const formData = new FormData(form);

    const payload = {
        "hoTenNguoiDK": formData.get('hoten_nguoidk'),
        "cccdNguoiDK": formData.get('cccd_nguoidk'),
        "hoTenChuHo": formData.get('hoten_chuho'),
        "cccdChuHo": formData.get('cccd_chuho'),
        "diaChi": formData.get('diachi_tamtru'), // Gửi lên nhưng BE sẽ ignore và dùng địa chỉ chủ hộ
        "thoiGian": {
            "tu": formData.get('tungay'),
            "den": formData.get('denngay')
        },
        "lyDo": formData.get('lydo')
    };

    try {
        const response = await fetch('/api/tamtru/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Đăng ký tạm trú thành công!');
            closeModal('tempResidenceModal');
            form.reset();
            loadTamTruData(1);
        } else {
            const err = await response.json();
            alert('Lỗi: ' + (err.message || 'Đăng ký thất bại'));
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi kết nối server');
    }
}

// Hàm giả lập báo đã về (kết thúc tạm vắng)
function confirmReturnEarly(id) {
    if(confirm('Công dân này đã quay về địa phương?')) {
        alert('Cập nhật trạng thái thành công!');
        loadResidenceData();
    }
}
