let overalData = {}; // Nên để object rỗng thay vì mảng []

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

document.addEventListener('DOMContentLoaded', function() {
    queryData();
});