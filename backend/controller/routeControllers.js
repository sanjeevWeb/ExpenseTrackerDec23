const pool = require("../db/database");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Razorpay = require('razorpay')
const Sib = require('sib-api-v3-sdk') // return a constructor
const { v4: uuidv4 } = require('uuid');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs')

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
                return res.json({ error: 'user not found' })
            }
            if (result[0].email === email) {
                const isMatched = await bcrypt.compare(passKey, result[0].pass);

                if (isMatched) {
                    const token = jwt.sign(result[0].id, 'hfjsfjskksq');
                    console.log(token);

                    return res.json({ message: 'log in successfull', token })
                }
                else {
                    return res.json({ error: 'user not authorized' })
                }
            }
            else {
                return res.json({ error: 'User not found' })
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
            if (err) {
                console.log(err);
                return;
            }
            console.log('order ', order);
            const db_query = `INSERT INTO orders (orderid,status,userid) VALUES (?,?,?)`;

            pool.query(db_query, [order.id, 'PENDING', userId], (err, result) => {
                if (err) {
                    throw new Error(err);
                }
                return res.json({ order, key_id: instance.key_id });
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

const updataTransactionStatus = (req, res) => {
    try {
        const id = req.user[0].id;
        const { order_id, payment_id } = req.body;
        const db_query = `SELECT * FROM orders WHERE orderid = ?`;
        pool.query(db_query, [order_id], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ message: 'something broke' })
            }
            console.log('order table result: ', result);
            const db_query = `UPDATE orders SET paymentid = ?, status = ? WHERE orderid = ?`;
            pool.query(db_query, [payment_id, 'SUCCESSFULL', order_id], (err, result) => {
                if (err) {
                    throw new Error(err);
                }
                const db_query = `UPDATE expenses SET isPremium = 'true' where id = ?`;
                pool.query(db_query, [id], (err, result) => {
                    if (err) {
                        throw new Error(err);
                    }
                    return res.json({ message: 'transaction successfull ' })
                })
            })
        })
    }
    catch (error) {

    }
}

const getPremiumStatus = (req, res) => {
    const id = req.user[0].id;
    const db_query = `SELECT * FROM expenses WHERE id = ?`;
    pool.query(db_query, [id], (err, result) => {
        if (err) {
            return res.json({ error: 'error reading data' })
        }
        console.log('premium status: ', result);
        const isPremium = result[0].isPremium;
        return res.json({ isPremium });
    })
}

// const showLeaderBoard = (req, res) => {
//     const query = 'SELECT expense_id, SUM(amount) AS totalAmount FROM userentry GROUP BY expense_id';

//     pool.query(query, (err, results) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             return;
//         }

//         console.log('Sum of amounts for each distinct id:');
//         console.table(results);
//         console.log(results);
//         const db_query = `SELECT * FROM expenses`;

//         pool.query(db_query, (err, userlist) => {
//             if(err){
//                 throw new Error(err);
//             }
//             console.log(userlist);
//             console.table(userlist);
//             const userInfo = [];

//             results.forEach(ele => {
//                 userlist.forEach(user => {
//                     if(user.id === ele.expense_id){
//                         userInfo.push({
//                             name: user.name,
//                             totalExpense: ele.totalAmount
//                         })
//                     }
//                 })
//             })
//             return res.json({ userInfo });
//         })
//     });
// }

// const showLeaderBoard = (req, res) => {
//     const query = `
//         SELECT e.name, e.email, u.expense_id, SUM(u.amount) AS totalAmount
//         FROM expenses e
//         JOIN userentry u ON e.id = u.expense_id
//         GROUP BY e.id, u.expense_id;
//     `;

//     pool.query(query, (err, results) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         const userInfo = results.map(row => ({
//             name: row.name,
//             totalExpense: row.totalAmount
//         }));

//         return res.json({ userInfo });
//     });
// };

const showLeaderBoard = (req, res) => {
    const db_query = `SELECT * FROM expenses`;
    pool.query(db_query, (err, result) => {
        if (err) {
            throw new Error(err)
        }
        console.log('expenses ', result);
        const userInfo = result.map(ele => ({
            name: ele.name,
            totalExpense: ele.totalExpense,
        }))

        return res.json({ userInfo });
    })
}


