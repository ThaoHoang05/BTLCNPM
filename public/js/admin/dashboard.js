let homeContentCache = null; 

// 1. Tạo một đối tượng ánh xạ giữa Hash và hàm Render
const routes = {
    'home': renderHome,
    'household': renderHousehold,
    'resident': renderResidentManagement,
    'nvh': renderNVHManagement,
    'report': renderReport,
    'setting': renderSetting,
    'request': renderRequestManager,
    'account': renderAccount
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

// Hàm kiểm tra xem user hiện tại có phải là Tổ Phó không
function isToPho() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return false;
    
    try {
        const user = JSON.parse(userStr);
        // Kiểm tra trường role hoặc chucVu (tùy vào lúc Login bạn lưu là gì)
        // Ví dụ: user.role === 'ToPho' hoặc user.chucVu === 'Tổ phó'
        const role = (user.role || user.chucVu || '').toLowerCase();
        return role.includes('pho'); // Tìm chữ "phó" cho chắc chắn
    } catch (e) {
        return false;
    }
}

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
            throw new Error('Không tìm thấy file: ' + response.statusText);
        }
        return response.text();
    })
    .then(html =>{
        // 1. Đưa HTML vào trang
        mainContent.innerHTML = html; 

        // 2. SAU KHI HTML ĐÃ CÓ, GỌI HÀM LOAD DỮ LIỆU
        // Kiểm tra hàm có tồn tại không để tránh lỗi
        if (typeof loadHouseHoldList === 'function') {
            loadHouseHoldList(); 
        } else {
            console.error("Chưa load được file household.js hoặc chưa định nghĩa hàm loadHouseHoldList");
        }
    })
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
        if (typeof loadCitizenList === 'function') {
            loadCitizenList();
        } else {
            console.error("Chưa tìm thấy hàm loadCitizenList. Kiểm tra lại việc nhúng file resident.js");
        }
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
            if( typeof fetchPendingList === 'function') {
                fetchPendingList();
            }
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

function renderAccount() {
    var mainContent = document.querySelector('.main-content');
    
    fetch('components/account.html')
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file account.html');
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;
            
            // --- LOGIC PHÂN QUYỀN TỔ PHÓ ---
            if (isToPho()) {
                // 1. Ẩn nút "Thêm Tài Khoản" ngay khi giao diện load
                const addBtn = document.querySelector('button[onclick="openAccountModal()"]');
                if (addBtn) addBtn.style.display = 'none';
            }
            // -------------------------------

            // Gọi hàm khởi tạo logic cho trang Account (sẽ viết ở Bước 2)
            if (typeof initAccountManager === 'function') {
                initAccountManager(); 
            } else {
                console.error("Chưa load file js/admin/account.js hoặc chưa định nghĩa initAccountManager");
            }
        })
        .catch(error => {
            console.error('Lỗi tải trang Account:', error);
            mainContent.innerHTML = `<h3 style="color:red">Lỗi tải trang Quản lý tài khoản</h3>`;
        });
}

function renderRequestManager() {
    var mainContent = document.querySelector('.main-content');
    
    fetch('components/request.html')
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file request.html');
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;
            
            // Khởi tạo logic JS
            if (typeof initRequestManager === 'function') {
                initRequestManager(); 
            } else {
                console.error("Chưa load file js/admin/request.js");
            }
        })
        .catch(error => {
            console.error(error);
            mainContent.innerHTML = `<h3 style="color:red">Lỗi tải trang Quản lý yêu cầu</h3>`;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    if (isToPho()) {
        // Danh sách các selector của nút Thêm Mới, Đăng ký...
        const restrictedSelectors = [
            '.btn-success[onclick*="openModal"]', // Các nút Thêm màu xanh
            '.btn-warning[onclick*="openManageResidence"]', // Nút Quản lý cư trú
            '.btn-warning[onclick*="openModal"]' // Các nút màu vàng khác
        ];

        restrictedSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Kiểm tra kỹ hơn nội dung text để tránh ẩn nhầm
                const text = el.innerText.toLowerCase();
                if (text.includes('thêm') || text.includes('đăng ký') || text.includes('quản lý')) {
                    el.style.display = 'none';
                }
            });
        });
    }
});