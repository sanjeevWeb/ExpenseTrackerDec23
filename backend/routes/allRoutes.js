const express = require('express');
const router = express.Router();
const isRequestValid = require('../auth/authenticate');

const { LoginFunc, RegisterFunc, addExpense, getAllUserEntry, deleteDataById, createOrder, updataTransactionStatus, getPremiumStatus, showLeaderBoard, forgetPasswordHandler, resetPasswordHandler, setNewPassword, sendDownloadLink, setPagination } = require("../controller/routeControllers");


router.post('/api/signup', RegisterFunc)

router.post('/api/login', LoginFunc)

// user routes after login
router.post('/user/addexp',isRequestValid, addExpense)

router.get('/user/getdata',isRequestValid, getAllUserEntry)

router.delete('/user/delete/:id', deleteDataById)

router.get('/user/pagination/:page/:limit', isRequestValid, setPagination )

// razorpay  operations
router.get('/user/createorder', isRequestValid, createOrder)

router.post('/user/updatestatus', isRequestValid, updataTransactionStatus)

router.get('/user/getstatus', isRequestValid, getPremiumStatus)

// premium user routes
router.get('/premium/showlb', showLeaderBoard)

router.get('/premium/download', isRequestValid, sendDownloadLink)

//forgot password route
router.post('/password/forgetpassword', forgetPasswordHandler)

router.get('/password/resetpassword/:id', resetPasswordHandler)

router.post('/password/newpassword/:id', setNewPassword)

module.exports = router;