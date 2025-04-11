const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sizeQuantities: {
    type: Map,
    of: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Design', designSchema);
