// --- MODULE NHÂN KHẨU ---

function openEditCitizenModal(cccd) {
    // Logic điền dữ liệu vào form sửa (Data Binding)
    // ...
    openModal('editCitizenModal');
}

function deleteCitizen(cccd) {
    if(confirm('Bạn có chắc muốn xóa nhân khẩu này không?')) {
        // API Call delete...
        alert('Đã xóa!');
    }
}