function handleCredentialResponse(response) {
    console.log(response);
    console.log(response.credential);
    sendLoginRequestToBackend(response.credential);
}

async function sendLoginRequestToBackend(accessToken) {
    var response = await fetch('http://localhost:8080/api/login/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: accessToken
    })
    var result = await response.json();

    if (response.status < 300) {
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", result.token);
        if (result.user.authorities.name === "ROLE_ADMIN") {
            window.location.href = 'admin/index';
        }
        if (result.user.authorities.name === "ROLE_USER") {
            window.location.href = 'index';
        }
    }
    if (response.status == exceptionCode) {
        if (result.errorCode == 300) {
            swal({
                title: "Thông báo",
                text: "Tài khoản chưa được kích hoạt, đi tới kích hoạt tài khoản!",
                type: "warning"
            }, function() {
                window.location.href = 'confirm?email=' + username
            });
        } else {
            toastr.warning(result.defaultMessage);
        }
    }
}


async function login() {
    var url = 'http://localhost:8080/api/login'
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value
    var user = {
        "username": username,
        "password": password,
        "tokenFcm":tokenFcm
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(user)
    });
    var result = await response.json();
    if (response.status < 300) {
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", result.token);
        if (result.user.authorities.name === "ROLE_ADMIN") {
            window.location.href = 'admin/index';
        }
        if (result.user.authorities.name === "ROLE_USER") {
            window.location.href = 'index';
        }
    }
    if (response.status == exceptionCode) {
        if (result.errorCode == 300) {
            swal({
                title: "Thông báo",
                text: "Tài khoản chưa được kích hoạt, đi tới kích hoạt tài khoản!",
                type: "warning"
            }, function() {
                window.location.href = 'confirm?email=' + username
            });
        } else {
            toastr.warning(result.defaultMessage);
        }
    }
}

async function regis() {
    var url = 'http://localhost:8080/api/regis'
    var email = document.getElementById("email").value
    var fullname = document.getElementById("fullname").value
    var phone = document.getElementById("phone").value
    var password = document.getElementById("password").value
    var user = {
        "fullname": fullname,
        "email": email,
        "phone": phone,
        "password": password
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(user)
    });
    var result = await response.json();
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "Đăng ký thành công! Vui lòng kiểm tra email của bạn!",
                type: "success"
            },
            function() {
                window.location.href = 'confirm?email=' + result.email
            });
    }
    if (response.status == exceptionCode) {
        toastr.warning(result.defaultMessage);
    }
}


async function confirmAccount() {
    var uls = new URL(document.URL)
    var email = uls.searchParams.get("email");
    var key = document.getElementById("maxacthuc").value;
    var url = 'http://localhost:8080/api/active-account?email=' + email + '&key=' + key
    const res = await fetch(url, {
        method: 'POST'
    });
    if (res.status < 300) {
        swal({
                title: "Thông báo",
                text: "Xác nhận tài khoản thành công!",
                type: "success"
            },
            function() {
                window.location.href = 'login'
            });
    }
    if (res.status == exceptionCode) {
        var result = await res.json()
        toastr.warning(result.defaultMessage);
    }
}

async function forgorPassword() {
    var email = document.getElementById("email").value
    var url = 'http://localhost:8080/api/forgot-password?email=' + email
    const res = await fetch(url, {
        method: 'POST'
    });
    if (res.status < 300) {
        swal({
                title: "",
                text: "mật khẩu mới đã được gửi về email của bạn",
                type: "success"
            },
            function() {
                window.location.replace("login")
            });
    }
    if (res.status == exceptionCode) {
        var result = await res.json()
        toastr.warning(result.defaultMessage);
    }
}

async function changePassword() {
    var token = localStorage.getItem("token");
    var oldpass = document.getElementById("oldpass").value
    var newpass = document.getElementById("newpass").value
    var renewpass = document.getElementById("renewpass").value
    var url = 'http://localhost:8080/api/user/change-password';
    if (newpass != renewpass) {
        alert("mật khẩu mới không trùng khớp");
        return;
    }
    var passw = {
        "oldPass": oldpass,
        "newPass": newpass
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(passw)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "cập nhật mật khẩu thành công, hãy đăng nhập lại",
                type: "success"
            },
            function() {
                window.location.reload();
            });
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function updateUserInfo() {
    var token = localStorage.getItem("token");
    var user = JSON.parse(localStorage.getItem("user"));

    var fullname = document.getElementById("fullname").value;
    var phone = document.getElementById("phone").value;
    var gender = document.getElementById("gender").value;
    var birthdate = document.getElementById("birthdate").value; // yyyy-mm-dd
    var email = user.email; // lấy từ user đang đăng nhập

    var updatedUser = {
        fullname: fullname,
        phone: phone,
        gender: gender,
        birthdate: birthdate,
        email: email
    };

    const response = await fetch('http://localhost:8080/api/user/update-info', {
        method: 'PUT',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(updatedUser)
    });

    if (response.status < 300) {
        swal({
            title: "Thành công",
            text: "Cập nhật thông tin người dùng thành công!",
            type: "success"
        }, function() {
            window.location.reload();
        });
    } else {
        var result = await response.json();
        toastr.warning(result.defaultMessage || "Cập nhật thất bại!");
    }
}


async function loadUserInfo() {
    const token = localStorage.getItem("token");
    if (!token) {
        toastr.error("Vui lòng đăng nhập!");
        window.location.href = "login";
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/user/profile', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
            const user = await response.json();

            
            localStorage.setItem("user", JSON.stringify(user));

            
            document.getElementById("fullname").value = user.fullname || "";
            document.getElementById("email").value = user.email || "";
            document.getElementById("phone").value = user.phone || "";

            
            const genderSelect = document.getElementById("gender");
            if (user.gender && ["Nam", "Nữ", "Khác"].includes(user.gender.trim())) {
                genderSelect.value = user.gender.trim();
            } else {
                genderSelect.value = "";
            }

            
            const birthdateInput = document.getElementById("birthdate");
            if (user.birthdate) {
                
                birthdateInput.value = user.birthdate;
            } else {
                birthdateInput.value = "";
            }

        } else {
            toastr.error("Không thể tải thông tin người dùng");
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        toastr.error("Lỗi server");
    }
}

async function updateUserInfo() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const updatedUser = {
        fullname: document.getElementById("fullname").value,
        phone: document.getElementById("phone").value,
        gender: document.getElementById("gender").value,
        birthdate: document.getElementById("birthdate").value,
        email: user.email
    };

    try {
        const response = await fetch('http://localhost:8080/api/user/update-info', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            toastr.success("Cập nhật thông tin thành công!");
            loadUserInfo(); 
        } else {
            const err = await response.json();
            toastr.error(err.defaultMessage || "Cập nhật thất bại");
        }
    } catch (error) {
        toastr.error("Lỗi kết nối server");
    }
}

window.addEventListener("load", function() {
    loadMenu();
    loadAddress();
    loadAddressUser();
    loadMyInvoice();
    loadUserInfo(); 
});