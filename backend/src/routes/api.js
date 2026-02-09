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
const productController = require('../controllers/productController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/create-guest-account', authController.createGuestAccount);
router.get('/auth/verify/:token', authController.verifyEmail);
router.post('/auth/resend-verification', protect, authController.resendVerificationEmail);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password/:token', authController.resetPassword);

// Cart routes
router.get('/cart', cartController.getCartItems);
router.post('/cart', cartController.addToCart);
router.put('/cart/design/:itemId/sizes', cartController.updateDesignSizes);
router.put('/cart/:itemId', cartController.updateCartItem);
router.delete('/cart/:itemId', cartController.removeFromCart);
router.delete('/cart/user/:userId', cartController.removeByUserId);

// Category routes
router.get('/categories', categoryController.getCategories);
router.post('/categories', protect, categoryController.createCategory);
router.route('/categories/:id')
  .put(protect, categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

// Product routes (public - for customers)
router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/category/:categoryId', productController.getProductsByCategory);
router.get('/products/:id', productController.getProduct);

// Design routes
router.post('/designs/quick-save', designController.quickSaveDesign);
router.post('/designs', designController.saveDesign);
router.get('/designs', designController.getDesigns);
router.get('/designs/:id', designController.getDesignById);

// File routes
router.post('/upload', fileController.uploadFile);
router.get('/files/:fileid', fileController.getFile);
router.get('/files', fileController.getFiles);
router.delete('/files/:fileid', fileController.deleteFile);

// Order routes
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getOrders);
router.put('/orders/:id', orderController.updateOrderStatus);

// Payment routes
// router.post('/payment/create-intent', protect, paymentController.createPaymentIntent);

// Shipping routes
router.get('/shipping', shippingController.getAddresses);
router.post('/shipping', shippingController.addAddress);
router.delete('/shipping/:addressId', shippingController.deleteAddress);

// Profile routes
router.get('/profile', protect, profileController.getProfile);
router.post('/profile/check-email', protect, profileController.checkEmailExists);
router.put('/profile', protect, profileController.updateProfile);
router.put('/profile/password', protect, profileController.updatePassword);
router.post('/profile/picture', protect, profileController.uploadProfilePicture);

// Ensure all routes have valid callback functions
router.get('/some-route', protect, (req, res) => {
  res.send('This is a valid GET route');
});

module.exports = router;
