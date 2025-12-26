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
    })
    .catch(error =>{
        console.error('Lỗi tải trang:', error);
        mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file resident.html</h3>`;
    });
}

function renderResident(){
    var mainContent = document.querySelector('.main-content');
    fetch('components/resident.html')
    .then(response =>{
        if(!response.ok) throw new Error('Không tìm thấy file: ' + response.statusText);
        return response.text();
    })
    .then(html =>{
        mainContent.innerHTML = html;
        
        // QUAN TRỌNG: Sau khi HTML được nạp vào, cần kích hoạt lại logic của trang Resident
        // Nếu resident.js đã được load ở dashboard.html, ta cần gọi hàm khởi tạo của nó
        if (typeof renderResidentMain === 'function') {
            console.log("Đã gọi hàm renderResident sau khi nạp HTML.");
            renderResidentMain(); 
        } 
        // Lưu ý: Do logic của bạn đang để hàm renderResident trong resident.js tự chạy
        // khi DOMContentLoaded, nên khi switch tab có thể nó không tự chạy lại.
        // Tốt nhất nên tách logic khởi tạo trong resident.js thành 1 hàm và gọi ở đây.
    })
    .catch(error =>{
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