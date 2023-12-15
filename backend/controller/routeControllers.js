const pool = require("../db/database");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Razorpay = require('razorpay')


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
                    const token = jwt.sign(result[0].id, 'hfjsfjskksq');
                    console.log(token);

                    return res.json({ message: 'log in successfull', token })
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
        const user = req.user; // user is an array, and inside there is an object
        console.log('req.user: ', user);
        // throwing error if columns are not mentioned
        const db_query = `INSERT INTO userentry (amount, description, exptype, expense_id) VALUES (?,?,?,?)`;

        // if i put an await before pool.query, it suggest me to import promise version of pool.query
        //visit: https://github.com/sidorares/node-mysql2/blob/master/documentation/en/Promise-Wrapper.md
        pool.query(db_query, [amount, description, category, user[0].id], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ message: 'error inserting data' })
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
    const id = req.user[0].id;
    const db_query = `SELECT * FROM userentry WHERE expense_id = ?`;
    pool.execute(db_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ message: 'error in reading database' });
        }
        console.log(result);
        return res.json({ result });
    })
}

const deleteDataById = (req, res) => {
    const id = req.params.id;
    const db_query = `DELETE FROM userentry WHERE id = ?`;
    pool.query(db_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ message: 'error deleteting this entry' })
        }
        console.log(result);
        return res.json({ message: `id: ${id} deleted` });
    })
}


// razorpay operations
const createOrder = (req, res) => {
    try {
        const userId = req.user[0].id;
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET_KEY,
        });
    
        const options = {
            amount: 2500,  // amount in the smallest currency unit
            currency: "INR",
        };
    
        instance.orders.create(options, (err, order) => {
            if(err) {
                console.log(err);
                return;
            }
            console.log('order ',order);
            const db_query = `INSERT INTO orders (orderid,status,userid) VALUES (?,?,?)`;

            pool.query(db_query,[order.id, 'PENDING', userId], (err,result) => {
                if(err){
                    throw new Error(err);
                }
                return res.json({ order, key_id: instance.key_id});
            })
            // req.user.createOrder({orderid: order.id, status: 'PENDING'})
            // .then(() => {
            //     return res.json({ order, key_id:instance.key_id })
            // })
        });    
    } 
    catch (error) {
        console.log(error)
    }
}

const updataTransactionStatus = (req,res) => {
    try {
        const id = req.user[0].id;
        const { order_id, payment_id } = req.body;
        const db_query = `SELECT * FROM orders WHERE orderid = ?`;
        pool.query(db_query, [order_id], (err, result) => {
            if(err){
                console.log(err);
                return res.json({message:'something broke'})
            }
            console.log('order table result: ', result);
            const db_query = `UPDATE orders SET paymentid = ?, status = ? WHERE orderid = ?`;
            pool.query(db_query, [payment_id, 'SUCCESSFULL', order_id], (err, result) => {
                if(err){
                    throw new Error(err);
                }
                const db_query = `UPDATE expenses SET isPremium = 'true' where id = ?`;
                pool.query(db_query, [id], (err,result) => {
                    if(err){
                        throw new Error(err);
                    }
                    return res.json({ message: 'transaction successfull '})
                })
            })
        })
    } 
    catch (error) {
        
    }
}
module.exports = {
    RegisterFunc,
    LoginFunc,
    addExpense,
    getAllUserEntry,
    deleteDataById,
    createOrder,
    updataTransactionStatus
}