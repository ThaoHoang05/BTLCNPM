// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
const db = {
    info: { year: 2018, area_total: 822, area_build: 480 },
    rooms: [
        { name: 'Hội trường Tầng 1', desc: 'Sức chứa 300 người, có sân khấu' },
        { name: 'Phòng CLB Tầng 2', desc: 'Sinh hoạt người cao tuổi' },
        { name: 'Phòng Đọc sách', desc: 'Thư viện nhỏ cho thiếu nhi' }
    ],
    assets: [
        { id: 'TS01', name: 'Bàn Hội trường', qty: 20, status: 'Tốt' },
        { id: 'TS02', name: 'Ghế nhựa', qty: 150, status: 'Cũ' },
        { id: 'TS03', name: 'Loa đài', qty: 1, status: 'Đang hỏng' }
    ],
    events: [
        { title: 'Họp Tổ dân phố', time: '25/12 19:00', loc: 'Hội trường T1' }
    ]
};



// --- HÀM 1: CHUYỂN TAB (Sửa lỗi switchTab is not defined) ---
function switchTab(tabId, btnElement) {
    // 1. Ẩn tất cả tab-content
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // 2. Bỏ active của tất cả nút tab
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
    });

    // 3. Hiện tab được chọn
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    }

    // 4. Active nút vừa bấm
    if (btnElement) {
        btnElement.classList.add('active');
    }
}

// --- CÁC HÀM LOAD DỮ LIỆU ---
function loadOverview() {
    // Load chỉ số
    const statsHtml = `
        <div class="stat-card"><span>Năm sử dụng</span><b>${db.info.year}</b></div>
        <div class="stat-card"><span>DT Khuôn viên</span><b>${db.info.area_total} m²</b></div>
        <div class="stat-card"><span>DT Xây dựng</span><b>${db.info.area_build} m²</b></div>
    `;
    document.getElementById('generalInfo').innerHTML = statsHtml;

    // Load danh sách phòng
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
            <td><button class="btn-primary" style="padding:5px 10px; font-size:12px;">Sửa</button></td>
        </tr>
    `).join('');
    document.getElementById('assetTableBody').innerHTML = rows;
}

function loadEventList() {
    const list = document.getElementById('upcomingList');
    if (db.events.length === 0) {
        list.innerHTML = '<li class="empty-state" style="padding:15px; color:#999; text-align:center;">Chưa có lịch nào</li>';
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

// --- HÀM LƯU FORM ---
function saveActivity() {
    const name = document.getElementById('evtName').value;
    const start = document.getElementById('evtStart').value;
    const end = document.getElementById('evtEnd').value;
    
    if(!name || !start || !end) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    // Format ngày giờ đơn giản để hiển thị
    const formatTime = (isoStr) => {
        const d = new Date(isoStr);
        return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
    }

    // Thêm vào dữ liệu giả
    db.events.push({
        title: name,
        time: `${formatTime(start)} - ${formatTime(end)}`,
        loc: document.getElementById('evtRoom').value
    });

    alert('Đã lưu lịch thành công!');
    loadEventList(); // Render lại danh sách
    
    // Reset form
    document.getElementById('evtName').value = '';
}

// Trong file nvh.js
function initNVH() {
    console.log("Bắt đầu khởi tạo Nhà Văn Hóa...");
    
    // Kiểm tra xem thẻ HTML đã có chưa
    if (!document.getElementById('generalInfo')) {
        console.error("Lỗi: Chưa tìm thấy thẻ HTML id='generalInfo'. Kiểm tra lại việc load file HTML.");
        return;
    }

    loadOverview();
    loadAssets();
    loadEventList();
    populateRoomSelect();
}
// ... Các hàm khác giữ nguyên ...