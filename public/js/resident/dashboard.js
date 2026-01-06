let homeContentCache = null; 

// 2. Hàm này chỉ để TẢI NGẦM (Chạy khi vừa vào trang)
async function preLoadHome() {
    try {
        console.log("Đang tải ngầm trang Home...");
        const response = await fetch('components/resident.html'); 
        if (response.ok) {
            homeContentCache = await response.text(); 
            console.log("Đã tải xong trang Home và cất vào kho!");
        }
    } catch (error) {
        console.error("Lỗi tải ngầm:", error);
    }
}

// --- HÀM MỚI: Hiển thị thông tin user từ LocalStorage ---
function loadUserProfile() {
    // 1. Lấy chuỗi JSON từ localStorage
    const userStr = localStorage.getItem('currentUser');
    
    // 2. Kiểm tra nếu có dữ liệu
    if (userStr) {
        try {
            // 3. Parse chuỗi JSON thành Object
            const user = JSON.parse(userStr);
            
            // 4. Tìm thẻ hiển thị tên (id="admin-name" trong dashboard.html)
            const nameElement = document.getElementById('admin-name');
            
            if (nameElement) {
                // Hiển thị tên đăng nhập (username) hoặc tên thật tùy vào dữ liệu bạn lưu
                // Dựa vào loginController, field là: user.username
                nameElement.innerText = user.username || "Người dùng";
            }
        } catch (e) {
            console.error("Lỗi khi đọc dữ liệu user:", e);
        }
    } else {
        // Nếu không có user trong localStorage (chưa login), đẩy về trang login
        alert("Bạn chưa đăng nhập!");
        window.location.href = '../../login.html'; 
    }
}

function renderSetting() {
    var mainContent = document.querySelector('.main-content');
    fetch('components/setting.html') 
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file: ' + response.statusText);
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

function renderNVHManagement() {
    var mainContent = document.querySelector('.main-content');
    fetch('components/nvh.html')
    .then(response =>{
        if(!response.ok) throw new Error('Không tìm thấy file: ' + response.statusText);
        return response.text();
    })
    .then(html =>{
        mainContent.innerHTML = html;
        
        // --- THÊM ĐOẠN NÀY ---
        // Gọi hàm khởi tạo từ nvh.js để tải dữ liệu ngay
        if (typeof window.initNVHPage === 'function') {
            window.initNVHPage(); 
        } else {
            console.error("Chưa tìm thấy hàm initNVHPage. Kiểm tra lại nvh.js");
        }
        // ---------------------
    })
    .catch(error =>{
        console.error('Lỗi tải trang:', error);
        mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file nvh.html</h3>`;
    });
}

function renderResident() {
    var mainContent = document.querySelector('.main-content');
    
    // Hiển thị trạng thái đang tải để người dùng biết
    mainContent.innerHTML = '<div style="text-align:center; padding-top:50px;">Loading resident data...</div>';

    fetch('components/resident.html')
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file: ' + response.statusText);
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;

            // --- QUAN TRỌNG: Gọi hàm khởi tạo logic từ resident.js ---
            if (typeof window.renderResidentMain === 'function') {
                window.renderResidentMain(); 
            } else {
                console.error("Lỗi: Không tìm thấy hàm window.renderResidentMain. Hãy kiểm tra file resident.js đã được load chưa.");
            }
        })
        .catch(error => {
            console.error('Lỗi tải trang:', error);
            mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file resident.html</h3>`;
        });
}

// --- SỰ KIỆN KHỞI CHẠY ---
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile(); // <--- Gọi hàm hiển thị tên
    preLoadHome();
    renderResident();
});