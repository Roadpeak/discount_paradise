const express = require('express');
const { loginuser, registeruser, logout, forgotpass, resetPassword, activate } = require('../../controllers/auth/auth');
const RequireAuth = require('../../middlewares/auth');
const router = express.Router();

router.get('/login', loginuser);
router.get('/register', registeruser);
router.post('/login', loginuser);
router.post('/register', registeruser);
router.get('/logout', RequireAuth, logout);
router.post('/forgotpassword', forgotpass);
router.get('/resetpassword/:resettoken', resetPassword);
router.post('/resetpassword/:resettoken', resetPassword);
module.exports = router;