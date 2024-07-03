// eslint-disable-next-line linebreak-style
const express = require('express');

const router = express.Router();
const { isAuth } = require('../middlewares/isAuth');

const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.initiatePayment);

router.post('/user', isAuth, paymentController.initiateOrderPayment);

router.get('/return', paymentController.handlePaymentReturnUrl);

router.post('/notify', paymentController.handlePaymentResult);

module.exports = router;
