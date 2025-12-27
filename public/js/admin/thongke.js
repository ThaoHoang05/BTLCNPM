let myChartInstance = null;

// --- CẤU HÌNH PHÂN TRANG ---
let currentPage = 1;      // Trang hiện tại
const limitPerPage = 10;  // Số dòng mỗi trang

// Khởi tạo mặc định khi load trang
document.addEventListener('DOMContentLoaded', () => {
    // Chỉ chạy logic nếu đang ở trang thống kê (có thẻ reportType)
    const reportSelect = document.getElementById('reportType');
    if (reportSelect) {
        handlePeriodTypeChange(); 
        onSearchClick();
    }
});

// [FIX] Thêm hàm xử lý khi đổi loại báo cáo (trước đây bị thiếu)
function handleReportTypeChange() {
    currentPage = 1;
    fetchAndRenderStats();
}

// 1. Xử lý UI: Thay đổi input nhập liệu
function handlePeriodTypeChange() {
    const periodTypeEl = document.getElementById('periodType');
    if (!periodTypeEl) return; // Kiểm tra tồn tại

    const type = periodTypeEl.value;
    const container = document.getElementById('dynamicTimeInput');
    if (!container) return;

    let html = '<label>Chọn giá trị:</label>';

    if (type === 'Tháng') {
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        html += `<input type="month" id="timeValue" class="form-control" value="${monthStr}">`;
    } else if (type === 'Quý') {
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
        html += `<input type="number" id="timeValue" class="form-control" value="${new Date().getFullYear()}">`;
    }
    container.innerHTML = html;
}

function getTimeString() {
    const periodTypeEl = document.getElementById('periodType');
    if (!periodTypeEl) return '';
    
    const type = periodTypeEl.value;
    if (type === 'Tháng') {
        const val = document.getElementById('timeValue')?.value;
        if (!val) return '';
        const [y, m] = val.split('-');
        return `${m}/${y}`;
    } else if (type === 'Quý') {
        const q = document.getElementById('timeQuarter')?.value;
        const y = document.getElementById('timeYear')?.value;
        return `${q}/${y}`;
    } else {
        return document.getElementById('timeValue')?.value || '';
    }
}

// Hàm sự kiện cho nút Xem Thống Kê
function onSearchClick() {
    currentPage = 1; // Reset về trang 1
    fetchAndRenderStats();
}

// [FIX] Hàm chuyển trang (Trước đây bị thiếu gây lỗi ReferenceError)
function changePage(newPage) {
    if (newPage < 1) return;
    currentPage = newPage;
    fetchAndRenderStats();
}

// 2. HÀM CHÍNH: GỌI API (Đã bổ sung jsonSum)
async function fetchAndRenderStats() {
    const reportElem = document.getElementById('reportType');
    const periodElem = document.getElementById('periodType');

    // Nếu không tìm thấy input (đang ở trang khác), dừng ngay
    if (!reportElem || !periodElem) return;

    const reportType = reportElem.value;
    const periodType = periodElem.value;
    const timeString = getTimeString();

    if (!timeString) return;

    console.log(`Đang tải: ${reportType} - ${timeString} - Trang ${currentPage}`);

    try {
        const queryParams = new URLSearchParams({
            type: reportType,
            period: periodType,
            time: timeString,
            page: currentPage,
            limit: limitPerPage
        }).toString();

        // --- [FIX QUAN TRỌNG] Gọi API Summary để lấy jsonSum ---
        const resSum = await fetch(`/api/reports/summary?${queryParams}`);
        const jsonSum = await resSum.json(); // Biến jsonSum được định nghĩa ở đây

        // Gọi API Details
        const resDet = await fetch(`/api/reports/details?${queryParams}`);
        const jsonDet = await resDet.json();

        // Xử lý hiển thị
        if (jsonSum && jsonSum.success) {
            updateCards(reportType, jsonSum.data);
            renderChart(reportType, jsonSum.data);
        }

        if (jsonDet && jsonDet.success) {
            const { list, total_rows } = jsonDet.data;
            renderTable(reportType, list);
            
            // Gọi hàm phân trang với tên mới để tránh xung đột
            renderReportPagination(total_rows); 
        }

    } catch (error) {
        console.error("Lỗi API:", error);
    }
}

