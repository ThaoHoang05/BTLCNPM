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
function renderCalendar() {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    
    // Cập nhật tiêu đề tháng
    const monthEl = document.getElementById('currentMonth');
    if(monthEl) monthEl.innerText = `Tháng ${month + 1} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 (CN) -> 6 (T7)
    
    const calendarDays = document.getElementById('calendarDays');
    if(!calendarDays) return;

    // Reset nội dung
    calendarDays.innerHTML = `
        <div class="day-name">CN</div><div class="day-name">T2</div>
        <div class="day-name">T3</div><div class="day-name">T4</div>
        <div class="day-name">T5</div><div class="day-name">T6</div>
        <div class="day-name">T7</div>
    `;

    // Vẽ các ô trống trước ngày mùng 1
    for (let i = 0; i < startingDay; i++) {
        calendarDays.innerHTML += `<div></div>`;
    }

    // Vẽ các ngày trong tháng
    const today = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
        // Kiểm tra xem ngày này có sự kiện không
        const hasEvent = eventsData.some(e => {
            const eDate = new Date(e.thoiGian.tu); // API trả về thoiGian.tu
            return eDate.getDate() === i && 
                   eDate.getMonth() === month && 
                   eDate.getFullYear() === year;
        });

        // Xử lý class CSS
        let className = 'day';
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            className += ' today';
        }
        if (hasEvent) {
            className += ' has-event';
        }

        // Thêm HTML
        calendarDays.innerHTML += `
            <div class="${className}" onclick="showEventsForDay(${i}, ${month}, ${year})">
                ${i}
                <div class="event-dot"></div>
            </div>
        `;
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

// D. Hàm hiển thị chi tiết khi bấm vào ngày
function showEventsForDay(day, month, year) {
    // Xóa highlight cũ (nếu muốn làm kỹ hơn)
    // Lọc sự kiện của ngày được chọn
    const dayEvents = eventsData.filter(e => {
        const eDate = new Date(e.thoiGian.tu);
        return eDate.getDate() === day && 
               eDate.getMonth() === month && 
               eDate.getFullYear() === year;
    });

    const container = document.getElementById('eventListContainer');
    if (!container) return;

    if (dayEvents.length === 0) {
        container.innerHTML = `<p class="no-event-text">Ngày ${day}/${month+1}: Không có hoạt động chung.</p>`;
    } else {
        // Render danh sách sự kiện
        container.innerHTML = dayEvents.map(e => {
            const timeObj = new Date(e.thoiGian.tu);
            const timeStr = timeObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
            return `
                <div class="event-item">
                    <div class="event-time"><i class="far fa-clock"></i> ${timeStr} - Ngày ${day}/${month+1}</div>
                    <div class="event-title">${e.tenHD}</div>
                    <div class="event-loc"><i class="fas fa-map-marker-alt"></i> ${e.phong}</div>
                </div>
            `;
        }).join('');
    }
}