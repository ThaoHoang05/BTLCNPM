function postForm() {

    // Lấy thông tin từ form
    const fullname = document.getElementById('fullname').value;
    const numberphone = document.getElementById('numberphone').value;
    const email = document.getElementById('email').value;
    const type = document.getElementById('type').value;
    const reason = document.getElementById('reason').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;

    // Kiểm tra dữ liệu trước khi gửi
    if (type === "default") {
        alert("Vui lòng chọn loại hình thuê!");
        return;
    }
    if (new Date(to) <= new Date(from)) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
    }

    // Tạo đối tượng dữ liệu để gửi
    const formData = {
        hoten: fullname,
        phone: numberphone,
        email: email,
        loai: type,
        lydo: reason,
        batdau: from,
        ketthuc: to
    };

    console.log('Form Data to be sent:', formData);
    // Gửi dữ liệu đến backend bằng fetch
    fetch('/api/nvh/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Xử lý kết quả trả về từ backend
        alert('Form submitted successfully!');
        console.log('Response from server:', data);
    })
    .catch(error => {
        // Xử lý lỗi
        console.error('There was a problem with the fetch operation:', error);
        alert('Đã xảy ra lỗi khi gửi form. Vui lòng thử lại!');
    });
}