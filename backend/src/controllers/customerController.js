const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// @desc    Get all customers with their order statistics
// @route   GET /api/admin/customers
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
  try {
    const { 
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { role: { $ne: 'admin' } }; // Exclude admin users
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort order
    const sortOption = {};
    sortOption[sortBy] = order === 'desc' ? -1 : 1;

    const customers = await User.find(query)
      .select('-password')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ userId: customer._id.toString() });
        
        const ordersCount = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Get last order date
        const lastOrder = orders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        return {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          country: customer.country,
          status: customer.status || 'active',
          createdAt: customer.createdAt,
          ordersCount,
          totalSpent: totalSpent.toFixed(2),
          lastOrderDate: lastOrder ? lastOrder.createdAt : null
        };
      })
    );

    const count = await User.countDocuments(query);

    res.json({
      customers: customersWithStats,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single customer with detailed info
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
exports.getCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get customer's orders
    const orders = await Order.find({ userId: customer._id.toString() })
      .sort({ createdAt: -1 });

    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      customer: {
        ...customer.toObject(),
        ordersCount,
        totalSpent: totalSpent.toFixed(2)
      },
      orders
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update customer information
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, country, status } = req.body;
    
    const customer = await User.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Prevent updating admin users
    if (customer.role === 'admin') {
      return res.status(403).json({ message: 'Cannot update admin users' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== customer.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (country !== undefined) customer.country = country;
    if (status) customer.status = status;

    await customer.save();

    // Return updated customer without password
    const updatedCustomer = await User.findById(customer._id).select('-password');

    res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change customer password
// @route   PUT /api/admin/customers/:id/password
// @access  Private/Admin
exports.changeCustomerPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const customer = await User.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Prevent updating admin users
    if (customer.role === 'admin') {
      return res.status(403).json({ message: 'Cannot update admin users' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(password, salt);

    await customer.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing customer password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