const forgetPasswordHandler = (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.json({ message: 'enter a valid mail id' })
    }
    const db_query = `SELECT * FROM expenses`;
    pool.query(db_query, (err, result) => {
        if (err) {
            throw new Error(err)
        }
        console.log(result)
        const found = result.find(ele => ele.email === email);
        if (!found) {
            return res.json({ message: 'user not found' })
        }
        console.log('found ', found);
        // saving request in fprequest table
        const userid = found.id;
        const id = uuidv4();
        const query = `INSERT INTO fprequest (id, userid) VALUES (?,?)`;
        pool.query(query, [id, userid], (err, result) => {
            if (err) {
                throw new Error(err);
            }
            console.log('fprequest values inserted')

            //sending mail
            const client = Sib.ApiClient.instance
            const apiKey = client.authentications['api-key']
            apiKey.apiKey = process.env.SB_API_KEY

            const tranEmailApi = new Sib.TransactionalEmailsApi()

            const sender = {
                email: 'kumarsanjeevdutta02@gmail.com',
                name: 'Sanjeev',
            }

            const receivers = [
                {
                    email: 'kumarsanjeevdutta02@gmail.com',
                },
                {
                    email: email,
                },
            ]

            tranEmailApi
                .sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: 'testing nodejs and sendinblue mail service',
                    textContent: `
                        Nmaste dost, you receiving this mail because i am testing nodejs app.
                        `,
                    htmlContent: `
                        <h1>Hello to you</h1>
                        <p>Nmaste dost, you receiving this mail because i am testing nodejs app password resetting</p>
                        <a href="http://localhost:5000/password/resetpassword/${id}">click here</a>
                `,
                    params: {
                        role: 'Backend and Full stack',
                    },
                })
                .then(() => {
                    return res.json({ message: 'check your mail' })
                })
                .catch(console.log)

        })

    })
}

const resetPasswordHandler = (req, res) => {
    const id = req.params.id;
    const db_query = `SELECT * FROM fprequest where id = ?`;
    pool.query(db_query, [id], (err, result) => {
        if (err) {
            throw new Error(err)
        }
        console.log(result);
        if (result.length == 0) {
            return res.json({ message: 'user not found' })
        }
        res.send(`<form action="http://localhost:5000/password/newpassword/${id}" method="POST">
                        <input type="text" name="newPassword" placeholder="enter new password">
                        <input type="submit"></input>
                    </form>`)
    })
}

const setNewPassword = (req, res) => {
    const newPassword = req.body.newPassword;
    console.log('new password: ', newPassword);
    const id = req.params.id;
    const db_query = `SELECT * FROM fprequest WHERE id = ?`;

    pool.query(db_query, [id], async (err, result) => {
        if (err) {
            throw new Error(err)
        }
        console.log('new pass result: ', result);
        const userid = result[0].userid;

        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);

        const query = `UPDATE expenses SET pass = ? WHERE id = ?`;
        pool.query(query, [hashedPass, userid], (err, result) => {
            if (err) {
                throw new Error(err);
            }
            console.log(result);
            return res.send(`<p>please login your account</p>`)
        })
    })
}

const sendDownloadLink = (req, res) => {
    try {
        // console.log('i am senddlink function')
        // console.log(req.user)
        // console.log(req.user[0].isPremium)
        // console.log(typeof(req.user[0].isPremium))
        if (req.user[0].isPremium === 'true') {
            const csvWriter = createCsvWriter({
                path: 'myexpense.csv',
                header: [
                    { id: 'amount', title: 'AMOUNT' },
                    { id: 'desc', title: 'DESCRIPTION' }
                ]
            });
            console.log('user is a premium user')
            const expense_id = req.user[0].id;
            const db_query = `SELECT * FROM userentry WHERE expense_id = ?`;
            pool.query(db_query, [expense_id], (err, result) => {
                if(err){
                    throw new Error(err)
                }
                console.log('userentry: ', result);
                const records = [];
                for(let i=0;i<result.length;i++){
                    records.push({
                        amount: result[i].amount,
                        desc: result[i].description
                    })
                }
                // write data
                csvWriter.writeRecords(records)
                .then(() => {
                    // Send the CSV file as a response
                    console.log('done...')
                    
                    res.download('./myexpense.csv', 'myexpense.csv', (err) => {
                        if (err) {
                            console.error('Error sending CSV file:', err);
                            res.status(500).json({ message: 'Internal Server Error' });
                        } 
                        else {
                            // Deleting the CSV file after sending
                            // fs.unlinkSync('myexpense.csv');
                        }
                    });
                })
                .catch((err) => {
                    console.error('Error writing CSV records:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                });
            })

        }
        else {
            res.json({ error: 'user not authorized ' })
        }

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
    updataTransactionStatus,
    getPremiumStatus,
    showLeaderBoard,
    forgetPasswordHandler,
    resetPasswordHandler,
    setNewPassword,
    sendDownloadLink
}