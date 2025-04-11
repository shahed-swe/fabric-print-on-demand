const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

exports.uploadFile = async (req, res) => {
  try {
    console.log('Received files:', req.files);
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);

    // Move file to upload directory
    await file.mv(filePath);

    // Store file information in MongoDB using the correct field name 'path'
    const fileInfo = await File.create({
      filename,
      originalName: file.name,
      path: filePath,  // Changed from filePath to path
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id
    });

    console.log('File uploaded successfully:', filename);
    res.status(200).json({ fileId: filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error saving file', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getFile = async (req, res) => {
  try {
    const { fileid } = req.params;
    const filePath = path.join(uploadDir, fileid);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file metadata from the filesystem
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers for file download
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename=${fileid}`);
    
    // Determine content type - if you have specific file types, you can match them here
    // For PDF files
    if (fileid.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      // Default to octet-stream for unknown types
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    // Create a read stream and pipe it directly to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Handle potential errors during streaming
    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: 'Error retrieving file' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find().populate('uploadedBy', 'name email');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
