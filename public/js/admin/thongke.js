let myChartInstance = null;

// Khởi tạo mặc định khi load trang
document.addEventListener('DOMContentLoaded', () => {
    handlePeriodTypeChange(); // Render input thời gian ban đầu
    // Tự động load thống kê mặc định (VD: Năm hiện tại)
    fetchAndRenderStats();
});

// 1. Xử lý UI: Thay đổi input nhập liệu dựa trên Tháng/Quý/Năm
function handlePeriodTypeChange() {
    const type = document.getElementById('periodType').value;
    const container = document.getElementById('dynamicTimeInput');
    let html = '<label>Chọn giá trị:</label>';

    if (type === 'Tháng') {
        // Input dạng tháng (YYYY-MM)
        html += `<input type="month" id="timeValue" class="form-control" value="${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}">`;
    } else if (type === 'Quý') {
        // Dropdown Quý và Input Năm
        html += `
            <div style="display:flex; gap:5px;">
                <select id="timeQuarter" class="form-control">
                    <option value="Q1">Quý 1</option>
                    <option value="Q2">Quý 2</option>
                    <option value="Q3">Quý 3</option>
                    <option value="Q4">Quý 4</option>
                </select>
                <input type="number" id="timeYear" class="form-control" value="${new Date().getFullYear()}" placeholder="Năm">
            </div>`;
    } else {
        // Input Năm
        html += `<input type="number" id="timeValue" class="form-control" value="${new Date().getFullYear()}">`;
    }
    container.innerHTML = html;
}

// 2. Logic lấy giá trị thời gian chuẩn hóa để gửi xuống DB
function getTimeString() {
    const type = document.getElementById('periodType').value;
    if (type === 'Tháng') {
        const val = document.getElementById('timeValue').value; // "2025-12"
        if(!val) return '';
        const [y, m] = val.split('-');
        return `${m}/${y}`; // Định dạng lưu trong DB: "12/2025"
    } else if (type === 'Quý') {
        const q = document.getElementById('timeQuarter').value;
        const y = document.getElementById('timeYear').value;
        return `${q}/${y}`; // "Q4/2025"
    } else {
        return document.getElementById('timeValue').value; // "2025"
    }
}

// 3. Hàm chính: Gọi API và vẽ lại giao diện
function fetchAndRenderStats() {
    const reportType = document.getElementById('reportType').value;
    const periodType = document.getElementById('periodType').value;
    const timeString = getTimeString();

    if (!timeString) {
        alert("Vui lòng chọn thời gian hợp lệ!");
        return;
    }

    console.log(`Đang lấy báo cáo: ${reportType} - ${periodType} - ${timeString}`);

    // MOCK DATA: Giả lập dữ liệu trả về từ Database tương ứng với SQL đã cung cấp
    const mockData = getMockDataFromDB(reportType, periodType, timeString);

    // Cập nhật Cards
    updateCards(reportType, mockData.summary);

    // Vẽ biểu đồ
    renderChart(reportType, mockData.summary);

    // Vẽ bảng chi tiết
    renderTable(reportType, mockData.details);
}

// 4. Cập nhật thẻ Card thống kê
function updateCards(type, data) {
    if (type === 'gioi_tinh') {
        setCardData('Tổng nhân khẩu', data.tong_so, 'Nam', data.so_nam, 'Nữ', data.so_nu);
    } else if (type === 'do_tuoi') {
        // Cộng dồn một số nhóm tiêu biểu
        const treEm = data.mam_non_mau_giao + data.cap_1 + data.cap_2 + data.cap_3;
        setCardData('Độ tuổi lao động', data.do_tuoi_lao_dong, 'Trẻ em/Học sinh', treEm, 'Nghỉ hưu', data.nghi_huu);
    } else if (type === 'cu_tru') {
        setCardData('Tạm trú', data.dang_tam_tru, 'Tạm vắng', data.dang_tam_vang, 'Thường trú', 'N/A'); 
    } else if (type === 'bien_dong') {
        setCardData('Mới nhập khẩu', data.so_them_moi, 'Chuyển đi', data.so_chuyen_di, 'Qua đời', data.so_qua_doi);
    }
}

function setCardData(l1, v1, l2, v2, l3, v3) {
    document.getElementById('lblCard1').innerText = l1;
    document.getElementById('valCard1').innerText = v1;
    document.getElementById('lblCard2').innerText = l2;
    document.getElementById('valCard2').innerText = v2;
    document.getElementById('lblCard3').innerText = l3;
    document.getElementById('valCard3').innerText = v3;
}

