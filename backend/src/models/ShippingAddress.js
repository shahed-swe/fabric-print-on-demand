const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'US'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('ShippingAddress', shippingAddressSchema);
