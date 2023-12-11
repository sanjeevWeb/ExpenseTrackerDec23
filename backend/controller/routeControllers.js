const pool = require("../db/database");

const RegisterFunc = (req, res) => {
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

}

const LoginFunc = (req,res) => {
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
        if(result.length === 0){
            return res.json({message: 'user not found'})
        }
        if(result[0].email === email){
            if(result[0].pass === passKey){
                return res.json({ message: 'log in successfully'});
            }
            else{
                return res.json({ message: 'User not authorized'})
            }
        }
        else{
            return res.json({ message: 'User not found'})
        }

    })
}

module.exports = {
    RegisterFunc,
    LoginFunc
}