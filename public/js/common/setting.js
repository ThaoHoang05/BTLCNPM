async function handleChangePassword(event) {
    event.preventDefault(); 

    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    // Validate logic
    if (newPass !== confirmPass) {
        alert("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        return;
    }

    // Lấy user từ localStorage
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        alert("Vui lòng đăng nhập lại.");
        return;
    }
    const user = JSON.parse(userString);
    const username = user.username;

    // Gửi API
    try {
        const response = await fetch(`/api/changepassword/${username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                password: newPass,
                oldPassword: oldPass
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            if (typeof handleLogout === 'function') {
                handleLogout();
            } else {
                window.location.href = '../../index.html';
            }
        } else {
            alert("Lỗi: " + (data.message || "Đổi mật khẩu thất bại."));
        }

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Không thể kết nối đến server.");
    }
}