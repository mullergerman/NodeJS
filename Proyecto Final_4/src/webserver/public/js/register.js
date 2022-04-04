
// DOM get IDs
const password1 = document.getElementById("form").password
const password2 = document.getElementById("form").password2
const img1 = document.getElementById("form").img_ok
const img2 = document.getElementById("form").img_error
const btn = document.getElementById("form").btnRegister

const PASSWORD_MIN_LENGTH = 8
btn.disabled = true;

function readURL(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.getElementById("picprofile")
            img.setAttribute('src', e.target.result);
            img.setAttribute('width', 200);
            img.setAttribute('height', 200);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

password1.addEventListener('input', inputHandlerCheck1);          // Common
password1.addEventListener('propertychange', inputHandlerCheck1); // for IE8

password2.addEventListener('input', inputHandlerCheck2);          // Common
password2.addEventListener('propertychange', inputHandlerCheck2); // for IE8


function inputHandlerCheck1(){
    if (password1.value.length > PASSWORD_MIN_LENGTH -1 ){
        img1.setAttribute('src', 'img/check_ok.png');
        btn.disabled = false;
    }else{
        img1.setAttribute('src', 'img/check_error.png');
        btn.disabled = true;
    }
}

function inputHandlerCheck2(){
    if (password2.value === password1.value){
        img2.setAttribute('src', 'img/check_ok.png');
        btn.disabled = false;
    }else{
        img2.setAttribute('src', 'img/check_error.png');
        btn.disabled = true;
    }
}