// Load environment variables FIRST before anything else
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const { initializeBucket } = require('./config/minio');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Reasonable limit for JSON without base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
}));

// Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize MinIO bucket
initializeBucket()
  .then(() => console.log('✓ MinIO initialized'))
  .catch((err) => console.error('MinIO initialization error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
