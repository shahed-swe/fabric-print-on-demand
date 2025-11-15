const { minioClient, bucketName, initializeBucket } = require('../config/minio');
require('dotenv').config();

async function verifyMinioSetup() {
  console.log('🔍 Verifying MinIO Setup...\n');
  
  try {
    // Check connection
    console.log('1. Checking MinIO connection...');
    const buckets = await minioClient.listBuckets();
    console.log('✓ Connected to MinIO successfully');
    console.log(`  Found ${buckets.length} bucket(s):`, buckets.map(b => b.name).join(', '));
    
    // Initialize bucket
    console.log('\n2. Initializing bucket...');
    await initializeBucket();
    console.log('✓ Bucket initialized');
    
    // Check bucket policy
    console.log('\n3. Checking bucket policy...');
    try {
      const policy = await minioClient.getBucketPolicy(bucketName);
      console.log('✓ Bucket policy is set:');
      console.log(JSON.stringify(JSON.parse(policy), null, 2));
    } catch (err) {
      console.log('⚠ No bucket policy set or error reading policy');
    }
    
    // Test file upload
    console.log('\n4. Testing file upload...');
    const testContent = Buffer.from('This is a test file for MinIO verification');
    const testFileName = `test-${Date.now()}.txt`;
    
    await minioClient.putObject(bucketName, testFileName, testContent);
    console.log(`✓ Test file uploaded: ${testFileName}`);
    
    // Test file download
    console.log('\n5. Testing file download...');
    const stream = await minioClient.getObject(bucketName, testFileName);
    const chunks = [];
    
    await new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    
    const downloadedContent = Buffer.concat(chunks).toString();
    console.log('✓ Test file downloaded successfully');
    console.log(`  Content: "${downloadedContent}"`);
    
    // Test public access URL
    console.log('\n6. Testing public access URL...');
    const publicUrl = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${testFileName}`;
    console.log(`  Public URL: ${publicUrl}`);
    console.log('  ⚠ Test this URL in your browser to verify public access');
    
    // Cleanup
    console.log('\n7. Cleaning up test file...');
    await minioClient.removeObject(bucketName, testFileName);
    console.log('✓ Test file removed');
    
    console.log('\n✅ MinIO setup verification completed successfully!\n');
    console.log('Configuration:');
    console.log(`  Endpoint: ${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`);
    console.log(`  Bucket: ${bucketName}`);
    console.log(`  Use SSL: ${process.env.MINIO_USE_SSL || 'false'}`);
    
  } catch (error) {
    console.error('\n❌ MinIO verification failed:');
    console.error(error);
    process.exit(1);
  }
}

verifyMinioSetup();
