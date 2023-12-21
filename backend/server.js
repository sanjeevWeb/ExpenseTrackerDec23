const express = require('express')
const app = express();
const cors = require('cors');
const router = require('./routes/allRoutes.js')
require('dotenv').config()

const helmet = require('helmet')
const morgan = require('morgan')

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
morgan('combined')

app.use('/', router);

app.listen('5000', () => {
    console.log('server is running at port 5000')
})