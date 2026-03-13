const mongoose = require('mongoose');

const customStyleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // Front image uploaded to MinIO
  frontImage: {
    fileId: String,
    url: String,
    filename: String
  },
  // Back image uploaded to MinIO
  backImage: {
    fileId: String,
    url: String,
    filename: String
  },
  // Status
  active: {
    type: Boolean,
    default: true
  },
  // Sort order for display
  sortOrder: {
    type: Number,
    default: 0
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
customStyleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CustomStyle', customStyleSchema);
