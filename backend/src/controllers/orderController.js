const Order = require('../models/Order');
const User = require('../models/User'); // Add User model import
const Product = require('../models/Product');
const { sendOrderInvoice } = require('../services/emailService');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  const { userId, items, paymentStatus, totalAmount, status, shippingAddress } = req.body;
  console.log('Creating order with:');
  console.log('- totalAmount:', totalAmount);
  console.log('- items:', items);
  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Reduce stock for product items only (not custom designs)
    for (const item of items) {
      if (item.itemType === 'product' && item.productId) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${item.productId}` });
        }

        // Find the size variant and reduce stock
        const sizeVariant = product.sizes.find(s => s.size === item.size);
        if (sizeVariant) {
          if (sizeVariant.stockQuantity < item.quantity) {
            return res.status(400).json({ 
              error: `Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${sizeVariant.stockQuantity}, Requested: ${item.quantity}` 
            });
          }
          
          sizeVariant.stockQuantity -= item.quantity;
        }

        // Also reduce color stock if applicable
        if (item.color) {
          const colorVariant = product.colors.find(c => c.name === item.color);
          if (colorVariant) {
            if (colorVariant.stockQuantity < item.quantity) {
              return res.status(400).json({ 
                error: `Insufficient stock for ${product.name} (Color: ${item.color}). Available: ${colorVariant.stockQuantity}, Requested: ${item.quantity}` 
              });
            }
            
            colorVariant.stockQuantity -= item.quantity;
          }
        }

        await product.save();
      }
    }

    // Determine order status based on payment status
    let orderStatus = status || 'Pending';
    
    // If payment is completed, set status to Processing
    if (paymentStatus === 'completed') {
      orderStatus = status || 'Processing';
    }
    
    const order = await Order.create({
      userId,
      items,
      shippingAddress,
      paymentStatus: paymentStatus || 'pending',
      status: orderStatus,
      totalAmount,
      statusHistory: [{
        status: orderStatus,
        changedAt: new Date(),
        changedBy: 'System'
      }],
      createdAt: new Date(),
    });

    // Populate items for email
    const populatedOrder = await Order.findById(order._id)
      .populate('items.designId')
      .populate('items.productId');

    // Get user details for email
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId) && !userId.toString().startsWith('guest_')) {
      user = await User.findById(userId);
    }

    // Send invoice email (don't wait for it, send async)
    sendOrderInvoice(populatedOrder, user).catch(err => {
      console.error('Failed to send invoice email:', err);
    });
    
    return res.status(200).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.designId')
      .populate('items.productId');
    
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
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = order.status;
    
    // If order is being cancelled, restore stock for product items
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        if (item.itemType === 'product' && item.productId) {
          const product = await Product.findById(item.productId);
          
          if (product) {
            // Restore size stock
            const sizeVariant = product.sizes.find(s => s.size === item.size);
            if (sizeVariant) {
              sizeVariant.stockQuantity += item.quantity;
            }

            // Restore color stock if applicable
            if (item.color) {
              const colorVariant = product.colors.find(c => c.name === item.color);
              if (colorVariant) {
                colorVariant.stockQuantity += item.quantity;
              }
            }

            await product.save();
          }
        }
      }
    }

    // Update order status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status: status,
      changedAt: new Date(),
      changedBy: 'Admin' // Could be enhanced to use req.user.name if you have auth
    });
    
    await order.save();
    
    return res.status(200).json({ 
      message: 'Order status updated successfully',
      order 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
