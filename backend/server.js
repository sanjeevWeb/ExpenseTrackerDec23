const express = require('express')
const app = express();
const cors = require('cors');
const pool = require('./database.js')

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.post('/api', (req, res) => {
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

app.listen('5000', () => {
    console.log('server is running at port 5000')
})