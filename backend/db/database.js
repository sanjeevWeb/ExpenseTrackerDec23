const mysql = require('mysql2');

const pool = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'expencetrac'
});

pool.connect((err) => {
    if(err) throw err;
    else{
        console.log('connected to expencetrac database')
    }
})

module.exports = pool