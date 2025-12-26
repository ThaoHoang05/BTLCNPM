function postForm() {
    // 1. Lấy thông tin từ form (Cập nhật đủ ID theo form.html)
    const fullname = document.getElementById('fullname').value;
    const cccd = document.getElementById('cccd').value;           // Mới thêm
    const numberphone = document.getElementById('numberphone').value;
    const email = document.getElementById('email').value;
    const type = document.getElementById('type').value;
    const eventName = document.getElementById('event').value;     // Mới thêm (Sự kiện)
    const place = document.getElementById('place').value;
    const reason = document.getElementById('reason').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;

    // 2. Validate dữ liệu
    if (type === "default") {
        alert("Vui lòng chọn loại hình thuê!");
        return;
    }
    if (!fullname || !cccd || !numberphone || !eventName || !from || !to) {
        alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
        return;
    }
    if (new Date(to) <= new Date(from)) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
    }

    // 3. Đóng gói dữ liệu gửi đi
    const formData = {
        hoten: fullname,
        cccd: cccd,             // Mới
        phone: numberphone,
        email: email,
        loai: type,
        tenSuKien: eventName,   // Mới
        phongId: parseInt(place),         // Mới
        lydo: reason,
        batdau: from,
        ketthuc: to
    };

    console.log('Đang gửi dữ liệu:', formData);

    // 4. Gửi về Backend
    fetch('/api/nvh/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Lỗi mạng hoặc server: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        alert('Gửi đơn đăng ký thành công!');
        console.log('Server phản hồi:', data);
        // Có thể reset form sau khi gửi thành công
        document.getElementById('reqForm').reset();
    })
    .catch(error => {
        console.error('Lỗi khi gửi form:', error);
        alert('Đã xảy ra lỗi khi gửi form. Vui lòng kiểm tra lại!');
    });
}