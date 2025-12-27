let myChartInstance = null;

// Khởi tạo mặc định khi load trang
document.addEventListener('DOMContentLoaded', () => {
    handlePeriodTypeChange(); 
    fetchAndRenderStats();
});

// 1. Xử lý UI: Thay đổi input nhập liệu
function handlePeriodTypeChange() {
    const type = document.getElementById('periodType').value;
    const container = document.getElementById('dynamicTimeInput');
    let html = '<label>Chọn giá trị:</label>';

    if (type === 'Tháng') {
        // Mặc định lấy tháng hiện tại
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        html += `<input type="month" id="timeValue" class="form-control" value="${monthStr}">`;
    } else if (type === 'Quý') {
        const curYear = new Date().getFullYear();
        html += `
            <div style="display:flex; gap:5px;">
                <select id="timeQuarter" class="form-control">
                    <option value="Q1">Quý 1</option>
                    <option value="Q2">Quý 2</option>
                    <option value="Q3">Quý 3</option>
                    <option value="Q4">Quý 4</option>
                </select>
                <input type="number" id="timeYear" class="form-control" value="${curYear}" placeholder="Năm">
            </div>`;
    } else {
        html += `<input type="number" id="timeValue" class="form-control" value="${new Date().getFullYear()}">`;
    }
    container.innerHTML = html;
}

// 2. Logic lấy chuỗi thời gian để gửi lên API
function getTimeString() {
    const type = document.getElementById('periodType').value;
    if (type === 'Tháng') {
        const val = document.getElementById('timeValue').value; // YYYY-MM
        if(!val) return '';
        const [y, m] = val.split('-');
        return `${m}/${y}`; // Backend mong đợi MM/YYYY (hoặc YYYY-MM tùy bạn xử lý ở server)
    } else if (type === 'Quý') {
        const q = document.getElementById('timeQuarter').value;
        const y = document.getElementById('timeYear').value;
        return `${q}/${y}`; 
    } else {
        return document.getElementById('timeValue').value; 
    }
}

// 3. HÀM CHÍNH: GỌI API VÀ RENDER (Đã sửa để dùng fetch)
async function fetchAndRenderStats() {
    const reportType = document.getElementById('reportType').value; // gioitinh, dotuoi...
    const periodType = document.getElementById('periodType').value; // Tháng, Quý, Năm
    const timeString = getTimeString();

    if (!timeString) {
        alert("Vui lòng chọn thời gian hợp lệ!");
        return;
    }

    console.log(`Đang gọi API: Type=${reportType}, Period=${periodType}, Time=${timeString}`);

    try {
        // Tạo URL query string
        const queryParams = new URLSearchParams({
            type: reportType,
            period: periodType,
            time: timeString
        }).toString();

        // --- GỌI API 1: LẤY SỐ LIỆU TỔNG HỢP (SUMMARY) ---
        const resSum = await fetch(`/api/reports/summary?${queryParams}`);
        const jsonSum = await resSum.json();

        if (!jsonSum.success) {
            alert("Lỗi tải báo cáo tổng hợp: " + jsonSum.message);
            return;
        }

        // --- GỌI API 2: LẤY CHI TIẾT (DETAILS) ---
        const resDet = await fetch(`/api/reports/details?${queryParams}`);
        const jsonDet = await resDet.json();

        if (!jsonDet.success) {
            console.warn("Không tải được chi tiết:", jsonDet.message);
        }

        // --- CẬP NHẬT GIAO DIỆN ---
        // 1. Cập nhật Card số liệu (Dùng data từ API Summary)
        updateCards(reportType, jsonSum.data);

        // 2. Vẽ biểu đồ (Dùng data từ API Summary)
        renderChart(reportType, jsonSum.data);

        // 3. Vẽ bảng (Dùng list từ API Details)
        // Lưu ý: Controller trả về { data: { list: [...] } }
        const listData = jsonDet.data ? jsonDet.data.list : [];
        renderTable(reportType, listData);

    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
}

// 4. Cập nhật thẻ Card
function updateCards(type, data) {
    // Lưu ý: Tên trường (data.xxx) phải khớp với Model trả về
    if (type === 'gioi_tinh') {
        setCardData('Tổng nhân khẩu', data.tong_so || 0, 'Nam', data.so_nam || 0, 'Nữ', data.so_nu || 0);
    } else if (type === 'do_tuoi') {
        const laoDong = data.do_tuoi_lao_dong || 0;
        const nghiHuu = data.nghi_huu || 0;
        // Tổng trẻ em = Tổng - Lao động - Nghỉ hưu (hoặc cộng các trường con nếu API trả về đủ)
        const treEm = (data.mam_non_mau_giao || 0) + (data.cap_1 || 0) + (data.cap_2 || 0) + (data.cap_3 || 0);
        setCardData('Độ tuổi lao động', laoDong, 'Học sinh/Trẻ em', treEm, 'Nghỉ hưu', nghiHuu);
    } else if (type === 'cu_tru') {
        setCardData('Tạm trú', data.dang_tam_tru || 0, 'Tạm vắng', data.dang_tam_vang || 0, 'Thường trú', data.thuong_tru || 'N/A'); 
    } else if (type === 'bien_dong') {
        setCardData('Mới nhập khẩu', data.so_them_moi || 0, 'Chuyển đi', data.so_chuyen_di || 0, 'Qua đời', data.so_qua_doi || 0);
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
        values = [
            data.mam_non_mau_giao || 0, 
            data.cap_1 || 0, 
            data.cap_2 || 0, 
            data.cap_3 || 0, 
            data.do_tuoi_lao_dong || 0, 
            data.nghi_huu || 0
        ];
        colors = '#4e73df';
        labelName = 'Số lượng người';
    } else if (type === 'cu_tru') {
        chartType = 'doughnut';
        labels = ['Tạm trú', 'Tạm vắng'];
        values = [data.dang_tam_tru || 0, data.dang_tam_vang || 0];
        colors = ['#f6c23e', '#858796'];
        labelName = 'Hồ sơ';
    } else if (type === 'bien_dong') {
        chartType = 'bar';
        labels = ['Thêm mới', 'Chuyển đi', 'Qua đời', 'Thay đổi TT'];
        values = [
            data.so_them_moi || 0, 
            data.so_chuyen_di || 0, 
            data.so_qua_doi || 0, 
            data.so_thay_doi_thong_tin || 0
        ];
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

    // Định nghĩa cột hiển thị (HEADER)
    let columns = [];
    // Lưu ý: Thứ tự này chỉ là tiêu đề, dữ liệu thực tế phụ thuộc vào API trả về
    if (type === 'gioi_tinh') columns = ['Họ Tên', 'Ngày Sinh', 'Giới Tính', 'Địa Chỉ'];
    else if (type === 'do_tuoi') columns = ['Họ Tên', 'Ngày Sinh', 'Tuổi', 'Địa Chỉ'];
    else if (type === 'cu_tru') columns = ['Họ Tên', 'Loại hình', 'Từ ngày', 'Đến ngày'];
    else columns = ['Họ Tên', 'Loại Biến Động', 'Ngày thực hiện', 'Ghi Chú'];

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
            
            // Cách đơn giản: Lấy tất cả giá trị trong object item (trừ id nếu cần)
            // Cách tốt hơn: Gọi đích danh từng trường để đảm bảo thứ tự
            // Ví dụ này render dynamic dựa trên object trả về
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