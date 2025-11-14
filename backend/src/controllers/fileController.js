const path = require('path');
const File = require('../models/File');
const { uploadFile: uploadToMinio, downloadFile: downloadFromMinio, deleteFile: deleteFromMinio, getFileUrl } = require('../config/minio');

exports.uploadFile = async (req, res) => {
  try {
    console.log('Received files:', req.files);
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Upload to MinIO
    const uploadResult = await uploadToMinio(file.data, filename, file.mimetype);
    
    // Store file information in MongoDB
    const fileInfo = await File.create({
      filename,
      originalName: file.name,
      path: uploadResult.url,  // Store MinIO URL
      size: file.size,
      mimetype: file.mimetype,
      bucket: uploadResult.bucket,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id
    });

    console.log('File uploaded successfully to MinIO:', filename);
    res.status(200).json({ 
      fileId: filename,
      url: uploadResult.url,
      bucket: uploadResult.bucket
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
    
    console.log('Retrieving file from MinIO:', fileid);
    
    // Download file from MinIO
    const fileBuffer = await downloadFromMinio(fileid);
    
    // Try to get file info from database for metadata
    const fileInfo = await File.findOne({ filename: fileid });
    
    // Set appropriate headers
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=${fileid}`);
    
    // Set content type based on file info or file extension
    if (fileInfo && fileInfo.mimetype) {
      res.setHeader('Content-Type', fileInfo.mimetype);
    } else if (fileid.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (fileid.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      res.setHeader('Content-Type', 'image/' + fileid.split('.').pop());
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    
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
    
    console.log('Deleting file from MinIO:', fileid);
    
    // Delete from MinIO
    await deleteFromMinio(fileid);
    
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
