// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
const db = {
    info: { year: 2018, area_total: 822, area_build: 480 },
    rooms: [
        { name: 'Hội trường Tầng 1', desc: 'Sức chứa 300 người, có sân khấu' },
        { name: 'Phòng CLB Tầng 2', desc: 'Sinh hoạt người cao tuổi' },
        { name: 'Phòng Đọc sách', desc: 'Thư viện nhỏ cho thiếu nhi' }
    ],
    assets: [
        { id: 'TS01', name: 'Bàn Hội trường', qty: 20, status: 'Tốt', place:'Hội trường tầng 1' },
        { id: 'TS02', name: 'Ghế nhựa', qty: 150, status: 'Cũ', place:'Hội trường tầng 1' },
        { id: 'TS03', name: 'Loa đài', qty: 1, status: 'Đang hỏng' , place: 'Phòng CLB Tầng 2'}
    ],
    events: [
        { title: 'Họp Tổ dân phố', time: '25/12 19:00', loc: 'Hội trường T1' }
    ]
};

// --- HÀM KHỞI TẠO CHUNG ---
function initNVH() {
    console.log("Bắt đầu khởi tạo Nhà Văn Hóa...");
    if (!document.getElementById('generalInfo')) return;
    loadOverview();
    loadAssets();
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

function loadAssets() {
    const rows = db.assets.map(a => `
        <tr>
            <td>${a.id}</td>
            <td><strong>${a.name}</strong></td>
            <td>${a.qty}</td>
            <td><span style="color:${a.status === 'Tốt' ? 'green' : 'red'}">${a.status}</span></td>
            <td>${a.place}</td>
            <td>
                <button class="btn-primary" 
                    onclick="openEditModal('${a.id}')" 
                    style="padding:5px 10px; font-size:12px; margin-right:5px;">Sửa</button>
                <button class="btn-delete" 
                    onclick="deleteAsset('${a.id}')" 
                    style="padding:5px 10px; font-size:12px;">Xóa</button>
            </td>
        </tr>
    `).join('');
    document.getElementById('assetTableBody').innerHTML = rows;
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
function deleteAsset(id) {
    if (confirm('Bạn có chắc chắn muốn xóa tài sản có mã ' + id + ' không?')) {
        db.assets = db.assets.filter(item => item.id !== id);
        loadAssets();
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

function loadEventList() {
    const list = document.getElementById('upcomingList');
    if (db.events.length === 0) {
        list.innerHTML = '<li class="empty-state">Chưa có lịch nào</li>';
        return;
    }
    
    list.innerHTML = db.events.map(e => `
        <li class="event-item">
            <span class="event-time"><i class="far fa-clock"></i> ${e.time}</span>
            <span class="event-title">${e.title}</span>
            <span class="event-loc"><i class="fas fa-map-marker-alt"></i> ${e.loc}</span>
        </li>
    `).join('');
}

function populateRoomSelect() {
    const select = document.getElementById('evtRoom');
    select.innerHTML = db.rooms.map(r => `<option>${r.name}</option>`).join('');
}

function saveActivity() {
    const name = document.getElementById('evtName').value;
    const start = document.getElementById('evtStart').value;
    const end = document.getElementById('evtEnd').value;
    
    if(!name || !start || !end) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    const formatTime = (isoStr) => {
        const d = new Date(isoStr);
        return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
    }

    db.events.push({
        title: name,
        time: `${formatTime(start)} - ${formatTime(end)}`,
        loc: document.getElementById('evtRoom').value
    });

    alert('Đã lưu lịch thành công!');
    loadEventList();
    document.getElementById('evtName').value = '';
}
