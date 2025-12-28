// --- GẮN HÀM VÀO WINDOW ĐỂ HTML GỌI ĐƯỢC ---
window.initPopulationManager = function() {
    loadStatistics();
    searchHousehold(); 
};

window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Highlight nút bấm
    const btns = document.querySelectorAll('.tab-btn');
    if (tabName === 'nhankhau') btns[0].classList.add('active');
    else btns[1].classList.add('active');
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('show');
};

window.handleEnter = function(e, type) {
    if (e.key === 'Enter') {
        if (type === 'nhankhau') searchPopulation();
        if (type === 'hokhau') searchHousehold();
    }
};

// --- CÁC HÀM LOGIC CHÍNH ---

async function loadStatistics() {
    try {
        const res = await fetch('/api/nhankhau/stats/advanced'); // Hoặc đường dẫn API đúng của bạn
        const result = await res.json();
        
        if(result.status === 'success') {
            const data = result.data;
            // Vẽ biểu đồ (Giữ nguyên logic Chart.js của bạn)
            if(window.Chart) {
                // ... Code vẽ chart ...
                new Chart(document.getElementById('ageChart'), {
                    type: 'bar',
                    data: {
                        labels: ['Mầm non', 'Cấp 1', 'Cấp 2', 'Cấp 3', 'Lao động', 'Nghỉ hưu'],
                        datasets: [{ label: 'Số lượng', data: [data.mamNon, data.cap1, data.cap2, data.cap3, data.laoDong, data.nghiHuu], backgroundColor: '#3498db' }]
                    }
                });
                // ... (Các chart khác tương tự)
            }
        }
    } catch (e) { console.error(e); }
}

// Gắn các hàm tìm kiếm vào window luôn
window.searchPopulation = async function() {
    const keyword = document.getElementById('searchNKInput').value;
    // ... Logic fetch API tìm kiếm nhân khẩu ...
    // ... Render vào #resultNKBody ...
};

window.searchHousehold = async function() {
    const keyword = document.getElementById('searchHKInput').value;
    // ... Logic fetch API tìm kiếm hộ khẩu ...
    // ... Render vào #resultHKBody ...
};

// Các hàm mở modal
window.viewHistory = async function(id) {
    document.getElementById('modalHistory').classList.add('show');
    // ... Fetch API lịch sử và render ...
};

window.viewResidentDetail = async function(id) {
    document.getElementById('residentDetailModal').classList.add('show');
    // ... Fetch API chi tiết và điền vào input ...
};

window.viewHouseholdDetail = async function(maHo) {
    document.getElementById('householdDetailModal').classList.add('show');
    // ... Fetch API chi tiết hộ và render ...
};