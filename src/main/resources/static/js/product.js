var size = 10;
async function loadProductIndex(page) {
    var url = 'http://localhost:8080/api/product/public/findAll?page=' + page + '&size=' + size;
    const response = await fetch(url, {
        method: 'GET'
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        var listimg = ''
        for (j = 0; j < list[i].productImages.length; j++) {
            listimg += `<div class="divimgsmpro"><img class="imgsmpro" src="${list[i].productImages[j].linkImage}"></div>`
        }
        main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
                    <a href="detail?id=${list[i].id}&name=${list[i].alias}" class="linkpro">
                        <div class="singlepro">
                            <div class="productsold"><span class="reviewsp">Đã bán: ${list[i].quantitySold}</span></div>
                            <img src="${list[i].imageBanner}" class="imgpro">
                            <span class="proname">${list[i].name}</span>
                            <span class="proprice">${formatmoney(list[i].price)}</span>
                            <div class="listimgpro">${listimg}</div>
                        </div>
                    </a>
                </div>`
    }
    document.getElementById("listproductindex").innerHTML = main

    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadProductIndex(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}


async function loadSanPhamBanChay(page) {
    var url = 'http://localhost:8080/api/product/public/findAll?page=' + page + '&size=' + size+'&sort=quantitySold,desc';
    const response = await fetch(url, {
        method: 'GET'
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        var listimg = ''
        for (j = 0; j < list[i].productImages.length; j++) {
            listimg += `<div class="divimgsmpro"><img class="imgsmpro" src="${list[i].productImages[j].linkImage}"></div>`
        }
        main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
                    <a href="detail?id=${list[i].id}&name=${list[i].alias}" class="linkpro">
                        <div class="singlepro">
                            <div class="productsold"><span class="reviewsp">Đã bán: ${list[i].quantitySold}</span></div>
                            <img src="${list[i].imageBanner}" class="imgpro">
                            <span class="proname">${list[i].name}</span>
                            <span class="proprice">${formatmoney(list[i].price)}</span>
                            <div class="listimgpro">${listimg}</div>
                        </div>
                    </a>
                </div>`
    }
    document.getElementById("listproductbanchay").innerHTML = main

    if(result.last == false){
        document.getElementById("btnsanphambanchay").onclick=function(){
            loadSanPhamBanChay(Number(page) + Number(1));
        }
    }
    else{
        document.getElementById("btnsanphambanchay").onclick=function(){
            toastr.warning("Đã hết kết quả tìm kiếm");
        }
    }
}



async function loadAProduct() {
    var uls = new URL(document.URL)
    var id = uls.searchParams.get("id");
    if (id != null) {
        var url = 'http://localhost:8080/api/product/public/findById?id=' + id;
        const response = await fetch(url, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        var result = await response.json();
        document.getElementById("detailnamepro").innerHTML = result.name
        document.getElementById("codepro").innerHTML = result.code
        document.getElementById("quansale").innerHTML = 'Đã bán ' + result.quantitySold
        document.getElementById("pricedetail").innerHTML = formatmoney(result.price)
        document.getElementById("imgdetailpro").src = result.imageBanner
        document.getElementById("descriptiondetail").innerHTML = result.description
        document.getElementById("btnaddcart").onclick = function() {
            addCart(result);
        }
        // "Buy now" button: add to cart and redirect to checkout
        var btnMuaNgay = document.getElementById("btnmuangay");
        if (btnMuaNgay) {
            btnMuaNgay.onclick = function (e) {
                // Build buy-now item (do not touch persistent 'product_cart')
                var sizeId = null;
                try {
                    sizeId = document.querySelector('input[name="sizepro"]:checked').value;
                } catch (error) {
                    toastr.error("Bạn chưa chọn kích thước sản phẩm");
                    return;
                }
                var color = null;
                var size = null;
                var listColor = result.productColors;
                for (i = 0; i < listColor.length; i++) {
                    if (listColor[i].id == idColorCart) {
                        color = listColor[i];
                    }
                }
                if (!color) {
                    toastr.error("Bạn chưa chọn màu sản phẩm");
                    return;
                }
                var listSize = color.productSizes;
                for (i = 0; i < listSize.length; i++) {
                    if (listSize[i].id == sizeId) {
                        size = listSize[i];
                    }
                }
                var obj = {
                    product: result,
                    color: color,
                    size: size,
                    quantiy: document.getElementById("inputslcart").value,
                };
                // store in temporary buy_now key and redirect to checkout which will prefer buy_now
                window.localStorage.setItem('buy_now', JSON.stringify([obj]));
                setTimeout(function () {
                    // indicate buy-now usage via query param (optional) and navigate
                    window.location.href = 'checkout?buyNow=true';
                }, 150);
            }
        }
        var main = ''
        for (i = 0; i < result.productImages.length; i++) {
            main += `<div class="col-lg-2 col-md-2 col-sm-2 col-2 singdimg">
                        <img onclick="clickImgdetail(this)" src="${result.productImages[i].linkImage}" class="imgldetail">
                    </div>`
        }
        document.getElementById("listimgdetail").innerHTML = main

        var main = ''
        for (i = 0; i < result.productColors.length; i++) {
            main += `<div class="col-lg-2 col-md-2 col-sm-2 col-2 singdimg">
                        <img onclick="clickColor(this,'${result.productColors[i].colorName}',${result.productColors[i].id})" src="${result.productColors[i].linkImage}" class="imgldetail imgcolordt">
                    </div>`
        }
        document.getElementById("listimgColor").innerHTML = main
        if (result.productColors.length > 0) {
            var imgF = document.getElementsByClassName("imgcolordt")[0];
            clickColor(imgF, result.productColors[0].colorName, result.productColors[0].id);
        }

        var listCate = [];
        for (i = 0; i < result.productCategories.length; i++) {
            listCate.push(result.productCategories[i].category.id);
        }
        var url = 'http://localhost:8080/api/product/public/searchFull?page=0&size=6';
        const res = await fetch(url, {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(listCate)
        });
        var resultLq = await res.json();
        var list = resultLq.content
        var main = ''
        for (i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                continue;
            }
            var listimg = ''
            for (j = 0; j < list[i].productImages.length; j++) {
                listimg += `<div class="divimgsmpro"><img class="imgsmpro" src="${list[i].productImages[j].linkImage}"></div>`
            }
            main += `<div class="col-lg-20p col-md-3 col-sm-6 col-6">
                    <a href="detail?id=${list[i].id}&name=${list[i].alias}" class="linkpro">
                        <div class="singlepro">
                            <div class="productsold"><span class="reviewsp">Đã bán: ${list[i].quantitySold}</span></div>
                            <img src="${list[i].imageBanner}" class="imgpro">
                            <span class="proname">${list[i].name}</span>
                            <span class="proprice">${formatmoney(list[i].price)}</span>
                            <div class="listimgpro">${listimg}</div>
                        </div>
                    </a>
                </div>`
        }
        document.getElementById("listProductGy").innerHTML = main;

        // attach quantity input validation after product loads
        attachQtyInputValidation();
    }
}

async function clickColor(e, name, idColor) {
    idColorCart = idColor;
    var img = document.getElementsByClassName("imgldetail");
    for (i = 0; i < img.length; i++) {
        document.getElementsByClassName("imgldetail")[i].classList.remove('imgactive');
    }
    e.classList.add('imgactive')
    document.getElementById("colorname").innerHTML = name
    var url = 'http://localhost:8080/api/product-size/public/find-by-product-color?idProColor=' + idColor;
    const response = await fetch(url, {});
    var list = await response.json();
    var main = ''
    var hasAvailable = false;
    for (i = 0; i < list.length; i++) {
        var qty = Number(list[i].quantity);
        var disabledClass = qty <= 0 ? ' disabled-size' : '';
        var disabledAttr = qty <= 0 ? ' aria-disabled="true"' : '';
        var opacityStyle = qty <= 0 ? ' style="opacity:0.5; pointer-events:none;"' : '';
        var onClick = qty <= 0 ? '' : `onclick="clickSize(this)"`;
        if (qty > 0) { hasAvailable = true; }
        main += `<div class="colsize col-lg-2 col-md-2 col-sm-2 col-2">
                    <label class="radio-custom${disabledClass}" ${onClick} ${disabledAttr} data-max="${qty}"${opacityStyle}>
                        ${list[i].sizeName}
                        <input type="radio" name="sizepro" value="${list[i].id}" />
                    </label>
                    ${qty <= 0 ? '<div class="size-out pt-2 text-muted">Số lượng đã hết</div>' : ''}
                </div>`
    }
    document.getElementById("listsize").innerHTML = main;
    // If at least one size available, auto-select first available
    if (hasAvailable) {
        var labels = document.querySelectorAll('#listsize .radio-custom:not(.disabled-size)');
        if (labels.length > 0) {
            clickSize(labels[0]);
        }
    }
}

async function clickImgdetail(e) {
    var img = document.getElementsByClassName("imgldetail");
    for (i = 0; i < img.length; i++) {
        document.getElementsByClassName("imgldetail")[i].classList.remove('imgactive');
    }
    e.classList.add('imgactive')
    document.getElementById("imgdetailpro").src = e.src
}

function clickSize(e) {
    var size = document.getElementsByClassName("radio-custom");
    for (i = 0; i < size.length; i++) {
        document.getElementsByClassName("radio-custom")[i].classList.remove('activesize');
    }
    e.classList.add('activesize')
    var inp = e.getElementsByTagName('input')[0]
    inp.checked = 'checked'
    // set max quantity for +/- controls based on selected size
    var max = Number(e.getAttribute('data-max') || '0');
    document.getElementById('inputslcart').setAttribute('data-max', String(max));
    // ensure current input does not exceed max
    var inpQuan = document.getElementById('inputslcart');
    var cur = Number(inpQuan.value || '1');
    if (max > 0 && cur > max) {
        inpQuan.value = String(max);
        toastr.warning('Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này');
    }
}

function upAndDownDetail(val) {
    var quan = document.getElementById("inputslcart").value;
    var max = Number(document.getElementById('inputslcart').getAttribute('data-max') || '0');
    if (val < 0 && quan == 1) {
        return;
    }
    var next = Number(quan) + Number(val);
    if (max > 0 && next > max) {
        toastr.warning('Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này');
        return;
    }
    if (next <= 0) { next = 1; }
    document.getElementById("inputslcart").value = next
}

// Validate manual input on quantity field to respect max/min
function attachQtyInputValidation() {
    var input = document.getElementById('inputslcart');
    if (!input) return;
    var handler = function() {
        var max = Number(input.getAttribute('data-max') || '0');
        var raw = String(input.value || '1');
        // allow only digits
        var digits = raw.replace(/\D/g, '');
        if (digits === '') digits = '1';
        var num = Number(digits);
        if (num <= 0) num = 1;
        if (max > 0 && num > max) {
            num = max;
            toastr.warning('Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này');
        }
        input.value = String(num);
    };
    input.addEventListener('input', handler);
    input.addEventListener('blur', handler);
}


var type = 1;

function sortProduct() {
    var sort = document.getElementById("sortpro").value;
    if (type == 1) {
        loadProductByCategory(0, sort);
    }
    if (type == 2) {
        searchFull(0, sort);
    }
    if (type == 3) {
        searchFullmobile(0, sort);
    }
}

async function loadProductByCategory(page, sort) {
    var uls = new URL(document.URL)
    var category = uls.searchParams.get("category");
    var url = 'http://localhost:8080/api/product/public/findByCategory?page=' + page + '&size=' + size + '&idCategory=' + category;
    if (sort != null & sort != "") {
        url = 'http://localhost:8080/api/product/public/findByCategory?page=' + page + '&size=' + size + '&idCategory=' + category + '&sort=' + sort;
    }
    const response = await fetch(url, {
        method: 'GET'
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        var listimg = ''
        for (j = 0; j < list[i].productImages.length; j++) {
            listimg += `<div class="divimgsmpro"><img class="imgsmpro" src="${list[i].productImages[j].linkImage}"></div>`
        }
        main += `<div class="col-lg-3 col-md-3 col-sm-6 col-6">
                    <a href="detail?id=${list[i].id}&name=${list[i].alias}" class="linkpro">
                        <div class="singlepro">
                            <div class="productsold"><span class="reviewsp">Đã bán: ${list[i].quantitySold}</span></div>
                            <img src="${list[i].imageBanner}" class="imgpro">
                            <span class="proname">${list[i].name}</span>
                            <span class="proprice">${formatmoney(list[i].price)}</span>
                            <div class="listimgpro">${listimg}</div>
                        </div>
                    </a>
                </div>`
    }
    document.getElementById("listproductpro").innerHTML = main
    document.getElementById("slsp").innerHTML = result.totalElements

    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadProductByCategory(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}

async function searchFull(page, sort) {
    type = 2;
    var min_price = document.getElementById("min_price").value;
    var max_price = document.getElementById("max_price").value;
    var listCa = document.getElementById("listsearchCategory").getElementsByClassName("inputcheck");
    var listcate = [];
    for (i = 0; i < listCa.length; i++) {
        if (listCa[i].checked == true) {
            listcate.push(listCa[i].value);
        }
    }
    var url = 'http://localhost:8080/api/product/public/searchFull?page=' + page + '&size=' + size + '&smallPrice=' + min_price + '&largePrice=' + max_price;
    if (sort != null) {
        url += '&sort=' + sort;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(listcate)
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        var listimg = ''
        for (j = 0; j < list[i].productImages.length; j++) {
            listimg += `<div class="divimgsmpro"><img class="imgsmpro" src="${list[i].productImages[j].linkImage}"></div>`
        }
        main += `<div class="col-lg-3 col-md-3 col-sm-6 col-6">
                    <a href="detail?id=${list[i].id}&name=${list[i].alias}" class="linkpro">
                        <div class="singlepro">
                            <div class="productsold"><span class="reviewsp">Đã bán: ${list[i].quantitySold}</span></div>
                            <img src="${list[i].imageBanner}" class="imgpro">
                            <span class="proname">${list[i].name}</span>
                            <span class="proprice">${formatmoney(list[i].price)}</span>
                            <div class="listimgpro">${listimg}</div>
                        </div>
                    </a>
                </div>`
    }
    document.getElementById("listproductpro").innerHTML = main
    document.getElementById("slsp").innerHTML = result.totalElements

    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadProductByCategory(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}

async function searchFullmobile(page, sort) {
    type = 3;
    $("#modalfilter").modal("hide")
    var min_price = document.getElementById("min_price_mobile").value;
    var max_price = document.getElementById("max_price_mobile").value;
    var listCa = document.getElementById("listsearchCategoryMobile").getElementsByClassName("inputcheck");
    var listcate = [];
    for (i = 0; i < listCa.length; i++) {
        if (listCa[i].checked == true) {
            listcate.push(listCa[i].value);
        }
    }
    var url = 'http://localhost:8080/api/product/public/searchFull?page=' + page + '&size=' + size + '&smallPrice=' + min_price + '&largePrice=' + max_price;
    if (sort != null) {
        url += '&sort=' + sort;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(listcate)
    });
    var result = await response.json();
    console.log(result)
    var list = result.content;
    var totalPage = result.totalPages;

    var main = '';
    for (i = 0; i < list.length; i++) {
        var listimg = ''
        for (j = 0; j < list[i].productImages.length; j++) {
            listimg += `<div class="divimgsmpro"><img class="imgsmpro" src="${list[i].productImages[j].linkImage}"></div>`
        }
        main += `<div class="col-lg-3 col-md-3 col-sm-6 col-6">
                    <a href="detail?id=${list[i].id}&name=${list[i].alias}" class="linkpro">
                        <div class="singlepro">
                            <div class="productsold"><span class="reviewsp">Đã bán: ${list[i].quantitySold}</span></div>
                            <img src="${list[i].imageBanner}" class="imgpro">
                            <span class="proname">${list[i].name}</span>
                            <span class="proprice">${formatmoney(list[i].price)}</span>
                            <div class="listimgpro">${listimg}</div>
                        </div>
                    </a>
                </div>`
    }
    document.getElementById("listproductpro").innerHTML = main
    document.getElementById("slsp").innerHTML = result.totalElements

    var mainpage = ''
    for (i = 1; i <= totalPage; i++) {
        mainpage += `<li onclick="loadProductByCategory(${(Number(i) - 1)})" class="page-item"><a class="page-link" href="#listsp">${i}</a></li>`
    }
    document.getElementById("pageable").innerHTML = mainpage
}


async function loadCategorySub() {
    var url = 'http://localhost:8080/api/category/public/findPrimaryCategory';
    const response = await fetch(url, {});
    var list = await response.json();
    var main = ''
    for (i = 0; i < list.length; i++) {
        var listChild = list[i].categories;
        var mainChild = ''
        for (j = 0; j < listChild.length; j++) {
            mainChild += ` <label class="checkbox-custom">${listChild[j].name}
                                <input value="${listChild[j].id}" class="inputcheck" type="checkbox">
                                <span class="checkmark-checkbox"></span>
                            </label>`
        }
        main += `<div class="singlelistmenu">
                <label class="checkbox-custom cateparent">${list[i].name}</i>
                    <input value="${list[i].id}" class="inputcheck" onchange="clickOpenSubMenu(this)" type="checkbox">
                    <span class="checkmark-checkbox"></span>
                </label>
                <div class="listsubcate">
                   ${mainChild}
                </div>
            </div>`
    }
    document.getElementById("listsearchCategory").innerHTML = main;
    document.getElementById("listsearchCategoryMobile").innerHTML = main;
}

function clickOpenSubMenu(e) {
    var sing = e.parentNode.parentNode
    console.log(sing)
    if (sing.getElementsByClassName("listsubcate")[0].classList.contains("show") == false) {
        sing.getElementsByClassName("listsubcate")[0].classList.add("show");
    } else if (sing.getElementsByClassName("listsubcate")[0].classList.contains("show") == true) {
        sing.getElementsByClassName("listsubcate")[0].classList.remove("show");
        var listInput = sing.getElementsByClassName("listsubcate")[0].getElementsByClassName("inputcheck");
        for (i = 0; i < listInput.length; i++) {
            listInput[i].checked = false;
        }
    }
}