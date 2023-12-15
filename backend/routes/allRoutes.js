const express = require('express');
const router = express.Router();
const isRequestValid = require('../auth/authenticate');

const { LoginFunc, RegisterFunc, addExpense, getAllUserEntry, deleteDataById, createOrder, updataTransactionStatus } = require("../controller/routeControllers");


router.post('/api/signup', RegisterFunc)

router.post('/api/login', LoginFunc)

// user routes after login
router.post('/user/addexp',isRequestValid, addExpense)

router.get('/user/getdata',isRequestValid, getAllUserEntry)

router.delete('/user/delete/:id', deleteDataById)

// razorpay  operations
router.get('/user/createorder', isRequestValid, createOrder)

router.post('/user/updatestatus', isRequestValid, updataTransactionStatus)

module.exports = router;