const pswdBtn = document.querySelector('#pswdBtn')
pswdBtn.addEventListener('click', function(){
    const pswdInput = document.getElementById('pswd')
    const type = pswdInput.getAttribute('type')
    if (type === 'password') {
        pswdInput.setAttribute('type','text')
        pswdBtn.innerHTML =  ''
})