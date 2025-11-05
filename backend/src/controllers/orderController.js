const Order = require('../models/Order');
const User = require('../models/User'); // Add User model import
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  const { userId, items, paymentStatus, totalAmount } = req.body;

  console.log(req.body)

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const order = await Order.create({
      userId,
      items,
      paymentStatus: paymentStatus || 'pending',
      status: "processing",
      totalAmount,
      createdAt: new Date(),
    });
    
    return res.status(200).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    
    // Fetch user details for each order
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        let user = null;
        
        // Check if userId is a valid ObjectId (not a guest user)
        if (order.userId && mongoose.Types.ObjectId.isValid(order.userId) && !order.userId.toString().startsWith('guest_')) {
          try {
            user = await User.findById(order.userId);
          } catch (error) {
            console.log(`Error finding user: ${order.userId}`, error.message);
          }
        } else if (order.userId && order.userId.toString().startsWith('guest_')) {
          // For guest users, create a guest user object
          user = {
            _id: order.userId,
            name: 'Guest User',
            email: 'guest@example.com',
            isGuest: true
          };
        }
        
        return { ...order.toObject(), user };
      })
    );
    
    return res.status(200).json(ordersWithUserDetails);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.status(200).json({ 
      message: 'Order status updated successfully',
      order 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
