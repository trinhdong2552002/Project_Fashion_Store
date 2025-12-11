var token = localStorage.getItem("token");
// show 10 items per page
var size = 10;

// track current state for pagination
var currentPageV = 0;
var currentStart = null;
var currentEnd = null;

async function loadVoucher(page, start, end) {
    // store current filters
    currentPageV = page || 0;
    currentStart = start || null;
    currentEnd = end || null;

    var url = 'http://localhost:8080/api/voucher/admin/findAll-page?page=' + currentPageV + '&size=' + size;
    if (currentStart != null && currentStart != "" && currentEnd != null && currentEnd != "" && currentStart != 'null' && currentEnd != 'null') {
        url += '&start=' + currentStart + '&end=' + currentEnd
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
        }),
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;
    var main = '';
    for (i = 0; i < list.length; i++) {
        main += `<tr>
                    <td>${list[i].id}</td>
                    <td>${list[i].code}</td>
                    <td>${list[i].name}</td>
                    <td>${formatmoney(list[i].minAmount)}</td>
                    <td>${formatmoney(list[i].discount)}</td>
                    <td>${list[i].startDate}</td>
                    <td>${list[i].endDate}</td>
                    <td>${list[i].block == true ? '<span class="locked">Đã khóa</span>':'<span class="actived">Đang hoạt động</span>'}</td>
                    <td class="sticky-col">
                            <i onclick="deleteVoucher(${list[i].id})" class="fa fa-trash iconaction"></i>
                            <a href="addvoucher?id=${list[i].id}"><i class="fa fa-edit iconaction"></i></a>
                    </td>
                </tr>`
    }
    document.getElementById("listvoucher").innerHTML = main
    // build pagination with prev/next and active page
    var mainpage = ''
    var prevDisabled = currentPageV <= 0 ? ' disabled' : '';
    var nextDisabled = currentPageV >= (totalPage - 1) ? ' disabled' : '';

    mainpage += `<li class="page-item${prevDisabled}"><a class="page-link" href="#" onclick="${prevDisabled ? 'return false' : 'loadVoucher(' + (currentPageV - 1) + ', currentStart, currentEnd)'}">&laquo;</a></li>`;
    for (i = 1; i <= totalPage; i++) {
        var pageIndex = i - 1;
        var active = pageIndex === currentPageV ? ' active' : '';
        mainpage += `<li class="page-item${active}"><a class="page-link" href="#" onclick="loadVoucher(${pageIndex}, currentStart, currentEnd)">${i}</a></li>`
    }
    mainpage += `<li class="page-item${nextDisabled}"><a class="page-link" href="#" onclick="${nextDisabled ? 'return false' : 'loadVoucher(' + (currentPageV + 1) + ', currentStart, currentEnd)'}">&raquo;</a></li>`;

    document.getElementById("pageable").innerHTML = mainpage
}


async function filter() {
    var start = document.getElementById("start").value
    var end = document.getElementById("end").value
    if (start != "" && end != "") {
        loadVoucher(0, start, end);
    }
}


async function loadAVoucher() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    if (id != null) {
        var url = 'http://localhost:8080/api/voucher/admin/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await response.json();
        document.getElementById("code").value = result.code
        document.getElementById("namevoucher").value = result.name
        document.getElementById("minamount").value = result.minAmount
        document.getElementById("discount").value = result.discount
        document.getElementById("from").value = result.startDate
        document.getElementById("to").value = result.endDate
        result.block == true ? document.getElementById("lockvoucher").checked = true : false;
    }
}

async function saveVoucher() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    var code = document.getElementById("code").value
    var namevoucher = document.getElementById("namevoucher").value
    var minamount = document.getElementById("minamount").value
    var discount = document.getElementById("discount").value
    var from = document.getElementById("from").value
    var to = document.getElementById("to").value
    var lockvoucher = document.getElementById("lockvoucher").checked

    // validate inputs before submit
    var validationError = validateVoucherInput({
        code: code,
        name: namevoucher,
        minAmount: minamount,
        discount: discount,
        startDate: from,
        endDate: to,
    });
    if (validationError) {
        toastr.warning(validationError);
        return;
    }

    var url = 'http://localhost:8080/api/voucher/admin/create';
    if (id != null) {
        url = 'http://localhost:8080/api/voucher/admin/update';
    }
    var voucher = {
        "id": id,
        "code": code,
        "name": namevoucher,
        "discount": discount,
        "minAmount": minamount,
        "startDate": from,
        "endDate": to,
        "block": lockvoucher
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(voucher)
    });
    if (response.status < 300) {
        swal({
                title: "Thông báo",
                text: "Thêm/sửa voucher thành công!",
                type: "success"
            },
            function() {
                window.location.href = 'voucher'
            });
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

async function deleteVoucher(id) {
    var con = confirm("Bạn chắc chắn muốn xóa voucher này?");
    if (con == false) {
        return;
    }
    var url = 'http://localhost:8080/api/voucher/admin/delete?id=' + id;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    if (response.status < 300) {
        toastr.success("xóa voucher thành công!");
        await new Promise(r => setTimeout(r, 1000));
        window.location.reload();
    }
    if (response.status == exceptionCode) {
        var result = await response.json()
        toastr.warning(result.defaultMessage);
    }
}

// Client-side validation helpers
function isPositiveNumber(val) {
    if (val === null || val === undefined || val === '') return false;
    var num = Number(val);
    return Number.isFinite(num) && num >= 0;
}

function parseDate(val) {
    if (!val) return null;
    // Expect format yyyy-MM-dd from input[type=date]
    var d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
}

function validateVoucherInput(v) {
    // Required fields
    if (!v.code || v.code.trim().length === 0) return "Mã voucher không được để trống";
    if (!v.name || v.name.trim().length === 0) return "Tên voucher không được để trống";
    if (!isPositiveNumber(v.minAmount)) return "Số tiền tối thiểu phải là số không âm";
    if (!isPositiveNumber(v.discount)) return "Giảm giá phải là số không âm";

    // Date validations
    var start = parseDate(v.startDate);
    var end = parseDate(v.endDate);
    if (!start) return "Vui lòng chọn ngày bắt đầu hợp lệ";
    if (!end) return "Vui lòng chọn ngày kết thúc hợp lệ";
    if (start > end) return "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc";

    // Business rules (optional): discount should not exceed minAmount
    var minAmountNum = Number(v.minAmount);
    var discountNum = Number(v.discount);
    if (discountNum > minAmountNum) return "Giảm giá không được lớn hơn Số tiền tối thiểu";

    return null; // no error
}