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

    const memberForm = document.getElementById('memberForm');
    if (memberForm) {
        // Dùng onsubmit để tránh gán nhiều lần (duplicate event listener)
        memberForm.onsubmit = function(event) {
            submitNewMember(event);
        };
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
// Hàm mở Modal chi tiết hộ khẩu (Đã sửa lỗi và tích hợp phân quyền)
async function openDetailModal(hkCode) {
    try {
        // 1. Gọi API lấy dữ liệu
        const response = await fetch(`/api/hokhau/show/${hkCode}`);
        const data = await response.json();

        // 2. Cập nhật tiêu đề modal
        const titleElement = document.getElementById('detailHKCode');
        if (titleElement) titleElement.innerText = hkCode;

        // 3. Cập nhật thông tin chung
        const HoTen = document.getElementById('detailChuHo');
        if (HoTen) HoTen.innerText = data.HoTen || '---';
        
        const NgayLap = document.getElementById('detailNgayLap');
        if (NgayLap) NgayLap.innerText = data.NgayLap ? new Date(data.NgayLap).toLocaleDateString('vi-VN') : '---';

        const DiaChi = document.getElementById('detailDiaChi');
        if (DiaChi) DiaChi.innerText = data.DiaChi || '---';

        // 4. Cập nhật danh sách thành viên (Kèm logic ẩn nút Sửa/Xóa cho Tổ Phó)
        const memberListBody = document.getElementById('detailMemberTable');
        if (memberListBody) {
            memberListBody.innerHTML = ''; // Reset bảng
            
            const thanhvien = data.danhSachNhanKhau || [];
            
            // Kiểm tra quyền 1 lần dùng chung cho vòng lặp
            const isRestricted = typeof isToPho === 'function' && isToPho();

            thanhvien.forEach(function(member) {
                // Nếu là Tổ phó -> Hiện text "---" hoặc "Xem"
                // Nếu là Admin -> Hiện nút Sửa / Xóa
                const actions = isRestricted ? '<span style="color:#999; font-style:italic">Chỉ xem</span>' : `
                    <button class="icon-btn warning" onclick="openEditHouseholdMemberModal('${member.id}')" title="Sửa thông tin">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn danger" onclick="deleteMemberFromHousehold('${hkCode}', '${member.id}')" title="Xóa khỏi hộ">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            
                var row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.HoTenTV || ''}</td>
                    <td>${member.NgaySinh ? new Date(member.NgaySinh).toLocaleDateString('vi-VN') : ''}</td>
                    <td>${member.QuanHeChuHo || ''}</td>
                    <td>${member.CCCD || ''}</td>
                    <td>${member.TrangThai || ''}</td>
                    <td class="text-center">${actions}</td>
                `;
                memberListBody.appendChild(row);
            });
        }

        // 5. Xử lý nút "Thêm Thành Viên" (Ẩn nếu là Tổ Phó)
        const addBtn = document.querySelector('#detailModal .btn-primary');
        if (addBtn) {
            const isRestricted = typeof isToPho === 'function' && isToPho();
            
            if (isRestricted) {
                // Nếu là Tổ phó: Ẩn nút thêm
                addBtn.style.display = 'none';
            } else {
                // Nếu là Admin: Hiện nút và cập nhật sự kiện onclick
                addBtn.style.display = 'inline-block';
                addBtn.setAttribute('onclick', `openAddMemberModal('${hkCode}')`);
            }
        }

        // 6. Cập nhật lịch sử biến động
        const historyList = document.getElementById('detailHistoryList');
        if (historyList) {
            historyList.innerHTML = '';
            const LichSu = data.lichSu || {}; 
            
            const lichSuNhanKhau = LichSu.nhanKhau || [];
            const lichSuHoKhau = LichSu.hoKhau || [];
            
            const createItem = (date, content, note) => {
                const li = document.createElement('li');
                const dateStr = new Date(date).toLocaleDateString('vi-VN');
                li.innerHTML = `
                    <span class="history-date">${dateStr}</span>
                    <span class="history-content">${content}</span>
                    ${note ? `<span class="history-note">(${note})</span>` : ' '}
                `;
                historyList.appendChild(li);
            };

            lichSuNhanKhau.forEach(entry => {
                let text = `<b>${entry.hoTen}</b>: ${entry.loaiBienDong}`;
                if(entry.noiDen) text += ` đến ${entry.noiDen}`;
                createItem(entry.ngayThayDoi,`<b>Nhân khẩu</b> - ${text}`, entry.ghiChu);
            });

            lichSuHoKhau.forEach(entry => {
                createItem(entry.ngayThayDoi, `<b>Hộ khẩu</b>: ${entry.noiDung}`, '');
            });

            if (historyList.children.length === 0) {
                historyList.innerHTML = '<li style="color:#999; font-style:italic;">Chưa có lịch sử biến động.</li>';
            }
        }

        // 7. Mở Modal
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
        const submitBtn = form.querySelector('.modal-footer .btn-primary');
        if (submitBtn) {
            submitBtn.type = "button"; // Đảm bảo luôn là button thường để không reload trang
            submitBtn.onclick = () => editHousehold(hkCode);
        }
        openModal('editHouseholdModal');
    } catch (err) {
        console.error("Lỗi tải dữ liệu sửa:", err);
        alert("Không thể tải thông tin hộ khẩu.");
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

// ==============================================
// Hàm thêm hộ khẩu mới
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
                if (member.TrangThai === 'Qua đời') return; // Bỏ qua thành viên đã mất
                const div = document.createElement('div');
                div.className = 'checkbox-item';
                div.innerHTML = `
                    <label style="display:block; padding: 5px 0;">
                        <input type="checkbox" class="split-member-check" 
                            value="${member.id}" 
                            data-name="${member.HoTenTV}"
                            data-dob="${member.NgaySinh}"
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
        // Tính tuổi
        const dob = new Date(chk.dataset.dob);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        // Chỉ thêm vào danh sách nếu đủ 18 tuổi
        if (age >= 18) {
            const option = document.createElement('option');
            option.value = chk.value;
            option.innerText = chk.dataset.name;
            select.appendChild(option);
        }
    });

    if (currentVal) select.value = currentVal;
}

// 2. Hàm xử lý logic Tách hộ (Gửi API)
async function submitSplitHousehold(event) {
    event.preventDefault(); 

    // Lấy ID hộ cũ từ dataset đã gán lúc mở modal
    const srcElement = document.getElementById('srcHkCode');
    const oldHkId = srcElement ? srcElement.dataset.id : null;

    if (!oldHkId) {
        alert("Lỗi: Không xác định được hộ gốc.");
        return;
    }

    const form = document.getElementById('splitHouseholdForm');
    const formData = new FormData(form);

    // Kiểm tra thành viên được chọn
    const checkedBoxes = document.querySelectorAll('.split-member-check:checked');
    if (checkedBoxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 thành viên để tách!");
        return;
    }

    // Kiểm tra chủ hộ mới
    const newOwnerId = formData.get('newOwner');
    if (!newOwnerId) {
        alert("Vui lòng chọn chủ hộ mới cho hộ được tách!");
        return;
    }

    // Lấy danh sách ID từ value của checkbox
    const listThanhVienIDs = Array.from(checkedBoxes).map(chk => chk.value); 

    // Tạo Payload gửi đi (Cập nhật phần Địa Chỉ)
    const payload = {
        "HoTenID": newOwnerId,               // ID chủ hộ mới
        "ThanhVienIDs": listThanhVienIDs,    // Mảng ID các thành viên
        "NgayTach": formData.get('ngayTach'),
        "LyDo": formData.get('lyDo'),
        "DiaChi": {                          // Gom nhóm các trường địa chỉ từ form
            "sonha": formData.get('sonha'),
            "duong": formData.get('duong'),
        }
    };

    try {
        console.log("Đang gửi yêu cầu tách hộ:", payload); // Log để kiểm tra

        const response = await fetch(`/api/hokhau/${oldHkId}/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Tách hộ thành công!');
            closeModal('splitModal');
            loadHouseHoldList(); // Tải lại danh sách hộ khẩu chính
        } else {
            const errData = await response.json();
            alert('Lỗi: ' + (errData.message || 'Tách hộ thất bại'));
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert('Lỗi kết nối đến server khi thực hiện tách hộ.');
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
    // Đóng modal chi tiết tạm thời (hoặc giữ nguyên tùy UI của bạn)
    // closeModal('detailModal'); 
    
    // Reset form trước khi mở
    const form = document.getElementById('memberForm');
    if(form) form.reset();

    // Mặc định chuyển về tab Nhập mới (Tab 2) nếu bạn muốn ưu tiên nhập mới
    switchTab('tabNew'); 
    
    // Ẩn kết quả tìm kiếm cũ của tab tìm kiếm
    const resArea = document.getElementById('searchResultArea');
    if(resArea) resArea.style.display = 'none';

    // ĐIỀN MÃ HỘ KHẨU VÀO CÁC Ô INPUT (QUAN TRỌNG)
    if(hkCode) {
        // 1. Điền vào Form nhập mới (Tab nhập mới)
        const hkInputNew = document.querySelector('#memberForm input[name="sohokhau"]');
        if(hkInputNew) {
            hkInputNew.value = hkCode;
            // Đảm bảo ô này không sửa được
            hkInputNew.setAttribute('readonly', true);
        }

        // 2. Điền vào Form tìm kiếm (Tab tìm có sẵn)
        const hkInputSearch = document.querySelector('input[name="sohokhau_search"]');
        if(hkInputSearch) {
            hkInputSearch.value = hkCode;
        }
    }
    
    openModal('addMemberModal');
    fetchAllCitizensForLookup();
}

// Biến toàn cục lưu trữ danh sách nhân khẩu để tìm kiếm
function searchCitizenForAdd(event) {
    // Ngăn form submit reload trang
    if (event) event.preventDefault();

    // 1. SỬA LẠI ID CHO KHỚP VỚI HTML (searchCitizenInput)
    const inputEl = document.getElementById('searchCitizenInput');
    const keyword = inputEl ? inputEl.value.trim().toLowerCase() : '';

    if (!keyword) {
        alert('Vui lòng nhập Tên hoặc số CCCD để tìm!');
        return;
    }

    if (!cachedCitizenList || cachedCitizenList.length === 0) {
        alert('Dữ liệu nhân khẩu chưa tải xong, vui lòng thử lại sau giây lát.');
        fetchAllCitizensForLookup();
        return;
    }

    // 2. TÌM KIẾM MỀM DẺO (Theo Tên HOẶC CCCD)
    // Lọc ra danh sách những người khớp điều kiện
    const results = cachedCitizenList.filter(p => {
        const cccd = (p.cccd || '').toLowerCase();
        const hoTen = (p.hoTen || '').toLowerCase();
        // Kiểm tra xem keyword có nằm trong Tên hoặc CCCD không
        return cccd.includes(keyword) || hoTen.includes(keyword);
    });

    // Lấy các element hiển thị kết quả
    const resArea = document.getElementById('searchResultArea');
    const candidateList = document.getElementById('candidateList'); 

    // Reset giao diện trước khi hiển thị kết quả mới
    if (resArea) resArea.style.display = 'none';
    if (candidateList) {
        candidateList.innerHTML = '';
        candidateList.style.display = 'none';
    }

    // 3. XỬ LÝ KẾT QUẢ
    if (results.length === 0) {
        alert('Không tìm thấy nhân khẩu nào khớp với từ khóa: ' + keyword);
        return;
    }

    // TRƯỜNG HỢP A: Tìm thấy đúng 1 người -> Điền luôn vào form
    if (results.length === 1) {
        selectCitizenForAdd(results[0]);
    } 
    // TRƯỜNG HỢP B: Tìm thấy nhiều người -> Hiển thị danh sách gợi ý
    else {
        if (candidateList) {
            candidateList.style.display = 'block';
            // Style nhanh cho dropdown (nếu CSS chưa có)
            candidateList.style.border = '1px solid #ddd';
            candidateList.style.maxHeight = '200px';
            candidateList.style.overflowY = 'auto';
            candidateList.style.background = '#fff';

            results.forEach(p => {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.cursor = 'pointer';
                div.style.borderBottom = '1px solid #eee';
                
                // Hiển thị: Tên - CCCD - Ngày sinh
                const dob = p.ngaySinh ? new Date(p.ngaySinh).toLocaleDateString('vi-VN') : '?';
                div.innerHTML = `<strong>${p.hoTen}</strong> - <small>${p.cccd || 'Chưa có CCCD'}</small> (${dob})`;

                // Sự kiện khi click vào một dòng gợi ý
                div.onclick = function() {
                    selectCitizenForAdd(p); // Gọi hàm điền dữ liệu
                    candidateList.style.display = 'none'; // Ẩn danh sách đi
                };

                // Hiệu ứng hover chuột
                div.onmouseover = () => div.style.background = '#f0f0f0';
                div.onmouseout = () => div.style.background = '#fff';

                candidateList.appendChild(div);
            });
        }
    }
}

// Hàm phụ: Điền thông tin người được chọn vào vùng kết quả (Tách ra cho gọn)
function selectCitizenForAdd(person) {
    const resArea = document.getElementById('searchResultArea');
    if (!resArea) return;

    resArea.style.display = 'block';
    
    // Điền thông tin vào các ô readonly
    document.getElementById('resName').value = person.hoTen || '';
    document.getElementById('resDob').value = person.ngaySinh 
        ? new Date(person.ngaySinh).toLocaleDateString('vi-VN') 
        : '';

    // Gán ID (hoặc CCCD) vào nút "Thêm vào hộ" để gửi API sau này
    const addBtn = resArea.querySelector('.btn-success');
    if (addBtn) {
        // Kiểm tra xem dữ liệu BE trả về ID là 'id' hay 'ID'
        const personId = person.id || person.ID; 
        addBtn.setAttribute('onclick', `submitAddExistingMember('${personId}')`);
    }
}
// ==============================================
// 5. API LOAD DANH SÁCH HỘ KHẨU (đã xong)
// ==============================================
let globalHouseholdList = [];

// 2. Hàm gọi API (Chỉ chạy 1 lần khi load trang hoặc khi refresh dữ liệu)
async function loadHouseHoldList(){
    if (typeof isToPho === 'function' && isToPho()) {
        // Tìm nút mở modal thêm hộ khẩu (Dựa trên thuộc tính onclick gọi modal này)
        const addBtn = document.querySelector('button[onclick*="addHouseholdModal"]');
        if (addBtn) {
            addBtn.style.display = 'none';
        }

        // Hoặc nếu nút của bạn có ID cụ thể (ví dụ: id="btnAddHousehold"), hãy dùng dòng dưới:
        const btnById = document.getElementById('btnAddHousehold');
        if (btnById) btnById.style.display = 'none';
    }
    const tbody = document.getElementById('householdList'); 
    
    // Hiển thị loading
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center">Đang tải dữ liệu...</td></tr>';

    try {
        const response = await fetch('/api/hokhau/show');
        const data = await response.json();

        // Lưu dữ liệu vào biến toàn cục
        // Kiểm tra xem data trả về là mảng trực tiếp hay object {data: []}
        globalHouseholdList = Array.isArray(data) ? data : (data.data || []);

        // Gọi hàm vẽ bảng
        renderHouseholdTable(globalHouseholdList);

    } catch(err) {
        console.error("Lỗi tải danh sách:", err);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Lỗi kết nối server</td></tr>';
    }
}

// 3. Hàm vẽ bảng (Dùng chung cho Load và Search)
function renderHouseholdTable(dataList) {
    const tbody = document.getElementById('householdList'); 
    if (!tbody) return;

    tbody.innerHTML = ''; // Xóa trắng bảng cũ

    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không tìm thấy hộ khẩu nào</td></tr>';
        return;
    }

    dataList.forEach(hk => {
        // Lưu ý: Key phải khớp với JSON trả về từ API (dựa trên code cũ của bạn)
        // Code cũ dùng: hk['Mã hộ khẩu'], hk['Chủ hộ'], ...
        
        const maHo = hk['Mã hộ khẩu'] || hk.maHoKhau || '---';
        const chuHo = hk['Chủ hộ'] || hk.hoTenChuHo || 'Chưa có';
        const cccd = hk['CCCD'] || hk.cccdChuHo || '';
        const diaChi = hk['Địa chỉ'] || hk.diaChi || '---';
        const ngayLap = hk['Ngày lập sổ'] || hk.ngayLap;

        const isRestricted = isToPho();

    // Chỉ hiện nút "Xem chi tiết" cho Tổ phó
    // Các nút Sửa, Tách, Xóa chỉ hiện nếu KHÔNG PHẢI Tổ phó
    const actionButtons = `
        <button class="icon-btn info" onclick="openDetailModal('${maHo}')" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
        </button>
        ${!isRestricted ? `
            <button class="icon-btn primary" onclick="openEditHouseholdModal('${maHo}')" title="Sửa">
                <i class="fas fa-pen"></i>
            </button>
            <button class="icon-btn warning" onclick="openSplitModal('${maHo}')" title="Tách hộ">
                <i class="fas fa-random"></i>
            </button>
            <button class="icon-btn danger" onclick="deleteHousehold('${maHo}')" title="Xóa">
                <i class="fas fa-trash-alt"></i>
            </button>
        ` : ''}
    `;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${maHo}</strong></td>
        <td>${chuHo} <br> <small>(${cccd || '---'})</small></td>
        <td>${diaChi}</td>
        <td>${ngayLap ? new Date(ngayLap).toLocaleDateString('vi-VN') : '---'}</td>
        <td>${actionButtons}</td>
    `;
    tbody.appendChild(row);
});
}

// 4. Hàm xử lý tìm kiếm (Client-side)
function searchHouseholds() {
    const input = document.getElementById('searchHouseholdInput');
    const keyword = input.value.trim().toLowerCase();

    // Nếu ô tìm kiếm trống -> Hiển thị lại toàn bộ
    if (keyword === "") {
        renderHouseholdTable(globalHouseholdList);
        return;
    }

    // Lọc dữ liệu
    const filteredList = globalHouseholdList.filter(hk => {
        // Lấy dữ liệu từ các trường cần tìm
        // (Cần cẩn thận check null để tránh lỗi crash trang)
        const maHo = (hk['Mã hộ khẩu'] || hk.maHoKhau || "").toLowerCase();
        const tenChuHo = (hk['Chủ hộ'] || hk.hoTenChuHo || "").toLowerCase();
        const cccd = (hk['CCCD'] || hk.cccdChuHo || "").toLowerCase();

        // So sánh: Tìm theo Tên (bỏ dấu) HOẶC Mã hộ HOẶC CCCD
        return removeVietnameseTones(tenChuHo).includes(removeVietnameseTones(keyword)) ||
               maHo.includes(keyword) ||
               cccd.includes(keyword);
    });

    renderHouseholdTable(filteredList);
}

// 5. Hàm bổ trợ bỏ dấu Tiếng Việt (Nếu chưa có thì thêm vào cuối file)
function removeVietnameseTones(str) {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
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
                renderPagination(paginationContainer, result.total, page, loadTamTruData);
            }
        }
    } catch (err) {
        console.error("Lỗi tải tạm trú:", err);
    }
}

// HAm gui form Tam vang
/**
 * Hàm xử lý form Đăng ký Tạm vắng
 * Tìm form trong modal #tempAbsenceModal và gắn sự kiện submit
 */
// --- Sửa trong file household.js ---

async function submitRegisterTamVang(event) {
    event.preventDefault(); // Chặn reload trang
    
    // 1. Lấy form và nút submit để xử lý UX
    const form = document.getElementById('formTamVang');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    // 2. Lấy dữ liệu từ các Input (Đảm bảo ID trong HTML khớp với code này)
    const hoTen = document.getElementById("tvFullName").value.trim();
    const cccd = document.getElementById("tvCCCD").value.trim();
    const tuNgay = document.getElementById("tvDateFrom").value;
    const denNgay = document.getElementById("tvDateTo").value;
    const maHK = document.getElementById("tvMaHK").value.trim();
    const lyDo = document.getElementById("tvReason").value.trim();

    // 3. Validate cơ bản
    if (!hoTen || !maHK || !tuNgay || !denNgay) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc!");
        return;
    }

    if (new Date(tuNgay) > new Date(denNgay)) {
        alert("Lỗi: Ngày bắt đầu không được lớn hơn ngày kết thúc.");
        return;
    }

    // 4. Tạo Payload
    const payload = {
        "hoTenTamVang": hoTen,
        "cccd": cccd,
        "maHK": maHK,
        "thoiGianTamVang": {
            "tu": tuNgay,
            "den": denNgay
        },
        "lyDo": lyDo
    };

    // 5. Hiệu ứng đang xử lý
    submitBtn.disabled = true;
    submitBtn.innerText = "Đang xử lý...";

    try {
        // LƯU Ý: Thêm /api/ vào trước đường dẫn nếu backend quy định
        const response = await fetch('/api/tamvang/new', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            alert("Đăng ký tạm vắng thành công!");
            
            // Reset form và đóng modal
            form.reset();
            closeModal('tempAbsenceModal');
            
            // Tải lại danh sách tạm vắng để thấy dữ liệu mới
            if (typeof loadTamVangData === 'function') {
                loadTamVangData(1);
            }
        } else {
            const errorData = await response.json();
            alert("Lỗi: " + (errorData.message || "Không thể lưu dữ liệu."));
        }
    } catch (error) {
        console.error("Lỗi gửi form tạm vắng:", error);
        alert("Đã xảy ra lỗi kết nối đến máy chủ.");
    } finally {
        // Mở lại nút bấm
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    }
}

// ==============================================
// XỬ LÝ THÊM NHÂN KHẨU MỚI (TAB NHẬP MỚI)
// ==============================================

async function submitNewMember(event) {
    event.preventDefault(); // Ngăn reload trang
    
    const form = document.getElementById('memberForm');
    if (!form) {
        alert("Lỗi: Không tìm thấy form nhập liệu.");
        return;
    }

    const formData = new FormData(form);
    const v = Object.fromEntries(formData.entries());

    // 1. Kiểm tra dữ liệu bắt buộc
    if (!v.sohokhau) {
        alert("Lỗi: Không xác định được Mã hộ khẩu. Vui lòng mở lại từ danh sách hộ.");
        return;
    }
    if (!v.hoten || !v.ngaysinh) {
        alert("Vui lòng nhập Họ tên và Ngày sinh!");
        return;
    }

    // 2. Chuẩn bị Payload (Khớp với NhanKhauModel backend)
    // Lưu ý: Xử lý ngày tháng: nếu rỗng "" thì chuyển thành null
    const payload = {
        "hoTen": v.hoten,
        "bietDanh": v.bidanh,           // Backend thường dùng bietDanh hoặc biDanh
        "ngaySinh": v.ngaysinh || null,
        "gioiTinh": v.gioitinh,
        "danToc": v.dantoc,
        "tonGiao": v.tongiao,
        "nguyenQuan": v.nguyenquan,
        "noiSinh": v.noisinh,
        
        // Định danh
        "cccd": v.cccd,
        "ngayCap": v.ngaycapcccd || null, // Chuyển rỗng thành null
        "noiCap": v.noicapcccd,
        
        // Nghề nghiệp
        "ngheNghiep": v.nghenghiep,
        "noiLamViec": v.noilamviec,

        // Thông tin hộ khẩu
        "maHK": v.sohokhau,               // Backend dùng maHK hoặc maHoKhau
        "quanheChuHo": v.quanhevoichuho,  // Backend dùng quanheChuHo
        "trangThai": v.trangthai          // Thường trú / Tạm trú
    };

    console.log("Đang gửi payload thêm thành viên:", payload);

    try {
        // Gọi API thêm nhân khẩu mới
        const response = await fetch('/api/nhankhau/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Thêm thành viên mới thành công!');
            
            // Đóng modal thêm
            closeModal('addMemberModal'); 
            form.reset(); 

            // QUAN TRỌNG: Tải lại modal chi tiết hộ khẩu để thấy ngay thành viên vừa thêm
            // v.sohokhau chính là mã hộ (VD: HK001)
            if (v.sohokhau && typeof openDetailModal === 'function') {
                openDetailModal(v.sohokhau);
            }
        } else {
            const errorData = await response.json();
            alert('Thêm thất bại: ' + (errorData.message || 'Lỗi từ server'));
            console.error(errorData);
        }

    } catch (err) {
        console.error("Lỗi khi thêm nhân khẩu:", err);
        alert('Lỗi kết nối đến máy chủ.');
    }
}
// --- CÁCH SỬ DỤNG ---
// Gọi hàm này khi trang web tải xong
document.addEventListener("DOMContentLoaded", function() {
    handleKhaiBaoTamVang();
});

// --- HÀM VẼ NÚT PHÂN TRANG ---
// --- HÀM VẼ NÚT PHÂN TRANG (GENERIC - DÙNG CHUNG) ---
// loadDataCallback: Là hàm sẽ được gọi khi bấm nút (VD: loadTamTruData hoặc loadTamVangData)
function renderPagination(container, totalRecords, currentPage, loadDataCallback) {
    container.innerHTML = '';
    
    // Tính tổng số trang
    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) return;

    // --- NÚT PREV (<<) ---
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => loadDataCallback(currentPage - 1); // Gọi callback
    container.appendChild(prevBtn);

    // --- LOGIC SỐ TRANG ---
    const createPageBtn = (i) => {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => loadDataCallback(i); // Gọi callback
        container.appendChild(btn);
    };

    const createDots = () => {
        const span = document.createElement('span');
        span.className = 'btn btn-sm pagination-dots';
        span.innerText = '...';
        container.appendChild(span);
    };

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) createPageBtn(i);
    } else {
        createPageBtn(1);
        if (currentPage > 3) createDots();

        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) end = 4;
        if (currentPage >= totalPages - 2) start = totalPages - 3;

        for (let i = start; i <= end; i++) createPageBtn(i);

        if (currentPage < totalPages - 2) createDots();
        createPageBtn(totalPages);
    }

    // --- NÚT NEXT (>>) ---
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => loadDataCallback(currentPage + 1); // Gọi callback
    container.appendChild(nextBtn);
}

// --- HÀM 2: TẢI DANH SÁCH TẠM VẮNG ---
let currentTamVangPage = 1;

async function loadTamVangData(page = 1) {
    currentTamVangPage = page;
    const tbodyTamVang = document.getElementById('listTamVang');
    const paginationContainer = document.getElementById('tamVangPagination'); 

    // Hiển thị loading khi đang chờ API
    if(tbodyTamVang) tbodyTamVang.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải...</td></tr>';

    try {
        // Gọi API
        const response = await fetch(`/api/tamvang?page=${page}`); 
        const result = await response.json(); 
        
        // Log dữ liệu ra console để kiểm tra nếu cần
        console.log("Dữ liệu Tạm vắng nhận được:", result);

        if(tbodyTamVang) {
            tbodyTamVang.innerHTML = '';
            
            // Kiểm tra mảng data
            if (!result.data || result.data.length === 0) {
                tbodyTamVang.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu tạm vắng</td></tr>';
                if(paginationContainer) paginationContainer.innerHTML = '';
                return;
            }

            // Render dữ liệu
            result.data.forEach(item => {
                const row = document.createElement('tr');
                
                // 1. XỬ LÝ NGÀY THÁNG (Theo đúng key: Tu, Den)
                const tuNgay = item.Tu 
                    ? new Date(item.Tu).toLocaleDateString('vi-VN') 
                    : '---';
                const denNgay = item.Den 
                    ? new Date(item.Den).toLocaleDateString('vi-VN') 
                    : '---';

                // 2. XỬ LÝ CÁC TRƯỜNG KHÁC

                row.innerHTML = `
                    <td>${item.HoTen || 'Không tên'}</td>
                    <td>${tuNgay} <br> <small>đến ${denNgay}</small></td>
                    <td>${item.LyDo || ''}</td>
                    <td>
                        <span class="badge-status success">${item.TrangThai || 'Còn hạn'}</span>
                    </td>
                    <td class="text-center">
                        <button class="icon-btn success" onclick="confirmReturnEarly('${item.ID}')" title="Đã về trước hạn">
                            <i class="fas fa-undo-alt"></i>
                        </button>
                    </td>
                `;
                tbodyTamVang.appendChild(row);
            });

            // 3. GỌI PHÂN TRANG
            // result.total lấy từ JSON (số 1 ở ngoài cùng)
            if(paginationContainer) {
                renderPagination(paginationContainer, result.total, page, loadTamVangData);
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
        "ngaySinhNguoiDK": formData.get('ngaysinh_nguoidk'),
        "gioiTinhNguoiDK": formData.get('gioitinh_nguoidk'),
        "hoTenChuHo": formData.get('hoten_chuho'),
        "cccdChuHo": formData.get('cccd_chuho'),
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

// ==============================================
// 7. CHỈNH SỬA NHÂN KHẨU (TÁI SỬ DỤNG TỪ RESIDENT.JS)
// ==============================================

let currentEditingMemberId = null; 

// Hàm 1: Mở Modal và Load dữ liệu
async function openEditHouseholdMemberModal(id) {
    currentEditingMemberId = id; 
    const form = document.getElementById('editHouseholdMemberForm');

    try {
        const response = await fetch(`/api/nhankhau/detail/${id}`);
        const data = await response.json();

        if(!response.ok) throw new Error("Không tìm thấy dữ liệu");

        // Binding dữ liệu vào form
        form.querySelector('[name="hoten"]').value = data.hoTen || '';
        form.querySelector('[name="bidanh"]').value = data.biDanh || '';
        form.querySelector('[name="ngaysinh"]').value = data.ngaySinh ? new Date(data.ngaySinh).toISOString().split('T')[0] : '';
        form.querySelector('[name="gioitinh"]').value = data.gioiTinh || 'Nam';
        form.querySelector('[name="dantoc"]').value = data.danToc || '';
        form.querySelector('[name="nguyenquan"]').value = data.nguyenQuan || '';
        form.querySelector('[name="noisinh"]').value = data.noiSinh || '';
        
        form.querySelector('[name="cccd"]').value = data.cccd || '';
        form.querySelector('[name="ngaycapcccd"]').value = data.ngayCap ? new Date(data.ngayCap).toISOString().split('T')[0] : '';
        form.querySelector('[name="noicapcccd"]').value = data.noiCap || '';
        
        form.querySelector('[name="nghenghiep"]').value = data.ngheNghiep || '';
        form.querySelector('[name="noilamviec"]').value = data.noiLamViec || '';
        
        form.querySelector('[name="sohokhau"]').value = data.maHoKhau || '';
        form.querySelector('[name="quanhevoichuho"]').value = data.quanHeVoiChuHo || '';

        form.querySelector('[name="trangthai"]').value = data.trangThai || 'Thường trú';
        form.querySelector('[name="tongiao"]').value = data.tonGiao || 'Không';

        openModal('editHouseholdMemberModal');

    } catch (err) {
        console.error("Lỗi lấy thông tin sửa:", err);
        alert("Không thể tải thông tin người này.");
    }
}

// Hàm 2: Gửi API Cập nhật
async function updateHouseholdMember(event) {
    event.preventDefault(); 
    
    if (!currentEditingMemberId) return;

    const form = document.getElementById('editHouseholdMemberForm');
    const formData = new FormData(form);
    const v = Object.fromEntries(formData.entries());

    // Payload (Khớp với resident.js và Model)
    const payload = {
        "hoTen": v.hoten,
        "biDanh": v.bidanh,
        "ngaySinh": v.ngaysinh,
        "gioiTinh": v.gioitinh,
        "danToc": v.dantoc,
        "nguyenQuan": v.nguyenquan,
        "noiSinh": v.noisinh,
        "cccd": v.cccd,
        "ngayCapCCCD": v.ngaycapcccd,
        "noiCapCCCD": v.noicapcccd,
        "ngheNghiep": v.nghenghiep,
        "noiLamViec": v.noilamviec,
        "quanHeVoiChuHo": v.quanhevoichuho,
        "maHoKhau": v.sohokhau,
        "trangThai": v.trangthai,
        "tonGiao": v.tongiao,
    };

    try {
        const response = await fetch(`/api/nhankhau/update/${currentEditingMemberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Cập nhật thông tin thành công!');
            closeModal('editHouseholdMemberModal');
            // Tải lại chi tiết hộ khẩu để thấy thay đổi
            const hkCode = v.sohokhau; 
            if(hkCode) openDetailModal(hkCode); 
            
        } else {
            const err = await response.json();
            alert('Lỗi: ' + (err.message || 'Cập nhật thất bại'));
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi server khi cập nhật');
    }
}

// Hàm 3: Xóa thành viên khỏi hộ khẩu
async function deleteMemberFromHousehold(hkId, memberId) {
    if (!confirm(`Bạn có chắc muốn xóa thành viên này khỏi hộ ${hkId}?`)) {
        return;
    }
    try {
        const response = await fetch(`/api/hokhau/${hkId}/${memberId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Đã xóa thành viên thành công!");
            // Reload lại modal chi tiết để thấy danh sách mới
            openDetailModal(hkId);
        } else {
            const err = await response.json();
            alert("Lỗi: " + (err.message || "Không thể xóa thành viên."));
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Lỗi kết nối đến server.");
    }
}

/*==============================================
    Load nhan khau phuc vu cho tim kiem
===============================================*/
// 1. Biến lưu trữ danh sách nhân khẩu (Cache)
let cachedCitizenList = [];

// 2. Hàm tải danh sách nhân khẩu (Chỉ gọi khi cần)
async function fetchAllCitizensForLookup() {
    // Nếu đã có dữ liệu rồi thì không gọi API nữa (đỡ lag)
    if (cachedCitizenList.length > 0) return;

    try {
        const response = await fetch('/api/nhankhau/show');
        const data = await response.json();
        // Lưu vào biến toàn cục
        cachedCitizenList = Array.isArray(data) ? data : (data.data || []);
        console.log("Đã tải xong danh sách nhân khẩu để tra cứu!");
    } catch (err) {
        console.error("Lỗi tải danh sách nhân khẩu:", err);
    }
}

// --- Sửa lại trong file household.js ---

async function submitAddExistingMember(personId) {
    // 1. Lấy vùng chứa các input kết quả (để select cho chính xác)
    const resultArea = document.getElementById('searchResultArea');
    
    if (!resultArea) {
        console.error("Không tìm thấy vùng nhập liệu kết quả");
        return;
    }

    // 2. Lấy giá trị từ các ô input
    // Lưu ý: Select kỹ để tránh nhầm với các input ở tab khác
    const maHoKhau = resultArea.querySelector('input[name="sohokhau_search"]').value.trim();
    
    // Tìm ô nhập quan hệ (Dựa vào placeholder hoặc vị trí nếu chưa có ID)
    const quanHe = document.getElementById('inputQuanHeMoi').value.trim();
    
    const trangThai = resultArea.querySelector('select').value;

    // Validate
    if (!quanHe) {
        alert("Vui lòng nhập quan hệ với chủ hộ!");
        if(quanHeInput) quanHeInput.focus();
        return;
    }
    if (!maHoKhau) {
        alert("Lỗi: Không xác định được mã hộ khẩu.");
        return;
    }

    // 3. Tạo Payload (Chỉ chứa các trường cần update)
    // Tên Key phải khớp với dbMap trong nhanKhauModel.js
    const payload = {
        maHoKhau: maHoKhau,       // Model map sang: sohokhau
        quanHeVoiChuHo: quanHe,   // Model map sang: quanhevoichuho
        trangThai: trangThai      // Model map sang: trangthai
    };

    console.log("Đang gửi PATCH payload:", payload);

    try {
        // 4. Gọi API PATCH
        const response = await fetch(`/api/nhankhau/update/${personId}`, {
            method: 'PATCH',  // <--- QUAN TRỌNG: Đã đổi từ PUT sang PATCH
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Đã thêm thành viên vào hộ thành công!");
            closeModal('addMemberModal');
            
            // 5. Reset form để lần sau mở lại sạch sẽ
            document.getElementById('addMemberSearchForm').reset();
            if(document.getElementById('candidateList')) {
                document.getElementById('candidateList').style.display = 'none';
            }
            if(document.getElementById('searchResultArea')) {
                document.getElementById('searchResultArea').style.display = 'none';
            }

            // 6. Reload lại modal chi tiết hộ khẩu để thấy thành viên mới
            if (typeof openDetailModal === 'function') {
                openDetailModal(maHoKhau);
            }
        } else {
            const err = await response.json();
            alert("Lỗi: " + (err.message || "Thêm thất bại"));
        }

    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối server");
    }
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