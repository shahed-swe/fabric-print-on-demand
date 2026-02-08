const path = require('path');
const fs = require('fs');
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
    
    let uploadResult = null;
    let uploadedToMinio = false;
    
    // Try to upload to MinIO
    try {
      uploadResult = await uploadToMinio(file.data, filename, file.mimetype);
      uploadedToMinio = true;
      console.log('✓ File uploaded to MinIO:', filename);
    } catch (minioError) {
      console.warn('MinIO upload failed, saving to local filesystem instead:', minioError.message);
      
      // Fallback: Save to local filesystem
      const uploadsDir = process.env.UPLOADS_DIR || './uploads';
      
      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, file.data);
      
      // Create result object similar to MinIO response
      uploadResult = {
        bucket: 'local-storage',
        fileName: filename,
        url: `${process.env.UPLOAD_API_URL || 'http://localhost:5001'}/api/files/${filename}`
      };
      
      console.log('✓ File saved to local storage:', filename);
    }

    // Store file information in MongoDB
    const fileInfo = await File.create({
      filename,
      originalName: file.name,
      path: uploadResult.url,
      size: file.size,
      mimetype: file.mimetype,
      bucket: uploadResult.bucket,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id,
      storedInMinio: uploadedToMinio
    });

    console.log('File record created in database:', filename);
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
    
    console.log('Attempting to retrieve file:', fileid);
    
    let fileBuffer;
    let contentType = 'application/octet-stream';
    let fileFound = false;

    // Try MinIO first
    try {
      console.log('Trying MinIO...');
      fileBuffer = await downloadFromMinio(fileid);
      fileFound = true;
      console.log('✓ File retrieved from MinIO:', fileid);
    } catch (minioError) {
      console.log('MinIO failed, trying local filesystem:', minioError.message);
      
      // Fallback to local filesystem
      const uploadsDir = process.env.UPLOADS_DIR || './uploads';
      const filePath = path.join(uploadsDir, fileid);
      
      console.log('Looking for file at:', filePath);
      
      if (fs.existsSync(filePath)) {
        try {
          fileBuffer = fs.readFileSync(filePath);
          fileFound = true;
          console.log('✓ File retrieved from local storage:', fileid);
        } catch (fsError) {
          console.error('Error reading local file:', fsError);
        }
      } else {
        console.log('File not found in local storage:', filePath);
      }
    }

    if (!fileFound || !fileBuffer) {
      console.error('File not found in MinIO or local storage:', fileid);
      return res.status(404).json({ error: 'File not found' });
    }

    // Try to get file info from database for metadata
    const fileInfo = await File.findOne({ filename: fileid });
    
    // Set appropriate headers
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Determine content type
    if (fileInfo && fileInfo.mimetype) {
      contentType = fileInfo.mimetype;
    } else if (fileid.toLowerCase().endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (fileid.toLowerCase().match(/\.(jpg|jpeg)$/i)) {
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
    } else {
      res.setHeader('Content-Disposition', `attachment; filename=${fileid}`);
    }
    
    // Enable caching for images
    if (contentType.startsWith('image/')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
    
    // Send the file buffer
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Error retrieving file:', error);
    
    res.status(500).json({ 
      error: 'Error retrieving file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
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
    
    console.log('Deleting file:', fileid);
    
    let deletedFromMinio = false;
    let deletedFromLocal = false;
    
    // Try to delete from MinIO
    try {
      await deleteFromMinio(fileid);
      deletedFromMinio = true;
      console.log('✓ File deleted from MinIO:', fileid);
    } catch (minioError) {
      console.warn('MinIO deletion failed:', minioError.message);
    }
    
    // Try to delete from local filesystem
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    const filePath = path.join(uploadsDir, fileid);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        deletedFromLocal = true;
        console.log('✓ File deleted from local storage:', fileid);
      } catch (fsError) {
        console.error('Error deleting local file:', fsError);
      }
    }
    
    // Delete from database
    await File.deleteOne({ filename: fileid });
    
    if (deletedFromMinio || deletedFromLocal) {
      console.log('✓ File deleted successfully:', fileid);
      res.json({ 
        message: 'File deleted successfully', 
        filename: fileid,
        deletedFromMinio,
        deletedFromLocal 
      });
    } else {
      res.status(404).json({ error: 'File not found in MinIO or local storage' });
    }
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: 'Error deleting file',
      details: error.message 
    });
  }
};
