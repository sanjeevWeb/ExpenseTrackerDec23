const mysql = require('mysql2');
require('dotenv').config()

const pool = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: 'expencetrac'
});

pool.connect((err) => {
    if(err) throw err;
    else{
        console.log('connected to expencetrac database')
    }
})

module.exports = pool