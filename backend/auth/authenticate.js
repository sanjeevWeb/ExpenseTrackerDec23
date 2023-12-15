const jwt = require('jsonwebtoken');
const pool = require('../db/database');
const { json } = require('express');

const isRequestValid = (req,res,next) => {
    const token = req.headers['authorization'];
    // console.log(token)
    if (!token) {
        return res.json({ message: 'Token not provided' });
    }
    const decode_id = jwt.verify(token, 'hfjsfjskksq');
    console.log(decode_id);
    if(decode_id){
        const db_query = `SELECT * FROM expenses where id = ?`;
        pool.query(db_query, [decode_id], (err, result) => {
            if(err){
                console.log(err);
                return res,json({ error: 'error insertiing data'})
            }
            req.user = result;
            next();
        })
    }
    else{
        return res.json({ message:'not a valid user'});
    }
}

module.exports = isRequestValid;