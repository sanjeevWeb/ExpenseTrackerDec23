const mysql = require('mysql2');
require('dotenv').config()

const pool = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

pool.connect((err) => {
    if(err) throw err;
    else{
        console.log('connected to expencetrac database')
    }
})

module.exports = pool