const form = document.querySelector('#form');
const username = document.querySelector('#username');
const email = document.querySelector('#email');
const pass = document.querySelector('#pass');

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
    axios.post('http://localhost:5000/api', obj )
    .then(result => {
        console.log(result.data)
        alert(result.data.username)
    })
    .catch(err => console.log(err))
})