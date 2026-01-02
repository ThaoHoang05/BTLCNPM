// ==========================================
// 1. LOGIC SLIDER TIN TỨC (Tự động chạy)
// ==========================================
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function nextSlide() {
    if (slides.length === 0) return; // Tránh lỗi nếu không có slide
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Chuyển slide mỗi 4 giây
setInterval(nextSlide, 4000);


// ==========================================
// 2. LOGIC LỊCH & API BACKEND
// ==========================================
let displayDate = new Date();
let eventsData = []; // Biến chứa dữ liệu tải từ Server

// Khởi chạy khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    fetchEvents(); // Gọi API lấy dữ liệu
    renderCalendar(); // Vẽ lịch (lúc đầu chưa có chấm xanh)
});

// A. Hàm gọi API
async function fetchEvents() {
    try {
        // API này đã được bạn định nghĩa trong nhaVanHoaRoutes.js
        const response = await fetch('/api/nvh/HDchung'); 
        
        if (response.ok) {
            eventsData = await response.json();
            // Sau khi có dữ liệu, vẽ lại lịch để hiện chấm xanh
            renderCalendar(); 
        } else {
            console.error("Không thể tải lịch hoạt động.");
        }
    } catch (error) {
        console.error("Lỗi kết nối API lịch:", error);
    }
}

// B. Hàm vẽ lịch
// ==========================================
// 2. LOGIC LỊCH & API BACKEND (CẬP NHẬT)
// ==========================================

// ... (Giữ nguyên các phần trên, chỉ thay đổi hàm renderCalendar và showEventsForDay)

// B. Hàm vẽ lịch
function renderCalendar() {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    
    // Cập nhật tiêu đề tháng
    const monthEl = document.getElementById('currentMonth');
    if(monthEl) monthEl.innerText = `Tháng ${month + 1} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); 
    
    const calendarDays = document.getElementById('calendarDays');
    if(!calendarDays) return;

    calendarDays.innerHTML = `
        <div class="day-name">CN</div><div class="day-name">T2</div>
        <div class="day-name">T3</div><div class="day-name">T4</div>
        <div class="day-name">T5</div><div class="day-name">T6</div>
        <div class="day-name">T7</div>
    `;

    for (let i = 0; i < startingDay; i++) {
        calendarDays.innerHTML += `<div></div>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset giờ hiện tại về 0 để so sánh chuẩn

    for (let i = 1; i <= daysInMonth; i++) {
        // Tạo đối tượng Date cho ngày đang render trên lịch
        const currentRenderDate = new Date(year, month, i);
        currentRenderDate.setHours(0, 0, 0, 0); // Đầu ngày

        // --- SỬA ĐỔI LOGIC KIỂM TRA SỰ KIỆN Ở ĐÂY ---
        const hasEvent = eventsData.some(e => {
            const startDate = new Date(e.thoiGian.tu);
            startDate.setHours(0, 0, 0, 0); // Tính từ đầu ngày bắt đầu

            const endDate = new Date(e.thoiGian.den);
            endDate.setHours(23, 59, 59, 999); // Tính đến cuối ngày kết thúc

            // Kiểm tra nếu ngày đang render nằm trong khoảng [startDate, endDate]
            return currentRenderDate >= startDate && currentRenderDate <= endDate;
        });
        // ----------------------------------------------

        let className = 'day';
        // So sánh ngày hôm nay
        if (currentRenderDate.getTime() === today.getTime()) {
            className += ' today';
        }
        if (hasEvent) {
            className += ' has-event';
        }

        calendarDays.innerHTML += `
            <div class="${className}" onclick="showEventsForDay(${i}, ${month}, ${year})">
                ${i}
                <div class="event-dot"></div>
            </div>
        `;
    }
}

// D. Hàm hiển thị chi tiết khi bấm vào ngày
function showEventsForDay(day, month, year) {
    // Tạo đối tượng Date cho ngày được click
    const clickDate = new Date(year, month, day);
    clickDate.setHours(0, 0, 0, 0);

    // --- SỬA ĐỔI LOGIC LỌC SỰ KIỆN Ở ĐÂY ---
    const dayEvents = eventsData.filter(e => {
        const startDate = new Date(e.thoiGian.tu);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(e.thoiGian.den);
        endDate.setHours(23, 59, 59, 999);

        // Lấy tất cả sự kiện đang diễn ra trong ngày được click
        return clickDate >= startDate && clickDate <= endDate;
    });
    // -----------------------------------------

    const container = document.getElementById('eventListContainer');
    if (!container) return;

    if (dayEvents.length === 0) {
        container.innerHTML = `<p class="no-event-text">Ngày ${day}/${month+1}: Không có hoạt động chung.</p>`;
    } else {
        container.innerHTML = dayEvents.map(e => {
            // Format hiển thị thời gian: Từ ... Đến ...
            const startObj = new Date(e.thoiGian.tu);
            const endObj = new Date(e.thoiGian.den);
            
            const startStr = startObj.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) + ' ' + startObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
            const endStr = endObj.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) + ' ' + endObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

            return `
                <div class="event-item">
                    <div class="event-time"><i class="far fa-clock"></i> ${startStr} - ${endStr}</div>
                    <div class="event-title">${e.tenHD}</div>
                    <div class="event-loc"><i class="fas fa-map-marker-alt"></i> ${e.phong}</div>
                </div>
            `;
        }).join('');
    }
}
// C. Hàm chuyển tháng (Nút < >)
function changeMonth(offset) {
    displayDate.setMonth(displayDate.getMonth() + offset);
    renderCalendar();
    // Reset phần hiển thị chi tiết bên dưới
    const container = document.getElementById('eventListContainer');
    if(container) container.innerHTML = '<p class="no-event-text">Chọn ngày để xem chi tiết.</p>';
}