// 3. HÀM PHÂN TRANG (Tên hàm đã đổi để tránh trùng với household.js)
function renderReportPagination(totalRows) {
    let paginationContainer = document.getElementById('pagination-controls');
    
    // Tìm vị trí chèn nút phân trang an toàn
    if (!paginationContainer) {
        const tableResponsive = document.querySelector('.table-responsive'); // Ưu tiên tìm class này
        const tableEl = document.querySelector('table'); // Dự phòng
        
        // Nếu không có bảng thì không vẽ phân trang
        if (!tableResponsive && !tableEl) return; 

        const parent = tableResponsive ? tableResponsive.parentNode : tableEl.parentNode;
        
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-controls';
        paginationContainer.style.marginTop = '15px';
        paginationContainer.style.display = 'flex';
        paginationContainer.style.justifyContent = 'center';
        paginationContainer.style.gap = '5px';
        
        parent.appendChild(paginationContainer);
    }

    paginationContainer.innerHTML = ''; // Reset

    const totalPages = Math.ceil(totalRows / limitPerPage);
    if (totalPages <= 1) return;

    // Nút Prev
    paginationContainer.appendChild(createPageButton('«', currentPage > 1, () => changePage(currentPage - 1)));

    // Logic hiển thị số trang rút gọn
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    if (startPage > 1) {
        paginationContainer.appendChild(createPageButton(1, true, () => changePage(1)));
        if (startPage > 2) paginationContainer.appendChild(createSpan('...'));
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = (i === currentPage);
        paginationContainer.appendChild(createPageButton(i, true, () => changePage(i), isActive));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationContainer.appendChild(createSpan('...'));
        paginationContainer.appendChild(createPageButton(totalPages, true, () => changePage(totalPages)));
    }

    // Nút Next
    paginationContainer.appendChild(createPageButton('»', currentPage < totalPages, () => changePage(currentPage + 1)));

    // Thông tin tổng dòng
    const info = document.createElement('div');
    info.style.marginLeft = '15px';
    info.style.alignSelf = 'center';
    info.style.color = '#666';
    info.innerText = `Tổng: ${totalRows} bản ghi`;
    paginationContainer.appendChild(info);
}

function createPageButton(text, isEnabled, onClick, isActive = false) {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.className = isActive ? 'btn btn-primary btn-sm' : 'btn btn-outline-secondary btn-sm';
    btn.disabled = !isEnabled;
    if (isEnabled) btn.onclick = onClick;
    return btn;
}

function createSpan(text) {
    const s = document.createElement('span');
    s.innerText = text;
    s.style.alignSelf = 'center';
    return s;
}

// 4. Update Cards
function updateCards(type, data) {
    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    if (type === 'gioi_tinh') {
        setCardData('Tổng nhân khẩu', data.tong_so, 'Nam', data.so_nam, 'Nữ', data.so_nu);
    } else if (type === 'do_tuoi') {
        const treEm = (data.mam_non_mau_giao || 0) + (data.cap_1 || 0) + (data.cap_2 || 0) + (data.cap_3 || 0);
        setCardData('Độ tuổi lao động', data.do_tuoi_lao_dong, 'Trẻ em/Học sinh', treEm, 'Nghỉ hưu', data.nghi_huu);
    } else if (type === 'cu_tru') {
        setCardData('Tạm trú', data.dang_tam_tru, 'Tạm vắng', data.dang_tam_vang, 'Thường trú', data.thuong_tru);
    } else if (type === 'bien_dong') {
        setCardData('Mới nhập khẩu', data.so_them_moi, 'Chuyển đi', data.so_chuyen_di, 'Qua đời', data.so_qua_doi);
    }

    function setCardData(l1, v1, l2, v2, l3, v3) {
        setText('lblCard1', l1); setText('valCard1', v1 || 0);
        setText('lblCard2', l2); setText('valCard2', v2 || 0);
        setText('lblCard3', l3); setText('valCard3', v3 || 0);
    }
}

// 5. Render Chart
function renderChart(type, data) {
    const ctxElem = document.getElementById('mainChart');
    if (!ctxElem) return; // Nếu không có canvas thì bỏ qua

    const ctx = ctxElem.getContext('2d');
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
        values = [data.mam_non_mau_giao, data.cap_1, data.cap_2, data.cap_3, data.do_tuoi_lao_dong, data.nghi_huu];
        colors = '#4e73df';
        labelName = 'Người';
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
        labelName = 'Hồ sơ';
    }

    if (typeof Chart !== 'undefined') {
        myChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{ label: labelName, data: values, backgroundColor: colors, borderWidth: 1 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// 6. Render Table
function renderTable(type, list) {
    const thead = document.getElementById('tableHeader');
    const tbody = document.getElementById('tableBody');
    if (!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columns = [];
    if (type === 'gioi_tinh') columns = ['Họ Tên', 'Ngày Sinh', 'Giới Tính', 'Địa Chỉ'];
    else if (type === 'do_tuoi') columns = ['Họ Tên', 'Ngày Sinh', 'Giới Tính', 'Địa Chỉ'];
    else if (type === 'cu_tru') columns = ['Họ Tên', 'Loại hình', 'Từ ngày', 'Đến ngày'];
    else columns = ['Họ Tên', 'Loại Biến Động', 'Ngày thực hiện', 'Ghi Chú'];

    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        thead.appendChild(th);
    });

    if (list && list.length > 0) {
        list.forEach(item => {
            const tr = document.createElement('tr');
            Object.values(item).forEach(val => {
                const td = document.createElement('td');
                td.innerText = val !== null ? val : '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="${columns.length}" style="text-align:center">Không có dữ liệu chi tiết</td></tr>`;
    }
}