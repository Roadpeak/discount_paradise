const { mpesapayment, callback, lessonmpesapayment, lessioncallback } = require("../../controllers/mpesa/stkpush");
const express = require('express');
const accessToken = require("../../middlewares/c2bAccessToken");
const router = express.Router();

router.get('/payment/push', accessToken, mpesapayment);
router.post('/callback/:id', callback);
router.post('/lesson/payment/push', accessToken, lessonmpesapayment)
router.post('/lesson/callback/:id/:param', lessioncallback);
module.exports = router