// 5. Vẽ Biểu đồ
function renderChart(type, data) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (myChartInstance) myChartInstance.destroy();

    let labels, values, chartType, colors, labelName;

    if (type === 'gioi_tinh') {
        chartType = 'pie';
        labels = ['Nam', 'Nữ'];
        values = [data.so_nam, data.so_nu];
        colors = ['#36b9cc', '#e74a3b'];
        labelName = 'Giới tính';
    } else if (type === 'do_tuoi') {
        chartType = 'bar';
        labels = ['Mầm non', 'Cấp 1', 'Cấp 2', 'Cấp 3', 'Lao động', 'Nghỉ hưu'];
        // Khớp với các cột trong bảng Thong_ke_do_tuoi
        values = [data.mam_non_mau_giao, data.cap_1, data.cap_2, data.cap_3, data.do_tuoi_lao_dong, data.nghi_huu];
        colors = '#4e73df';
        labelName = 'Số lượng người';
    } else if (type === 'cu_tru') {
        chartType = 'doughnut';
        labels = ['Tạm trú', 'Tạm vắng'];
        values = [data.dang_tam_tru, data.dang_tam_vang];
        colors = ['#f6c23e', '#858796'];
        labelName = 'Hồ sơ';
    } else if (type === 'bien_dong') {
        chartType = 'bar';
        labels = ['Thêm mới', 'Chuyển đi', 'Qua đời', 'Thay đổi TT'];
        values = [data.so_them_moi, data.so_chuyen_di, data.so_qua_doi, data.so_thay_doi_thong_tin];
        colors = ['#1cc88a', '#e74a3b', '#5a5c69', '#f6c23e'];
        labelName = 'Số lượng hồ sơ';
    }

    myChartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: labelName,
                data: values,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// 6. Render Bảng chi tiết
function renderTable(type, list) {
    const thead = document.getElementById('tableHeader');
    const tbody = document.getElementById('tableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Định nghĩa cột cho bảng dựa trên loại báo cáo
    let columns = [];
    if (type === 'gioi_tinh') columns = ['Họ Tên', 'Ngày Sinh', 'Giới Tính', 'Địa Chỉ'];
    else if (type === 'do_tuoi') columns = ['Họ Tên', 'Ngày Sinh', 'Nhóm Tuổi', 'Địa Chỉ'];
    else if (type === 'cu_tru') columns = ['Họ Tên', 'Loại hình', 'Từ ngày', 'Đến ngày'];
    else columns = ['Họ Tên', 'Loại Biến Động', 'Ngày Biến Động', 'Ghi Chú'];

    // Render Header
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        thead.appendChild(th);
    });

    // Render Body
    if (list && list.length > 0) {
        list.forEach(item => {
            const tr = document.createElement('tr');
            // Biến đổi object thành array value theo thứ tự
            Object.values(item).forEach(val => {
                const td = document.createElement('td');
                td.innerText = val;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Không có dữ liệu chi tiết</td></tr>';
    }
}

// --- MOCK DATA (Thay thế phần này bằng gọi API Backend) ---
// Dữ liệu giả lập khớp với cấu trúc bảng SQL bạn cung cấp
function getMockDataFromDB(reportType, period, timeVal) {
    // 1. Giả lập dữ liệu tổng hợp (Từ các bảng Thong_ke_...)
    let summaryData = {};
    if (reportType === 'gioi_tinh') {
        // Khớp cột bảng Thong_ke_gioi_tinh
        summaryData = { so_nam: 450, so_nu: 500, tong_so: 950 };
    } else if (reportType === 'do_tuoi') {
        // Khớp cột bảng Thong_ke_do_tuoi
        summaryData = { mam_non_mau_giao: 50, cap_1: 120, cap_2: 100, cap_3: 90, do_tuoi_lao_dong: 500, nghi_huu: 90 };
    } else if (reportType === 'cu_tru') {
        // Khớp cột bảng Thong_ke_cu_tru
        summaryData = { dang_tam_tru: 25, dang_tam_vang: 10 };
    } else if (reportType === 'bien_dong') {
        // Khớp cột bảng Thong_ke_bien_dong
        summaryData = { so_them_moi: 5, so_chuyen_di: 2, so_qua_doi: 1, so_thay_doi_thong_tin: 10 };
    }

    // 2. Giả lập danh sách chi tiết (Thường query từ bảng NhanKhau/BienDong)
    // Thực tế bạn cần query bảng NhanKhau với WHERE theo tiêu chí
    let listData = [
        { c1: 'Nguyễn Văn A', c2: '1990-01-01', c3: 'Nam', c4: 'Hà Nội' },
        { c1: 'Trần Thị B', c2: '1995-05-20', c3: 'Nữ', c4: 'Hồ Chí Minh' }
    ];

    if(reportType === 'cu_tru') {
        listData = [
            { c1: 'Lê Văn C', c2: 'Tạm trú', c3: '2025-01-01', c4: '2025-06-01' }
        ]
    }

    return { summary: summaryData, details: listData };
}