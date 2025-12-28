/* dashboard.js - Đã sửa lỗi đệ quy vô hạn */

// 1. Tự động tải "Quản lý Dân cư" khi vào trang
document.addEventListener("DOMContentLoaded", () => {
    loadComponent('population');
});

// 2. Hàm điều hướng chính (Router)
// Hàm này cần được gọi từ HTML nên ta để nó ở phạm vi toàn cục hoặc gán vào window nếu cần
window.loadComponent = async function(type) {
    const main = document.querySelector('.main-content');

    switch (type) {
        case 'population':
            await loadPopulationContent(main);
            break;
        case 'setting':
            await loadSettingContent(main);
            break;
        default:
            console.warn("Module không tồn tại:", type);
    }
}

// 3. Logic tải nội dung Dân Cư (Tên hàm đã được đổi khác đi)
async function loadPopulationContent(container) {
    try {
        // Fetch file HTML từ thư mục components
        // Lưu ý: Đường dẫn dựa trên vị trí file dashboard.html
        const response = await fetch('component/population_stats.html');
        
        if (!response.ok) throw new Error("Không tìm thấy file HTML Dân cư");
        
        const html = await response.text();
        container.innerHTML = html;

        // Load Script đi kèm (population_manager.js)
        // Kiểm tra xem script đã có chưa để tránh load trùng
        if (!document.querySelector('script[src*="population_manager.js"]')) {
            const script = document.createElement('script');
            script.src = "../../js/common/population_manager.js";
            script.onload = () => {
                if (typeof initPopulationManager === 'function') initPopulationManager();
            };
            document.body.appendChild(script);
        } else {
            // Nếu script đã load rồi thì chỉ cần gọi hàm khởi tạo lại
            if (typeof initPopulationManager === 'function') initPopulationManager();
        }
    } catch (error) {
        console.error("Lỗi tải module Dân cư:", error);
        container.innerHTML = '<h3 style="color:red">Lỗi tải dữ liệu. Kiểm tra lại đường dẫn file.</h3>';
    }
}

// 4. Logic tải nội dung Setting (Tên hàm đã được đổi khác đi)
async function loadSettingContent(container) {
    try {
        // Fetch file setting.html (Nằm cùng cấp với dashboard.html trong thư mục pages/common)
        const response = await fetch('component/setting.html');
        
        if (!response.ok) throw new Error("Không tìm thấy file setting.html");
        
        const html = await response.text();
        container.innerHTML = html;
        
        // Không cần load thêm JS vì setting.js đã được nhúng sẵn ở dashboard.html
        
    } catch (error) {
        console.error("Lỗi tải trang cài đặt:", error);
        container.innerHTML = '<h3 style="color:red">Không thể tải trang cài đặt.</h3>';
    }
}

// 5. Gán hàm cho HTML gọi (Cầu nối)
// Khi bạn click vào menu Setting (onclick="renderSetting()"), nó sẽ gọi dòng này
window.renderSetting = () => window.loadComponent('setting');