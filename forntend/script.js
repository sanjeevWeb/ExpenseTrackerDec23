const form = document.querySelector('#form');
const username = document.querySelector('#username');
const email = document.querySelector('#email');
const pass = document.querySelector('#pass');

//login form values
const regEmail = document.querySelector('#regEmail');
const password = document.querySelector('#password');
const loginForm = document.querySelector('#loginForm');

//register and login switch bittons
const gotoRegister = document.querySelector('#gotoRegister');
const gotoLogin = document.querySelector('#gotoLogin');

gotoRegister.addEventListener('click', () => {
    form.classList.remove('form_hidden');
    loginForm.classList.add('form_hidden'); // after removing href, it is working fine ( with this code)
    // loginForm.className = 'form_hidden';
    gotoLogin.style.cursor = 'pointer'
})

gotoLogin.addEventListener('click', () => {
    form.classList.add('form_hidden');
    loginForm.classList.remove('form_hidden');
    gotoRegister.style.cursor = 'pointer'
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const obj = {
        username:username.value,
        email:email.value,
        pass: pass.value
    }

    if( !obj.username || !obj.email || !obj.pass){
        alert('all fields are required')
        return;
    }
    axios.post('http://localhost:5000/api/signup', obj )
    .then(result => {
        console.log(result.data)
        alert(result.data.message)
    })
    .catch(err => console.log(err))
})


loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = regEmail.value;
    const passKey = password.value;
    if(!email || !passKey){
        alert('All fields are required');
        return;
    }
    axios.post('http://localhost:5000/api/login', { email, passKey})
    .then(result => {
        console.log(result);
        alert(result.data.message);
    })
    .catch(err => console.log(err))

})