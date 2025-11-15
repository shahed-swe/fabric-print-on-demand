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
const { protect } = require('../middlewares/auth');

// Auth routes
router.post('/auth/login', authController.adminLogin);
router.get('/validate-token', protect, authController.validateAdminToken);

// Product routes (admin)
router.get('/products', protect, productController.getProducts);
router.post('/products', protect, productController.createProduct);
router.route('/products/:id')
  .get(protect, productController.getProduct)
  .put(protect, productController.updateProduct)
  .delete(protect, productController.deleteProduct);
router.patch('/products/:id/stock', protect, productController.updateProductStock);

// Category routes (admin)
router.get('/categories', protect, categoryController.getCategories);
router.post('/categories', protect, categoryController.createCategory);
router.route('/categories/:id')
  .put(protect, categoryController.updateCategory)
  .delete(protect, categoryController.deleteCategory);

// Order routes (admin)
router.get('/orders', protect, orderController.getOrders);
router.put('/orders/:id', protect, orderController.updateOrderStatus);

module.exports = router;
