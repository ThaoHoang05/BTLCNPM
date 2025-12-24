// lay du lieu tu api
    let myChartInstance = null; // Biến lưu instance biểu đồ để hủy khi vẽ lại

    // 1. Cấu hình cột bảng cho từng loại báo cáo
    const tableConfigs = {
        gender: ['Họ tên', 'Ngày sinh', 'Giới tính', 'Địa chỉ', 'Trạng thái'],
        age: ['Họ tên', 'Ngày sinh', 'Tuổi', 'Nhóm độ tuổi', 'Địa chỉ'],
        residence: ['Họ tên', 'CCCD', 'Loại hình', 'Từ ngày', 'Đến ngày', 'Lý do']
    };

    // 2. Hàm xử lý chính khi bấm nút "Thống kê"
    function updateReport() {
        const criteria = document.getElementById('criteriaSelect').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        // Giả lập dữ liệu trả về từ Backend (Dựa trên SQL bạn đã viết)
        // Trong thực tế, bạn sẽ dùng fetch('/api/thong-ke?type=' + criteria...)
        const mockData = getMockData(criteria);

        // Cập nhật thẻ Summary
        updateSummaryCards(criteria, mockData);

        // Vẽ biểu đồ
        renderChart(criteria, mockData);

        // Vẽ bảng
        renderTable(criteria, mockData.list);
    }

    // 3. Hàm cập nhật Summary Cards (Card tổng quan)
    function updateSummaryCards(criteria, data) {
        document.getElementById('card1Label').innerText = "Tổng số bản ghi";
        document.getElementById('card1Value').innerText = data.total;

        if (criteria === 'gender') {
            document.getElementById('card2Label').innerText = "Nam";
            document.getElementById('card2Value').innerText = data.male;
            document.getElementById('card3Label').innerText = "Nữ";
            document.getElementById('card3Value').innerText = data.female;
        } else if (criteria === 'residence') {
            document.getElementById('card2Label').innerText = "Tạm trú";
            document.getElementById('card2Value').innerText = data.tamTru;
            document.getElementById('card3Label').innerText = "Tạm vắng";
            document.getElementById('card3Value').innerText = data.tamVang;
        } else if (criteria === 'age') {
            document.getElementById('card2Label').innerText = "Độ tuổi lao động";
            document.getElementById('card2Value').innerText = data.workingAge;
            document.getElementById('card3Label').innerText = "Trẻ em (Học sinh)";
            document.getElementById('card3Value').innerText = data.students;
        }
    }

    // 4. Hàm vẽ bảng chi tiết
    function renderTable(criteria, listData) {
        const thead = document.getElementById('tableHeader');
        const tbody = document.getElementById('tableBody');
        
        // Reset bảng
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Tạo Header
        tableConfigs[criteria].forEach(col => {
            const th = document.createElement('th');
            th.innerText = col;
            thead.appendChild(th);
        });

        // Tạo Body
        listData.forEach(item => {
            const tr = document.createElement('tr');
            // Logic map dữ liệu vào cột tương ứng (đơn giản hóa)
            Object.values(item).forEach(val => {
                const td = document.createElement('td');
                td.innerText = val;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // 5. Hàm vẽ biểu đồ (Sử dụng Chart.js)
    function renderChart(criteria, data) {
        const ctx = document.getElementById('myChart').getContext('2d');
        
        // Hủy biểu đồ cũ nếu tồn tại
        if (myChartInstance) {
            myChartInstance.destroy();
        }

        let chartType = 'bar';
        let labels = [];
        let datasetData = [];
        let labelName = 'Số lượng';

        // Cấu hình dữ liệu biểu đồ dựa trên tiêu chí
        if (criteria === 'gender') {
            chartType = 'pie';
            labels = ['Nam', 'Nữ'];
            datasetData = [data.male, data.female];
        } else if (criteria === 'age') {
            chartType = 'bar';
            labels = ['Mầm non', 'Tiểu học', 'THCS', 'THPT', 'Lao động', 'Nghỉ hưu'];
            datasetData = data.ageDistribution; // Mảng số lượng tương ứng
        } else if (criteria === 'residence') {
            chartType = 'doughnut';
            labels = ['Tạm trú', 'Tạm vắng'];
            datasetData = [data.tamTru, data.tamVang];
        }

        myChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: labelName,
                    data: datasetData,
                    backgroundColor: [
                        '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // --- MOCK DATA (Dữ liệu giả để test logic) ---
    // Phần này sau sẽ thay bằng gọi API
    function getMockData(criteria) {
        if (criteria === 'age') {
            return {
                total: 150,
                workingAge: 90,
                students: 40,
                ageDistribution: [10, 20, 15, 15, 60, 30], // Khớp với labels ở trên
                list: [
                    {name: 'Nguyễn Văn A', dob: '2018-01-01', age: 7, group: 'Tiểu học', addr: 'Hà Nội'},
                    {name: 'Trần Thị B', dob: '1990-05-20', age: 34, group: 'Lao động', addr: 'Hà Nội'}
                ]
            };
        }
        // Mặc định trả về dữ liệu mẫu cho Gender
        return {
            total: 100,
            male: 45,
            female: 55,
            list: [
                {name: 'Lê Văn C', dob: '2000-01-01', gender: 'Nam', addr: 'Hà Đông', status: 'Thường trú'},
                {name: 'Phạm Thị D', dob: '2002-02-02', gender: 'Nữ', addr: 'Hà Đông', status: 'Tạm trú'}
            ]
        };
    }