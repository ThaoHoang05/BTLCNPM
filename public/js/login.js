async function getUser(){
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    try{
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username,password: password })
    });
    const data = await response.json();
    if (response.ok) {
            alert('Login successful!');
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user_info', JSON.stringify(data.user));
            }
            alert("Đăng nhập thành công!");
            var role = data.user.role;
            switch(role){
                case 'admin':
                    window.location.href = '/admin/dashboard.html';
                    break;
                case 'teacher':
                    window.location.href = '/manager/dashboard.html';
                    break;
                case 'student':
                    window.location.href = '/resident/dashboard.html';
                    break;
                default:
                    window.location.href = '/index.html';
            }
        } else {
            alert('Login failed: ' + data.message);
    }
    }  catch(error){
        console.error('Error:', error);
        alert('An error occurred while trying to log in.');
    }
}