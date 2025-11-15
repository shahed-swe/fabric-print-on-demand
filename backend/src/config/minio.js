const Minio = require('minio');

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'fabric-designs';

// Initialize bucket
const initializeBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✓ Bucket "${bucketName}" created successfully`);
    } else {
      console.log(`✓ Bucket "${bucketName}" already exists`);
    }
    
    // Always set bucket policy to allow public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`]
        }
      ]
    };
    
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`✓ Bucket policy set for "${bucketName}" - public read access enabled`);
  } catch (err) {
    console.error('Error initializing MinIO bucket:', err);
    throw err;
  }
};

// Upload file to MinIO
const uploadFile = async (fileBuffer, fileName, contentType = 'application/octet-stream') => {
  try {
    await initializeBucket();
    
    const metaData = {
      'Content-Type': contentType
    };
    
    await minioClient.putObject(bucketName, fileName, fileBuffer, fileBuffer.length, metaData);
    
    console.log(`✓ File uploaded successfully: ${fileName}`);
    return {
      bucket: bucketName,
      fileName: fileName,
      url: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`
    };
  } catch (err) {
    console.error('Error uploading file to MinIO:', err);
    throw err;
  }
};

// Download file from MinIO
const downloadFile = async (fileName) => {
  try {
    const dataStream = await minioClient.getObject(bucketName, fileName);
    
    return new Promise((resolve, reject) => {
      const chunks = [];
      dataStream.on('data', (chunk) => chunks.push(chunk));
      dataStream.on('end', () => resolve(Buffer.concat(chunks)));
      dataStream.on('error', reject);
    });
  } catch (err) {
    console.error('Error downloading file from MinIO:', err);
    throw err;
  }
};

// Delete file from MinIO
const deleteFile = async (fileName) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    console.log(`✓ File deleted successfully: ${fileName}`);
    return true;
  } catch (err) {
    console.error('Error deleting file from MinIO:', err);
    throw err;
  }
};

// Get file URL
const getFileUrl = (fileName) => {
  return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`;
};

// List all files in bucket
const listFiles = async () => {
  try {
    const stream = minioClient.listObjects(bucketName, '', true);
    const files = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj));
      stream.on('end', () => resolve(files));
      stream.on('error', reject);
    });
  } catch (err) {
    console.error('Error listing files from MinIO:', err);
    throw err;
  }
};

module.exports = {
  minioClient,
  bucketName,
  initializeBucket,
  uploadFile,
  downloadFile,
  deleteFile,
  getFileUrl,
  listFiles
};
