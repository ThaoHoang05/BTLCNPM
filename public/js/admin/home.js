let overalData = {}; // Nên để object rỗng thay vì mảng []

document.addEventListener('DOMContentLoaded', function() {
    initHomeDashboard();
});

function initHomeDashboard() {
    queryData(); 
    queryNVHData();
    queryAccountStats();
    queryRequestStats();
}

function queryAccountStats() {
    fetch('/api/accounts/dashboard/stats')
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                const stats = res.data;

                // Map dữ liệu vào các ID đã định nghĩa trong home.html
                // totalAccounts: 29
                animateValue('totalAccounts', 0, stats.totalAccounts || 0, 1000);
                
                // activeAccounts: 29
                animateValue('activeAccounts', 0, stats.activeAccounts || 0, 1000);
                
                // lockedAccounts: 0
                animateValue('lockedAccounts', 0, stats.lockedAccounts || 0, 1000);
            }
        })
        .catch(error => console.error("Lỗi tải thống kê tài khoản:", error));
}

function queryData() {
    fetch('/api/hokhau/dashboard')
        .then(response => response.json())
        .then(data => {
            overalData = data;
            // QUAN TRỌNG: Phải gọi render ngay khi có dữ liệu
            renderData(); 
        })
        .catch(error => console.error("Lỗi tải dữ liệu:", error));
}

function renderData() {
    // Kiểm tra xem dữ liệu có tồn tại không để tránh lỗi
    if (!overalData) return;

    // Sử dụng hàm animateValue để số chạy từ 0 đến giá trị thực
    // Map dữ liệu: ID trong HTML <-> Trường dữ liệu từ API
    animateValue('totalHouseholds', 0, overalData.totalHouseholds || 0, 1000);
    animateValue('totalResidents', 0, overalData.totalResidents || 0, 1000);
    
    // Lưu ý: Bạn đang map 'tamtru' với 'totalBirths', hãy chắc chắn API trả về đúng ý bạn. 
    // Nếu đúng logic thì nên là overalData.totalTempStay
    animateValue('tamtru', 0, overalData.totalBirths || 0, 1000); 
    animateValue('tamvang', 0, overalData.totalDeaths || 0, 1000);
}

// Hàm phụ trợ: Tạo hiệu ứng số chạy (Copy thêm hàm này vào cuối file)
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return; // Nếu không tìm thấy thẻ HTML thì bỏ qua
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Format số kiểu Việt Nam (ví dụ: 1.000)
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString('vi-VN'); 
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Cập nhật hàm queryNVHData trong home.js
function queryNVHData() {
    fetch('/api/nvh/dashboard/stats')
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                // Hiển thị đơn Chờ duyệt
                animateValue('nvhPendingCount', 0, res.data.pendingRequests || 0, 1000);
                
                // Hiển thị tổng đơn Đã xử lý (Duyệt + Từ chối) vào thẻ "Đã duyệt sử dụng"
                animateValue('nvhApprovedCount', 0, res.data.approvedRequests || 0, 1000);
            }
        })
        .catch(error => console.error("Lỗi tải thống kê NVH:", error));
}

function queryRequestStats() {
    fetch('/api/resident/admin/stats') // Đường dẫn API đã thiết lập ở bước trước
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                const stats = res.data;

                // Map dữ liệu vào các ID trong home.html của bạn
                // Chờ duyệt
                animateValue('pendingRequests', 0, parseInt(stats.pending) || 0, 1000);
                
                // Đã duyệt (Tháng này hoặc tổng tùy theo logic SQL của bạn)
                animateValue('approvedRequests', 0, parseInt(stats.approved) || 0, 1000);
                
                // Đã từ chối
                animateValue('rejectedRequests', 0, parseInt(stats.rejected) || 0, 1000);
            }
        })
        .catch(error => console.error("Lỗi tải thống kê yêu cầu:", error));
}