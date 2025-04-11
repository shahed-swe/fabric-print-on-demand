const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');
const categoryController = require('../controllers/categoryController');
const designController = require('../controllers/designController');
const fileController = require('../controllers/fileController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');
const shippingController = require('../controllers/shippingController');
const { protect } = require('../middlewares/auth');

// Auth routes
router.post('/auth/login', authController.adminLogin);
router.get('/validate-token', protect, authController.validateAdminToken);

// Ensure all routes have valid callback functions
router.get('/some-route', protect, (req, res) => {
  res.send('This is a valid GET route');
});

module.exports = router;
