const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');
const { userAuth, adminAuth } = require('../middleware/auth');

// public route
router.get('/availability', trainController.checkAvailability);

// protected routes
router.post('/book', userAuth, trainController.bookSeat);
router.get('/booking/:booking_id', userAuth, trainController.getBooking);

// admin route
router.post('/train', userAuth, adminAuth, trainController.addTrain);

module.exports = router;