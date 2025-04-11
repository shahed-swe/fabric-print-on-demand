const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [{
    _id: {
      type: String
    },
    fileId: {
      type: String,
    },
    sizeQuantities: {
      S: { type: Number, default: 0 },
      M: { type: Number, default: 0 },
      L: { type: Number, default: 0 },
      XL: { type: Number, default: 0 },
      XXL: { type: Number, default: 0 }
    },
    title: {
      type: String,
    },
    price: {
      type: Number,
    },
    createdAt: {
      type: Date,
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
    userId: mongoose.Schema.Types.ObjectId,
    isNewAddress: Boolean
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
