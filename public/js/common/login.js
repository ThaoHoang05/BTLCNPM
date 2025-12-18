async function getUser(event) {
    if (event) event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        // Debug
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (!response.ok || !data.success) {
            alert(data.message || 'Login failed');
            return;
        }

        if (!data.user || !data.user.role) {
            console.error('Invalid user data:', data);
            alert('Dữ liệu người dùng không hợp lệ');
            return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user)); 

        alert('Đăng nhập thành công!');

        const role = data.user.role;
        switch (role) {
            case 'ToTruong':
                window.location.href = '/pages/admin/dashboard.html';
                break;
            case 'ToPho':
            case 'CanBo':
                window.location.href = '/pages/manager/dashboard.html';
                break;
            case 'NguoiDan':
                window.location.href = '/pages/resident/dashboard.html';
                break;
            default:
                alert('Role không hợp lệ: ' + role);
                // Xóa data nếu role sai để tránh lỗi
                handleLogout(); 
        }

    } catch (error) {
        console.error('JS ERROR:', error);
        alert('An error occurred while trying to log in.');
    }
}