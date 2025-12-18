async function handleLogout() {
    try {
        await fetch('/api/logout', { method: 'POST' });

        // Xóa toàn bộ dữ liệu đã lưu khi login
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');

        // Thông báo và chuyển hướng về trang chủ
        alert('Bạn đã đăng xuất thành công!');
        window.location.href = '/pages/index.html';

    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        // Vẫn xóa dữ liệu cục bộ nếu API lỗi để đảm bảo an toàn
        localStorage.clear();
        window.location.href = '/pages/common/login.html';
    }
}