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
const customerController = require('../controllers/customerController');
const dashboardController = require('../controllers/dashboardController');
const customStyleController = require('../controllers/customStyleController');
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

// Customer routes (admin)
router.get('/customers', protect, customerController.getCustomers);
router.get('/customers/:id', protect, customerController.getCustomer);
router.get('/users/:id', protect, customerController.getCustomer); // Alias for user lookup
router.put('/customers/:id', protect, customerController.updateCustomer);
router.put('/customers/:id/password', protect, customerController.changeCustomerPassword);

// Dashboard routes (admin)
router.get('/dashboard/stats', protect, dashboardController.getDashboardStats);
router.get('/dashboard/sales', protect, dashboardController.getSalesData);
router.get('/dashboard/categories', protect, dashboardController.getCategoryData);

// Design routes (admin)
router.get('/designs', protect, designController.getAllDesigns);
router.get('/designs/:id', protect, designController.getDesignById);

// Custom Styles routes (admin)
router.get('/custom-styles', protect, customStyleController.getCustomStylesAdmin);
router.post('/custom-styles', protect, customStyleController.createCustomStyle);
router.route('/custom-styles/:id')
  .get(protect, customStyleController.getCustomStyle)
  .put(protect, customStyleController.updateCustomStyle)
  .delete(protect, customStyleController.deleteCustomStyle);

module.exports = router;
