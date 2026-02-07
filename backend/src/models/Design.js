const mongoose = require('mongoose');

const textElementSchema = new mongoose.Schema({
  text: String,
  fontSize: Number,
  fontFamily: String,
  color: String,
  fontWeight: String,
  fontStyle: String,
  textAlign: String,
  underline: Boolean,
  linethrough: Boolean,
  left: Number,
  top: Number,
  angle: Number,
  scaleX: Number,
  scaleY: Number,
}, { _id: false });

const imageElementSchema = new mongoose.Schema({
  fileId: String, // MinIO file ID
  left: Number,
  top: Number,
  scaleX: Number,
  scaleY: Number,
  angle: Number,
  width: Number,
  height: Number,
}, { _id: false });

const canvasElementsSchema = new mongoose.Schema({
  texts: [textElementSchema],
  images: [imageElementSchema]
}, { _id: false });

const designSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    default: null  // Can be null initially, filled during async PDF generation
  },
  frontImageFileId: {
    type: String,
    default: null
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
  elements: {
    front: canvasElementsSchema,
    back: canvasElementsSchema
  },
  pdfStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  pdfError: {
    type: String,
    default: null
  },
  frontCanvasData: {
    type: String,  // Store base64 or data URL temporarily
    default: null
  },
  backCanvasData: {
    type: String,  // Store base64 or data URL temporarily
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Design', designSchema);
