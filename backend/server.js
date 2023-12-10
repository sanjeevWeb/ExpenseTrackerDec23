const express = require('express')
const app = express();
const cors = require('cors');

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}))

app.post('/api', (req,res) => {
    const { username, email, pass } = req.body;
    if( !username || !email || !pass){
        return res.json({ errormsg: 'All fields are required'})
    }
    return res.json({ username, email, pass });
})

app.listen('5000', () => {
    console.log('server is running at port 5000')
})