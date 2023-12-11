const express = require('express');
const router = express.Router();

const { LoginFunc, RegisterFunc } = require("../controller/routeControllers")


router.post('/signup', RegisterFunc)

router.post('/login', LoginFunc)

module.exports = router;