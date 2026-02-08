const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [{
    // Item type to distinguish between design and product
    itemType: {
      type: String,
      enum: ['design', 'product'],
      required: true
    },
    // For custom designs
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design'
    },
    // For regular products
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    // Product-specific fields
    size: String,
    color: String,
    // Common fields
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    country: String,
    isDefault: Boolean,
    fullName: String,
    streetAddress: String, 
    city: String,
    state: String,
    postalCode: String,
    phone: String,
    createdAt: Date,
    userId: String, // Changed from ObjectId to String to support guest users
    isNewAddress: Boolean
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Received', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
