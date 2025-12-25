let homeContentCache = null; 

// 2. Hàm này chỉ để TẢI NGẦM (Chạy khi vừa vào trang)
// Trong file dashboard.js (Ví dụ)

function renderSetting() {
    var mainContent = document.querySelector('.main-content');
    fetch('components/setting.html') 
        .then(response => {
            if (!response.ok) {
                // Mở Console (F12) để xem lỗi này nếu đường dẫn sai
                throw new Error('Không tìm thấy file: ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;
        })
        .catch(error => {
            console.error('Lỗi tải trang:', error);
            mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file setting.html</h3>`; 
        });
}

// --- dashboard.js ---

function renderNVHManagement() {
    var mainContent = document.querySelector('.main-content');
    
    // Sửa lại đường dẫn cho đúng: components/nvh.html (không phải nvhnvh)
    fetch('components/nvh.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Lỗi tải file: ' + response.statusText);
        }
        return response.text();
    })
    .then(html => {
        // 1. Đổ HTML vào trang
        mainContent.innerHTML = html;
        
        // 2. QUAN TRỌNG: Gọi hàm khởi tạo JS ngay sau khi có HTML
        if (typeof initNVH === 'function') {
            initNVH(); 
        } else {
            console.error("Không tìm thấy hàm initNVH(). Hãy kiểm tra file nvh.js");
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        mainContent.innerHTML = `<h3 style="color:red">Lỗi kết nối: ${error.message}</h3>`;
    });
}

// Các hàm khác giữ nguyên (renderSetting, preLoadHome...)

document.addEventListener('DOMContentLoaded', () => {
    // Mặc định vào trang NVH khi mở dashboard
    renderNVHManagement();
});