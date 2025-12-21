let homeContentCache = null; 

// 1. Tạo một đối tượng ánh xạ giữa Hash và hàm Render
const routes = {
    'home': renderHome,
    'household': renderHousehold,
    'resident': renderResidentManagement,
    'nvh': renderNVHManagement,
    'report': renderReport,
    'setting': renderSetting
};

// Hàm điều hướng dựa trên URL hiện tại
function handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const renderFunc = routes[hash];

    if (renderFunc) {
        renderFunc(); // Gọi hàm render tương ứng
    } else if (hash.startsWith('hokhau/')) {
        // Xử lý xem chi tiết hộ khẩu qua URL (Ví dụ: #hokhau/HK001)
        const hkCode = hash.split('/')[1];
        renderResidentManagement(); 
        // Sau đó gọi hàm mở modal chi tiết sau một khoảng trễ nhỏ
        setTimeout(() => openDetailModal(hkCode), 100);
    }
}

// Lắng nghe sự kiện đổi URL và sự kiện Load trang
window.addEventListener('hashchange', handleRouting);
document.addEventListener('DOMContentLoaded', () => {
    // Giữ nguyên logic lấy thông tin user
    const userString = localStorage.getItem('currentUser'); 
    if (userString) {
        const user = JSON.parse(userString);
        const nameLabel = document.getElementById('admin-name');
        if (nameLabel) nameLabel.innerText = user.username; 
    }

    preLoadHome(); // Tải ngầm
    handleRouting(); 
});

// 2. Hàm này chỉ để TẢI NGẦM (Chạy khi vừa vào trang)
async function preLoadHome() {
    try {
        console.log("Đang tải ngầm trang Home...");
        const response = await fetch('components/home.html'); // Đường dẫn tới file home của bạn
        if (response.ok) {
            homeContentCache = await response.text(); // Lưu text vào biến, KHÔNG gán vào innerHTML
            console.log("Đã tải xong trang Home và cất vào kho!");

        }
    } catch (error) {
        console.error("Lỗi tải ngầm:", error);
    }
}

// Ham render household quan ly nhan khau
function renderHousehold(){
    var mainContent = document.querySelector('.main-content');
    fetch('components/household.html')
    .then(response =>{
        if (!response.ok) {
            // Mở Console (F12) để xem lỗi này nếu đường dẫn sai
            throw new Error('Không tìm thấy file: ' + response.statusText);
        }
        return response.text();
    })
    .then(html =>{
        mainContent.innerHTML = html;
    }
    )
    .catch(err =>{
        console.error('Lỗi tải trang:', err);
        mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file household.html</h3>`; 
    });
}
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

function renderResidentManagement(){
    var mainContent= document.querySelector('.main-content');
    fetch('components/resident.html')
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
    .catch(error =>{
        console.error('Lỗi tải trang:', error);
        mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file resident.html</h3>`; 
    });
}

function renderNVHManagement() {
    var mainContent = document.querySelector('.main-content');
    fetch('components/nvh.html') 
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
            mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file nvh-management.html</h3>`; 
        });
}

function renderReport(){
    var mainContent = document.querySelector('.main-content');
    fetch('components/thongke.html')
    .then(response =>{
        if (!response.ok) {
            // Mở Console (F12) để xem lỗi này nếu đường dẫn sai
            throw new Error('Không tìm thấy file: ' + response.statusText);
        }
        return response.text();
    })
    .then(html =>{
        mainContent.innerHTML = html;
    })
    .catch(error =>{
        console.error('Lỗi tải trang:', error);
        mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file thongke.html</h3>`;
    });
}

function renderHome(){
    var mainContent = document.querySelector('.main-content');
    
    if (homeContentCache) {
        mainContent.innerHTML = homeContentCache;
        if (typeof queryData === 'function') {
            queryData();
            return;
        }
    } // Nếu đã có cache thì dùng luôn, không fetch lại nữa

    fetch('components/home.html') 
        .then(response => {
            if (!response.ok) {
                // Mở Console (F12) để xem lỗi này nếu đường dẫn sai
                throw new Error('Không tìm thấy file: ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;
            if (typeof queryData === 'function') {
                queryData();
            }
        })
        .catch(error => {
            console.error('Lỗi tải trang:', error);
            mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file home.html</h3>`; 
        });
};
