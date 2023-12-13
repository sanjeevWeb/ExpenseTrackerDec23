const ex_amount = document.querySelector('#ex_amount');
const desc = document.querySelector('#desc');
const category = document.querySelector('#category');
const expense_form = document.querySelector('#expense_form')
const history = document.querySelector('#history');

expense_form.addEventListener('submit', (event) => {
    event.preventDefault();
    // console.log(category);
    let cat = category.value;
    // console.log(cat)

    const obj = {
        amount: ex_amount.value,
        description: desc.value,
        category: cat
    }
    //sending token in headers
    const token = localStorage.getItem('token');

    axios.post('http://localhost:5000/user/addexp', obj,{ headers: { 'Authorization': `${token}`}})
    .then(result => {
        console.log(result.data);
        alert(result.data.message);
        getAllData();
    })
    .catch(err => console.log(err))
})

function getAllData () {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/user/getdata',{ headers: { 'Authorization': `${token}`}})
    .then(result => {
        console.log(result.data);
        history.innerHTML = ''
        result.data.result.forEach(element => {
            const li = document.createElement('li');
            li.textContent = `id: ${element.id} ,Rs: ${element.amount},${element.description},${element.exptype}, userid: ${element.expense_id}`;
            const btn = document.createElement('button');
            btn.textContent = 'delete';
            btn.addEventListener('click', () => delBtnHandler(`${element.id}`));
            li.appendChild(btn);
            history.appendChild(li);
        });
       
    })
    .catch(err => console.log(err))
}

getAllData();

function delBtnHandler(id){
    console.log('btn clicked with id: ',id);
    axios.delete(`http://localhost:5000/user/delete/${id}`)
    .then(result => {
        console.log(result);
        alert(result.data.message)
        getAllData();
    })
    .catch(err => console.log(err))
}

