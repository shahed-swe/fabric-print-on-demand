const Order = require('../models/Order');
const User = require('../models/User'); // Add User model import

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
        const user = await User.findById(order.userId);
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
