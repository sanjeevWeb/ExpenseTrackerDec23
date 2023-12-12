const pool = require("../db/database");
const bcrypt = require("bcryptjs")

const RegisterFunc = async (req, res) => {
    const { username, email, pass } = req.body;
    if (!username || !email || !pass) {
        return res.json({ errormsg: 'All fields are required' })
    }

    try {
        //password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(pass, salt);

        const email_query = `SELECT COUNT(*) AS count FROM expenses WHERE email = ?`;
        const db_query = `INSERT INTO expenses (name,email,pass) VALUES (?,?,?)`;

        pool.query(email_query, [email], (err, result) => {
            if (err) {
                return res.json({ error: 'can not be verified' })
            }
            console.log(result)
            const count = result[0].count;
            const emailExists = count === 1;

            if (emailExists) {
                return res.json({ message: 'email already exists' })
            }
            pool.query(db_query, [username, email, hashedPass], (err, result) => {
                if (err) {
                    return res.json({ error: 'sorry, something broke' });
                }
                console.log(result)
                return res.json({ message: 'data inserted successfully' });
            })
        })
    }
    catch (error) {
        console.log(error)
    }

}

const LoginFunc = (req, res) => {
    const { email, passKey } = req.body
    if (!email || !passKey) {
        return res.json({ message: 'please enter all fields' });
    }
    try {
        const db_query = `SELECT * FROM expenses WHERE email = ?`;

        pool.query(db_query, [email], async (err, result) => {
            if (err) {
                return res.json({ error: 'something broke' });
            }
            console.log(result);
            if (result.length === 0) {
                return res.json({ message: 'user not found' })
            }
            if (result[0].email === email) {
                const isMatched = await bcrypt.compare(passKey, result[0].pass);
                if (isMatched) {
                    return res.json({ message: 'log in successfull' })
                }
                else {
                    return res.json({ message: 'user not authorized' })
                }
            }
            else {
                return res.json({ message: 'User not found' })
            }

        })
    }
    catch (error) {
        console.log(error)
    }
}

const addExpense = (req, res) => {
    const { amount, description, category } = req.body
    if (!amount || !description || !category) {
        return res.json({ error: 'all fields required' })
    }
    try {
        // throwing error if columns are not mentioned
        const db_query = `INSERT INTO userentry (amount, description, exptype)VALUES (?,?,?)`;

        // if i put an await before pool.query, it suggest me to import promise version of pool.query
        pool.query(db_query, [amount, description, category], (err, result) => {
            if(err){
                console.log(err);
                return res.json({ message: 'error inserting data'})
            }
            console.log(result);
            // console.log(result.insertId); id: result.insertId
            return res.json({ message: 'data inserted successfully' });
        });
    }
    catch (error) {
        console.log(error);
    }

}

const getAllUserEntry = (req, res) => {
    const db_query = `SELECT * FROM userentry`;
    pool.execute(db_query, (err,result) => {
        if(err){
            console.log(err);
            return res.json({ message: 'error in reading database'});
        }
        console.log(result);
        return res.json({ result });
    })
}

const deleteDataById = (req,res) => {
    const id = req.params.id;
    const db_query = `DELETE FROM userentry WHERE id = ?`;
    pool.query(db_query,[id], (err,result) => {
        if(err){
            console.log(err);
            return res.json({message: 'error deleteting this entry'})
        }
        console.log(result);
        return res.json({ message: `id: ${id} deleted`});
    })
}

module.exports = {
    RegisterFunc,
    LoginFunc,
    addExpense,
    getAllUserEntry,
    deleteDataById
}