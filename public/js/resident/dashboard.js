let homeContentCache = null; 

// 2. Hàm này chỉ để TẢI NGẦM (Chạy khi vừa vào trang)
async function preLoadHome() {
    try {
        console.log("Đang tải ngầm trang Home...");
        const response = await fetch('components/resident.html'); // Đường dẫn tới file home của bạn
        if (response.ok) {
            homeContentCache = await response.text(); // Lưu text vào biến, KHÔNG gán vào innerHTML
            console.log("Đã tải xong trang Home và cất vào kho!");

        }
    } catch (error) {
        console.error("Lỗi tải ngầm:", error);
    }
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

function renderNVHManagement() {
    var mainContent = document.querySelector('.main-content');
    fetch('components/nvh.html')
    .then(response =>{
        if(!response.ok){
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
        mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file resident.html</h3>`;
    });
}

function renderResident(){
    var mainContent = document.querySelector('.main-content');
    fetch('components/resident.html')
    .then(response =>{
        if(!response.ok){
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
        mainContent.innerHTML = `<h3 style="color:red">Lỗi: Không tìm thấy file resident.html</h3>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    preLoadHome();
    renderResident();
});