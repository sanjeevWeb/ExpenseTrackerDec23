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

    axios.post('http://localhost:5000/user/addexp', obj, { headers: { 'Authorization': `${token}` } })
        .then(result => {
            console.log(result.data);
            alert(result.data.message);
            // getAllData();
        })
        .catch(err => console.log(err))
})

//not called immidietly after page load because we using pagination now
function getAllData() {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/user/getdata', { headers: { 'Authorization': `${token}` } })
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

// getAllData();

function delBtnHandler(id) {
    console.log('btn clicked with id: ', id);
    axios.delete(`http://localhost:5000/user/delete/${id}`)
        .then(result => {
            console.log(result);
            alert(result.data.message)
            getAllData();
        })
        .catch(err => console.log(err))
}


// razorpay oprations
const premBtn = document.querySelector('#premBtn');

premBtn.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    console.log(token);
    axios.get('http://localhost:5000/user/createorder', { headers: { 'Authorization': `${token}` } })
        .then(result => {
            let options = {
                "key": result.data.key_id,
                "order_id": result.data.order.id, //for one time payment
                "handler": (result) => {
                    const token = localStorage.getItem('token');
                    axios.post('http://localhost:5000/user/updatestatus', {
                        order_id: options.order_id,
                        payment_id: result.razorpay_payment_id,
                    }, { headers: { 'Authorization': `${token}` } })
                        .then(() => {
                            premBtn.disabled = true;
                            alert('you are a premium user now')
                        })
                        .catch(err => console.log(err));
                }
            }

            var rzp1 = new Razorpay(options);
            rzp1.open();
            e.preventDefault();

            rzp1.on('payment.failed', function (response) {
                console.log(response)
                alert(response.error.description);
                alert(response.error.metadata.payment_id);
            })
        })
        .catch(err => console.log(err))
})


// Check if the user is a premium user on page load
// this code is fine for a single user but not for multiple user
// document.addEventListener('DOMContentLoaded', () => {
//     const isPremiumUser = localStorage.getItem('premiumUser');

//     if (isPremiumUser === 'true') {
//         premBtn.disabled = true;
//         alert('You are a premium user');
//     }
// });


// this can be optimised by using promise.all in getAllData function above
function checkPremiumStatus() {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/user/getstatus', { headers: { 'Authorization': `${token}` } })
        .then(result => {
            console.log(result)
            const isPremium = result.data.isPremium;
            if (isPremium) {
                document.querySelector('#premBtn').classList.add('hideElement');
                const btn = document.createElement('button');
                btn.setAttribute('id', 'showLB');
                btn.textContent = 'show leaderbord';
                btn.addEventListener('click', () => showLeaderBoard())
                document.querySelector('#msg').appendChild(btn);
            }
            else {
                document.querySelector('#msg').classList.add('hideElement')
            }
        })
        .catch(err => console.log(err))
}

checkPremiumStatus()

function showLeaderBoard() {
    axios.get('http://localhost:5000/premium/showlb')
        .then(result => {
            console.log(result)
            const leaderbrd = document.querySelector('#leaderbrd')
            leaderbrd.textContent = 'LeaderBoard';
            result.data.userInfo.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `Name: ${user.name}, total Expense: ${user.totalExpense}`;
                leaderbrd.appendChild(li);
            })
        })
        .catch(err => console.log(err))
}


//function to download file
function download() {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/premium/download', { headers: { "Authorization": token } })
        .then((response) => {
            console.log(response.data)
            var a = document.createElement("a");
            // a.href = window.location.origin + response.data.fileUrl;
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            a.click();
            // if(response.status === 201){
            //     //the bcakend is essentially sending a download link
            //     //  which if we open in browser, the file would download
            //     var a = document.createElement("a");
            //     a.href = response.data.fileUrl;
            //     a.download = 'myexpense.csv';
            //     a.click();
            // }
            //  else {
            //     throw new Error(response.data.message)
            // }

        })
        .catch((err) => {
            console.log(err)
        });
}


// pagination function

function setPagination (page) {
    const token = localStorage.getItem('token')
    const limit = localStorage.getItem('rows')

    axios.get(`http://localhost:5000/user/pagination/${page}/${limit}`, {headers: { "Authorization": token}})
    .then(result => {
        console.log(result);
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

const rowsBtn = document.querySelector('#rowsBtn');
const rows = document.querySelector('#rows')

rowsBtn.addEventListener('click', () => {
    const row = rows.value;
    console.log('rows', row)
    localStorage.setItem('rows', row);
})