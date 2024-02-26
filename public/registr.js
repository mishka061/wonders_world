// public\registr.js
console.log('DOMContentLoaded form');
document.addEventListener("DOMContentLoaded", function() {
    
  const form = document.querySelector('.form-signap');
  const passwordInput = document.querySelector('#password-input');
  const confirmPasswordInput = document.querySelector('#confirm-password-input');
  const confirmPasswordError = document.querySelector('#confirmPasswordError');

    if(form){
        form.addEventListener('submit', function(event) {
            let isValid = true;
            if (passwordInput.value !== confirmPasswordInput.value) {
                console.log('passwordInput.value !== confirmPasswordInput.value');
                confirmPasswordInput.classList.add('error-input');
                confirmPasswordError.style.display = 'block'; // Показать сообщение об ошибке
                isValid = false;
            } else {
                console.log('passwordInput.value == confirmPasswordInput.value');
                confirmPasswordInput.classList.remove('error-input');
                confirmPasswordError.style.display = 'none'; // Скрыть сообщение об ошибке
            }
            if (!isValid) {
                event.preventDefault();
            }
        });
    }else{
        console.log('error form')
    }
});

