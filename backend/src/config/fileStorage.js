const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✓ Uploads directory created: ${uploadsDir}`);
}

// Upload file to disk
const uploadFile = async (fileBuffer, fileName, contentType = 'application/octet-stream') => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, fileBuffer);
    
    console.log(`✓ File uploaded successfully: ${fileName}`);
    
    // Generate URL pointing to uploaded file through API
    const apiBaseUrl = process.env.UPLOAD_API_URL || 
                       `http://localhost:${process.env.PORT || 5001}`;
    
    return {
      fileName: fileName,
      url: `${apiBaseUrl}/uploads/${fileName}`,
      path: filePath
    };
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
};

// Download file from disk
const downloadFile = async (fileName) => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      throw error;
    }
    
    // Read file from disk
    const fileBuffer = await fs.promises.readFile(filePath);
    return fileBuffer;
  } catch (err) {
    if (err.code === 'ENOENT') {
      err.code = 'NoSuchKey'; // Maintain compatibility
    }
    console.error('Error downloading file:', err);
    throw err;
  }
};

// Delete file from disk
const deleteFile = async (fileName) => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`✓ File deleted successfully: ${fileName}`);
    }
    return true;
  } catch (err) {
    console.error('Error deleting file:', err);
    throw err;
  }
};

// Get file URL
const getFileUrl = (fileName) => {
  const apiBaseUrl = process.env.UPLOAD_API_URL || 
                     `http://localhost:${process.env.PORT || 5001}`;
  return `${apiBaseUrl}/uploads/${fileName}`;
};

// List all files
const listFiles = async () => {
  try {
    const files = await fs.promises.readdir(uploadsDir);
    return files.map(file => ({
      name: file,
      path: path.join(uploadsDir, file)
    }));
  } catch (err) {
    console.error('Error listing files:', err);
    throw err;
  }
};

// Get file info
const getFileInfo = async (fileName) => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    const stats = await fs.promises.stat(filePath);
    return {
      fileName: fileName,
      size: stats.size,
      path: filePath,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (err) {
    console.error('Error getting file info:', err);
    throw err;
  }
};

module.exports = {
  uploadsDir,
  uploadFile,
  downloadFile,
  deleteFile,
  getFileUrl,
  listFiles,
  getFileInfo
};
