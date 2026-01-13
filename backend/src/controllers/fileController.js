const path = require('path');
const File = require('../models/File');
const { uploadFile: uploadToDisk, downloadFile: downloadFromDisk, deleteFile: deleteFromDisk, getFileUrl } = require('../config/fileStorage');

exports.uploadFile = async (req, res) => {
  try {
    console.log('Received files:', req.files);
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Upload to disk
    const uploadResult = await uploadToDisk(file.data, filename, file.mimetype);
    
    // Store file information in MongoDB
    const fileInfo = await File.create({
      filename,
      originalName: file.name,
      path: uploadResult.url,  // Store file URL
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id
    });

    console.log('File uploaded successfully to disk:', filename);
    res.status(200).json({ 
      fileId: filename,
      url: uploadResult.url,
      filename: filename
    });
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
    
    console.log('Retrieving file from disk:', fileid);
    
    // Download file from disk
    const fileBuffer = await downloadFromDisk(fileid);
    
    // Try to get file info from database for metadata
    const fileInfo = await File.findOne({ filename: fileid });
    
    // Set appropriate headers
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (fileInfo && fileInfo.mimetype) {
      contentType = fileInfo.mimetype;
    } else if (fileid.toLowerCase().endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (fileid.toLowerCase().match(/\.(jpg|jpeg)$/)) {
      contentType = 'image/jpeg';
    } else if (fileid.toLowerCase().endsWith('.png')) {
      contentType = 'image/png';
    } else if (fileid.toLowerCase().endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (fileid.toLowerCase().endsWith('.webp')) {
      contentType = 'image/webp';
    }
    
    res.setHeader('Content-Type', contentType);
    
    // For images, use inline disposition to allow viewing in browser
    if (contentType.startsWith('image/')) {
      res.setHeader('Content-Disposition', `inline; filename=${fileid}`);
      // Enable aggressive caching for images since they are immutable
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      // Add ETag for conditional requests
      res.setHeader('ETag', `"${Buffer.from(fileid).toString('base64')}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename=${fileid}`);
      // Standard caching for other files
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
    
    // Add CORS headers explicitly for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send the file buffer
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Error retrieving file from MinIO:', error);
    
    if (error.code === 'NoSuchKey') {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.status(500).json({ 
      error: 'Error retrieving file',
      details: error.message 
    });
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

exports.deleteFile = async (req, res) => {
  try {
    const { fileid } = req.params;
    
    console.log('Deleting file from disk:', fileid);
    
    // Delete from disk
    await deleteFromDisk(fileid);
    
    // Delete from database
    await File.deleteOne({ filename: fileid });
    
    console.log('✓ File deleted successfully:', fileid);
    res.json({ message: 'File deleted successfully', filename: fileid });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: 'Error deleting file',
      details: error.message 
    });
  }
};
