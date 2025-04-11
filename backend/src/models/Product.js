const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  imageUrl: String,
  stockQuantity: {
    type: Number,
    default: 0
  },
  customizationOptions: [{
    name: String,
    type: String,
    required: Boolean,
    options: [String]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
