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
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Cart routes
router.get('/cart', protect, cartController.getCartItems);
router.post('/cart', protect, cartController.addToCart);
router.delete('/cart/:id', protect, cartController.removeFromCart);

// Category routes
router.get('/categories', categoryController.getCategories);
router.post('/categories', protect, categoryController.createCategory);
router.put('/categories/:id', protect, categoryController.updateCategory);

// Design routes
router.post('/designs', protect, designController.saveDesign);
router.get('/designs', protect, designController.getDesigns);

// File routes
router.post('/upload', protect, fileController.uploadFile);
router.get('/files', protect, fileController.getFiles);

// Order routes
router.post('/orders', protect, orderController.createOrder);
router.get('/orders', protect, orderController.getOrders);
router.put('/orders/:id', protect, orderController.updateOrderStatus);

// Payment routes
router.post('/payment/create-intent', protect, paymentController.createPaymentIntent);

// Shipping routes
router.get('/shipping', protect, shippingController.getAddresses);
router.post('/shipping', protect, shippingController.addAddress);

// Ensure all routes have valid callback functions
router.get('/some-route', protect, (req, res) => {
  res.send('This is a valid GET route');
});

module.exports = router;
