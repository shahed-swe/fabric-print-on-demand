const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    // For custom designs (print-on-demand)
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design'
    },
    // For regular products
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    // Product details (for products)
    size: String,
    color: String,
    
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    // Item type to distinguish between design and product
    itemType: {
      type: String,
      enum: ['design', 'product'],
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
