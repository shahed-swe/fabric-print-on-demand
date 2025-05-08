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
router.get('/cart', cartController.getCartItems);
router.delete('/cart/:id', cartController.removeFromCart);
router.delete('/cart/user/:userId', cartController.removeByUserId);

// Category routes
router.get('/categories', categoryController.getCategories);
router.post('/categories', protect, categoryController.createCategory);
router.put('/categories/:id', protect, categoryController.updateCategory);

// Design routes
router.post('/designs', designController.saveDesign);
router.get('/designs', designController.getDesigns);

// File routes
router.post('/upload', fileController.uploadFile);
router.get('/files/:fileid', fileController.getFile); // Changed from getFiles to getFile
router.get('/files', fileController.getFiles);

// Order routes
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getOrders);
router.put('/orders/:id', orderController.updateOrderStatus);

// Payment routes
// router.post('/payment/create-intent', protect, paymentController.createPaymentIntent);

// Shipping routes
router.get('/shipping', shippingController.getAddresses);
router.post('/shipping', shippingController.addAddress);

// Ensure all routes have valid callback functions
router.get('/some-route', protect, (req, res) => {
  res.send('This is a valid GET route');
});

module.exports = router;
