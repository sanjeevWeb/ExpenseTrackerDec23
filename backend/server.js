const express = require('express')
const app = express();
const cors = require('cors');
const pool = require('./database.js')

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.post('/api/signup', (req, res) => {
    const { username, email, pass } = req.body;
    if (!username || !email || !pass) {
        return res.json({ errormsg: 'All fields are required' })
    }

    const email_query = `SELECT COUNT(*) AS count FROM expenses WHERE email = ?`;
    const db_query = `INSERT INTO expenses (name,email,pass) VALUES (?,?,?)`;

    pool.query(email_query, [email], (err, result) => {
        if (err) {
            return res.json({ error: 'can not be verified' })
        }
        console.log(result)
        const count = result[0].count;
        const emailExists = count === 1;

        if(emailExists){
            return res.json({ message: 'email already exists' })
        }
        pool.query(db_query, [username, email, pass], (err, result) => {
            if (err) {
                return res.json({ error: 'sorry, something broke' });
            }
            console.log(result)
            return res.json({ message: 'data inserted successfully' });
        })
    })

})

app.post('/api/login', (req,res) => {
    const { email, passKey } = req.body
    if(!email || !passKey){
        return res.json({ message: 'please enter all fields'});
    }
    const db_query = `SELECT * FROM expenses WHERE email = ?`;
    pool.query(db_query, [email], (err,result) => {
        if(err){
            return res.json({ error: 'something broke'});
        }
        console.log(result);

        if(result[0].email === email){
            if(result[0].pass === passKey){
                return res.json({ message: 'you are logged in'});
            }
            else{
                return res.json({ message: 'please check your credentials'})
            }
        }
        else{
            return res.json({ message: 'please register first'})
        }

    })
})

app.listen('5000', () => {
    console.log('server is running at port 5000')
})