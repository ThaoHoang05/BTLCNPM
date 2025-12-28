// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
const db = {
    info: { year: 2018, area_total: 822, area_build: 480 },
    rooms: [
        { name: 'Hội trường Tầng 1', desc: 'Sức chứa 300 người, có sân khấu' },
        { name: 'Phòng CLB Tầng 2', desc: 'Sinh hoạt người cao tuổi' },
        { name: 'Phòng Đọc sách', desc: 'Thư viện nhỏ cho thiếu nhi' }
    ]
};

// --- HÀM KHỞI TẠO CHUNG ---
function initNVH() {
    console.log("Bắt đầu khởi tạo Nhà Văn Hóa...");
    
    // Đảm bảo db.assets tồn tại để tránh lỗi undefined trước khi fetch xong
    if (!db.assets) db.assets = [];

    if (!document.getElementById('generalInfo')) return;
    
    loadOverview();

    fetchAssetList(); 
    
    loadEventList();
    populateRoomSelect();
}

// --- HÀM XỬ LÝ TAB ---
function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (btnElement) btnElement.classList.add('active');
}

// --- CÁC HÀM LOAD DỮ LIỆU ---
// Hàm mới: Tải danh sách tài sản từ Server
async function fetchAssetList() {
    // 1. Hiển thị trạng thái đang tải (trong bảng của Modal)
    const tableBody = document.getElementById('assetTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Đang tải dữ liệu từ máy chủ...</td></tr>';
    }

    // Hiển thị trạng thái đang tải (trên Dashboard bên ngoài)
    const elTotal = document.getElementById('summary_total');
    if (elTotal) elTotal.innerText = '...';

    try {
        // 2. Gọi API
        const response = await fetch('/api/nvh/asset');
        
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const resData = await response.json();

        // 3. Kiểm tra payload
        if (resData.status === 'success' && Array.isArray(resData.data)) {
            
            // MAP DỮ LIỆU: DB -> Frontend
            db.assets = resData.data.map(item => ({
                id: String(item.maTS),
                name: item.tenTS,
                qty: item.SL,
                status: item.tinhTrang,
                place: item.viTri
            }));

            // --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---
            
            // Bước A: Tính toán và hiển thị số liệu ra 3 thẻ trên Dashboard
            updateDashboardSummary(); 

            // Bước B: Render bảng dữ liệu (để sẵn sàng hiển thị khi mở Modal)
            // Chỉ cần gọi hàm này, nó sẽ tự vẽ vào bảng trong Modal
            loadAssets(); 

        } else {
            console.error("Dữ liệu trả về không đúng định dạng:", resData);
            if(tableBody) tableBody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Lỗi cấu trúc dữ liệu</td></tr>';
        }

    } catch (error) {
        console.error("Không thể tải danh sách tài sản:", error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Lỗi kết nối: ${error.message}</td></tr>`;
        }
    }
}

function loadAssets() {
    if (!db.assets) return;

    const rows = db.assets.map(a => `
        <tr>
            <td>${a.id}</td>
            <td><strong>${a.name}</strong></td>
            <td>${a.qty}</td>
            <td><span style="color:${a.status === 'Tốt' ? 'green' : 'red'}">${a.status}</span></td>
            <td>${a.place}</td>
            <td>
                <button class="btn-primary" 
                    onclick="openInspectModal('${a.id}', '${a.name}', ${a.qty})" 
                    style="padding:5px 8px; font-size:12px; background-color:#28a745; border-color:#28a745;" 
                    title="Kiểm kê tài sản này">
                    <i class="fas fa-clipboard-check"></i> KK
                </button>

                <button class="btn-primary" 
                    onclick="openEditModal('${a.id}')" 
                    style="padding:5px 8px; font-size:12px; margin: 0 3px;">Sửa</button>
                <button class="btn-delete" 
                    onclick="deleteAsset('${a.id}')" 
                    style="padding:5px 8px; font-size:12px;">Xóa</button>
            </td>
        </tr>
    `).join('');
    
    const tableBody = document.getElementById('assetTableBody');
    if (tableBody) tableBody.innerHTML = rows;
}

function loadOverview() {
    const statsHtml = `
        <div class="stat-card"><span>Năm sử dụng</span><b>${db.info.year}</b></div>
        <div class="stat-card"><span>DT Khuôn viên</span><b>${db.info.area_total} m²</b></div>
        <div class="stat-card"><span>DT Xây dựng</span><b>${db.info.area_build} m²</b></div>
    `;
    document.getElementById('generalInfo').innerHTML = statsHtml;

    const roomsHtml = db.rooms.map(r => `
        <div class="room-item">
            <div style="font-weight:bold; color:#2c3e50">${r.name}</div>
            <div style="font-size:13px; color:#666; margin-top:5px">${r.desc}</div>
        </div>
    `).join('');
    document.getElementById('roomList').innerHTML = roomsHtml;
}

// --- LOGIC MODAL TÀI SẢN (THÊM & SỬA - DÙNG CHUNG) ---

// 1. Hàm mở Modal để THÊM MỚI
function openAddModal() {
    document.getElementById('asset_id').value = ''; // ID rỗng = Thêm mới
    document.getElementById('asset_name').value = '';
    document.getElementById('asset_qty').value = '1';
    document.getElementById('asset_status').value = 'Tốt';
    document.getElementById('asset_place').value = '';
    
    document.getElementById('modalTitle').innerText = 'Thêm mới tài sản';
    document.getElementById('modalAsset').classList.add('show');
}

// 2. Hàm mở Modal để SỬA
function openEditModal(id) {
    const asset = db.assets.find(item => item.id === id);
    if (!asset) return;

    document.getElementById('asset_id').value = asset.id;
    document.getElementById('asset_name').value = asset.name;
    document.getElementById('asset_qty').value = asset.qty;
    document.getElementById('asset_status').value = asset.status;
    document.getElementById('asset_place').value = asset.place;

    document.getElementById('modalTitle').innerText = 'Cập nhật tài sản: ' + id;
    document.getElementById('modalAsset').classList.add('show');
}

// 3. Hàm Đóng Modal (Đã sửa lỗi)
function closeModal() {
    // Chỉ cần tìm đúng ID modalAsset và ẩn nó đi
    const modal = document.getElementById('modalAsset');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 4. Hàm LƯU (Xử lý chung)
function saveAsset() {
    const id = document.getElementById('asset_id').value;
    const name = document.getElementById('asset_name').value;
    const qty = document.getElementById('asset_qty').value;
    const status = document.getElementById('asset_status').value;
    const place = document.getElementById('asset_place').value;

    if (!name) {
        alert("Vui lòng nhập tên tài sản!");
        return;
    }

    if (id) {
        // SỬA
        const index = db.assets.findIndex(item => item.id === id);
        if (index !== -1) {
            db.assets[index] = { ...db.assets[index], name, qty, status, place };
        }
    } else {
        // THÊM MỚI
        const newId = 'TS' + Math.floor(Math.random() * 10000); 
        const newAsset = { id: newId, name, qty, status, place };
        db.assets.push(newAsset);
    }

    loadAssets();
    closeModal();
}

// 5. Hàm Xóa Tài sản
async function deleteAsset(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa tài sản có mã ' + id + ' không?')) return;

    try {
        const response = await fetch(`/api/nvh/asset/${id}`, {
            method: 'DELETE'
        });
        
        const resData = await response.json();

        if (response.ok && resData.status === 'success') {
            alert('Xóa thành công!');
            // Load lại danh sách mới nhất từ server
            fetchAssetList(); 
        } else {
            alert('Lỗi: ' + (resData.message || 'Không thể xóa'));
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi kết nối khi xóa');
    }
}

// 6. Sự kiện Click ra ngoài để đóng Modal
window.onclick = function(event) {
    const modal = document.getElementById('modalAsset');
    if (event.target == modal) {
        closeModal();
    }
}


// --- CÁC HÀM KHÁC (Lịch hoạt động...) ---

async function loadEventList() {
    const list = document.getElementById('upcomingList');
    list.innerHTML = '<li class="loading">Đang tải...</li>';

    try {
        const response = await fetch('/api/nvh/HDchung');
        if (!response.ok) throw new Error('Lỗi tải lịch');

        const events = await response.json();

        if (events.length === 0) {
            list.innerHTML = '<li class="empty-state">Chưa có lịch hoạt động sắp tới</li>';
            return;
        }

        // Hàm format ngày giờ
        const formatTime = (isoStr) => {
            const d = new Date(isoStr);
            return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        };

        list.innerHTML = events.map(e => `
            <li class="event-item">
                <span class="event-time"><i class="far fa-clock"></i> ${formatTime(e.thoiGian.tu)}</span>
                <span class="event-title">${e.tenHD}</span>
                <span class="event-loc"><i class="fas fa-map-marker-alt"></i> ${e.phong}</span>
            </li>
        `).join('');

    } catch (error) {
        console.error(error);
        list.innerHTML = '<li class="error-state">Không thể tải dữ liệu</li>';
    }
}

async function populateRoomSelect() {
    const select = document.getElementById('evtRoom');
    
    try {
        // Gọi API lấy phòng thật từ DB
        const response = await fetch('/api/nvh/rooms');
        if (!response.ok) throw new Error('Lỗi tải phòng');
        
        const rooms = await response.json();
        
        // Render thẻ option có value là ID (phongid)
        select.innerHTML = rooms.map(r => 
            `<option value="${r.phongid}">${r.tenphong}</option>`
        ).join('');
        
    } catch (error) {
        console.error(error);
        // Fallback nếu lỗi: dùng tạm hardcode khớp với DB của bạn
        select.innerHTML = `
            <option value="1">Hội Trường Lớn</option>
            <option value="2">Phòng Sinh Hoạt Cộng Đồng</option>
            <option value="3">Phòng Đa Năng</option>
            <option value="4">Phòng Thiết Bị</option>
            <option value="5">Phòng Sinh hoạt Thanh niên</option>
            <option value="6">Phòng Nghiên cứu & Tài liệu</option>
        `;
    }
}

async function saveActivity() {
    const name = document.getElementById('evtName').value;
    const start = document.getElementById('evtStart').value;
    const end = document.getElementById('evtEnd').value;
    const roomId = document.getElementById('evtRoom').value;
    const note = document.getElementById('evtNote').value;
    
    // Validate cơ bản
    if(!name || !start || !end || !roomId) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    const payload = {
        tenHD: name,
        phong: roomId,
        thoiGian: {
            tu: start,
            den: end
        },
        ghiChu: note || "Tạo bởi Admin"
    };

    const btn = document.querySelector('.form-actions .btn-primary'); 
    if (!btn) {
        console.error("Không tìm thấy nút lưu trong HTML!");
        return;
    }
    const oldText = btn.innerText;
    btn.innerText = "Đang lưu...";
    btn.disabled = true;

    try {
        const response = await fetch('/api/nvh/HDchung/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (response.ok) {
            alert('Đã thêm lịch hoạt động thành công!');
            // Reset form
            document.getElementById('evtName').value = '';
            document.getElementById('evtStart').value = '';
            document.getElementById('evtEnd').value = '';
            document.getElementById('evtRoom').value = '';
            document.getElementById('evtNote').value = '';
            
            // Load lại danh sách
            loadEventList();
        } else {
            alert('Lỗi: ' + (resData.message || 'Không thể thêm lịch'));
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi kết nối server');
    } finally {
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

// ==============================================
// LOGIC MODAL BÁO CÁO / THỐNG KÊ
// ==============================================

// 1. Mở Modal
function openReportModal() {
    const modal = document.getElementById('modalReport');
    if (!modal) return;

    // Mặc định chọn tháng hiện tại
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7); // Format: YYYY-MM
    const dateInput = document.getElementById('reportDateInput');
    
    if (dateInput && !dateInput.value) {
        dateInput.value = monthStr;
    }

    modal.classList.add('show');
    loadReportData(); // Tải dữ liệu ngay khi mở
}

// 2. Đóng Modal
function closeReportModal() {
    const modal = document.getElementById('modalReport');
    if (modal) modal.classList.remove('show');
}

// 3. Gọi API lấy dữ liệu báo cáo
async function loadReportData() {
    const dateVal = document.getElementById('reportDateInput').value; // YYYY-MM
    if (!dateVal) return;

    const [year, month] = dateVal.split('-');
    const tbody = document.getElementById('reportHistoryBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Đang tải dữ liệu...</td></tr>';

    try {
        const response = await fetch(`/api/nvh/report?month=${month}&year=${year}`);
        const resData = await response.json();

        if (resData.status === 'success') {
            const { summary, history } = resData.data;

            // A. Cập nhật thẻ thống kê (Tổng quan)
            // Lưu ý: Backend trả về string nên cần ép kiểu số hoặc để nguyên hiển thị
            document.getElementById('rp_total').innerText = summary.total || 0;
            document.getElementById('rp_good').innerText = summary.tot || 0;
            document.getElementById('rp_bad').innerText = summary.hong || 0;

            // B. Cập nhật bảng lịch sử kiểm tra
            if (history.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có đợt kiểm tra nào trong tháng này.</td></tr>';
            } else {
                tbody.innerHTML = history.map(h => {
                    const d = new Date(h.ngaykiemtra);
                    const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
                    return `
                        <tr>
                            <td>${dateStr}</td>
                            <td><strong>${h.tentaisan}</strong></td>
                            <td>${h.soluongthucte}</td>
                            <td>${h.tinhtrang} <br><i style="font-size:11px; color:#666">${h.ghichu || ''}</i></td>
                            <td>${h.canbo}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error("Lỗi load báo cáo:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center">Lỗi kết nối server</td></tr>';
    }
}

// 4. Chức năng In báo cáo (Cơ bản)
function printReport() {
    const printContent = document.querySelector('#modalReport .modal-body').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
        <h2 style="text-align:center; margin-bottom:20px;">BÁO CÁO TÌNH HÌNH CƠ SỞ VẬT CHẤT</h2>
        <p style="text-align:center;">Tháng: ${document.getElementById('reportDateInput').value}</p>
        <hr>
        ${printContent}
    `;
    
    window.print();
    
    // Khôi phục lại giao diện sau khi in
    document.body.innerHTML = originalContent;
    // Cần gán lại sự kiện hoặc reload trang để JS hoạt động lại (Cách đơn giản nhất: reload)
    window.location.reload(); 
}

// Thêm sự kiện click ra ngoài để đóng modal báo cáo
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalReport');
    if (event.target == modal) {
        closeReportModal();
    }
});

// ==============================================
// LOGIC KIỂM KÊ (NHẬP LIỆU BÁO CÁO)
// ==============================================

// 1. Mở form kiểm kê
function openInspectModal(id, name, currentQty) {
    document.getElementById('insp_asset_id').value = id;
    document.getElementById('insp_asset_name').value = name;
    document.getElementById('insp_qty').value = currentQty; // Mặc định điền số lượng hiện tại
    document.getElementById('insp_status').value = 'Tốt';
    document.getElementById('insp_note').value = '';

    const modal = document.getElementById('modalInspect');
    if (modal) modal.classList.add('show');
}

// 2. Đóng form
function closeInspectModal() {
    const modal = document.getElementById('modalInspect');
    if (modal) modal.classList.remove('show');
}

// 3. Lưu kết quả vào DB
async function saveInspection() {
    const id = document.getElementById('insp_asset_id').value;
    const sl = document.getElementById('insp_qty').value;
    const tinhTrang = document.getElementById('insp_status').value;
    const ghiChu = document.getElementById('insp_note').value;

    if (!sl) return alert("Vui lòng nhập số lượng thực tế!");

    try {
        const response = await fetch('/api/nvh/inspection/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, sl, tinhTrang, ghiChu })
        });

        const resData = await response.json();

        if (response.ok) {
            alert("Đã lưu phiếu kiểm tra thành công!");
            closeInspectModal();
            
            // Tùy chọn: Nếu tình trạng thay đổi, bạn có thể muốn load lại danh sách tài sản
            // fetchAssetList(); 
        } else {
            alert("Lỗi: " + resData.message);
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server");
    }
}

function openAssetManagerModal() {
    const modal = document.getElementById('modalAssetManager');
    if (modal) {
        modal.classList.add('show');
        // Khi mở modal thì mới gọi hàm load bảng chi tiết
        loadAssets(); 
    }
}

function closeAssetManagerModal() {
    const modal = document.getElementById('modalAssetManager');
    if (modal) {
        modal.classList.remove('show');
    }
    // Khi đóng modal, cập nhật lại số liệu tóm tắt bên ngoài tab Assets
    updateDashboardSummary();
}

// --- 2. HÀM TÍNH SỐ LIỆU TÓM TẮT (HIỆN Ở TAB BÊN NGOÀI) ---

function updateDashboardSummary() {
    // Nếu chưa có dữ liệu thì thoát (hoặc hiện 0)
    if (!db.assets) return;

    const total = db.assets.length;
    const good = db.assets.filter(a => a.status === 'Tốt').length;
    const bad = total - good; // Các trạng thái khác Tốt coi như cần xử lý

    // Gán vào HTML bên ngoài
    const elTotal = document.getElementById('summary_total');
    const elGood = document.getElementById('summary_good');
    const elBad = document.getElementById('summary_bad');

    if(elTotal) elTotal.innerText = total;
    if(elGood) elGood.innerText = good;
    if(elBad) elBad.innerText = bad;
}

// Sự kiện click ra ngoài để đóng modal kiểm kê
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalInspect');
    if (event.target == modal) closeInspectModal();
});