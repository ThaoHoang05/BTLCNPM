// Hàm mở Modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Hàm đóng Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Mở modal Chi tiết hộ
function openDetailModal(hkCode) {
    const titleElement = document.getElementById('detailHKCode');
    if (titleElement) {
        titleElement.innerText = hkCode;
    }
    // Gán onclick cho nút Thêm thành viên bên trong Modal Chi tiết để nó biết đang thêm vào hộ nào
    const addBtn = document.querySelector('#detailModal .btn-primary');
    if(addBtn) {
        addBtn.setAttribute('onclick', `openAddMemberModal('${hkCode}')`);
    }
    openModal('detailModal');
}

// Mở modal Thêm thành viên (Có tham số hkCode)
function openAddMemberModal(hkCode) {
    const form = document.getElementById('memberForm');
    form.reset();
    
    // Nếu có mã hộ truyền vào, điền tự động và khóa lại
    if(hkCode) {
        const hkInput = form.querySelector('input[name="sohokhau"]');
        if(hkInput) {
            hkInput.value = hkCode;
        }
    }
    openModal('addMemberModal');
}

function openSplitModal(hkCode) {
    openModal('splitModal');
}

function deleteHousehold(hkCode) {
    if(confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ thông tin của hộ ' + hkCode + ' không?')) {
        alert('Đã xóa hộ ' + hkCode);
    }
}

// Hàm mở Modal Sửa và Binding dữ liệu mẫu
function openEditHouseholdModal(hkCode) {
    const form = document.getElementById('editHouseholdForm');
    
    // Giả lập dữ liệu (Data Binding)
    if (hkCode === 'HK001') {
        form.querySelector('input[name="sohokhau"]').value = 'HK001';
        form.querySelector('input[name="ngaylap"]').value = '2010-05-15';

        // --- Dữ liệu Chủ hộ ---
        form.querySelector('input[name="chuhoten"]').value = 'Nguyễn Văn A'; // Mới thêm
        form.querySelector('input[name="chuhocccd"]').value = '001190000001'; 
        
        // --- Dữ liệu Địa chỉ ---
        form.querySelector('input[name="sonha"]').value = '10A';
        form.querySelector('input[name="duong"]').value = 'Nguyễn Trãi';
        form.querySelector('input[name="phuong"]').value = 'La Khê';
        form.querySelector('input[name="quan"]').value = 'Hà Đông';
        form.querySelector('input[name="tinh"]').value = 'Hà Nội';

        form.querySelector('input[name="ghichu"]').value = 'Hộ Tổ trưởng';
    } else {
        // Reset form cho trường hợp thêm mới hoặc không tìm thấy
        form.reset();
        form.querySelector('input[name="sohokhau"]').value = hkCode;
    }

    openModal('editHouseholdModal');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Quản lý Hộ khẩu đã sẵn sàng!');
});