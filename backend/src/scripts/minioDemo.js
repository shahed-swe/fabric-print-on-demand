const { uploadFile, downloadFile, listFiles, initializeBucket } = require('../config/minio');
const fs = require('fs');
const path = require('path');

async function runDemo() {
  console.log('========================================');
  console.log('MinIO Demo - File Upload & Operations');
  console.log('========================================\n');

  try {
    // Step 1: Initialize bucket
    console.log('1. Initializing MinIO bucket...');
    await initializeBucket();
    console.log('');

    // Step 2: Create a demo text file
    console.log('2. Creating demo file...');
    const demoContent = `
╔════════════════════════════════════════════╗
║   FABRIC PRINT-ON-DEMAND DEMO FILE        ║
║   Created: ${new Date().toISOString()}    ║
╚════════════════════════════════════════════╝

This is a demo file uploaded to MinIO!

MinIO is successfully configured and working.

Features:
✓ S3-Compatible API
✓ Self-hosted object storage
✓ High performance
✓ Docker containerized
✓ Easy integration

Use cases in this project:
- Store design PDFs
- Store uploaded images
- Store customer designs
- Backup and archival
`;

    const fileName = `demo-${Date.now()}.txt`;
    const fileBuffer = Buffer.from(demoContent, 'utf-8');
    console.log(`✓ Demo file created: ${fileName}\n`);

    // Step 3: Upload file to MinIO
    console.log('3. Uploading file to MinIO...');
    const uploadResult = await uploadFile(fileBuffer, fileName, 'text/plain');
    console.log(`✓ Upload successful!`);
    console.log(`   Bucket: ${uploadResult.bucket}`);
    console.log(`   File: ${uploadResult.fileName}`);
    console.log(`   URL: ${uploadResult.url}\n`);

    // Step 4: List all files
    console.log('4. Listing all files in bucket...');
    const files = await listFiles();
    console.log(`✓ Found ${files.length} file(s):`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    });
    console.log('');

    // Step 5: Download the file
    console.log('5. Downloading file from MinIO...');
    const downloadedBuffer = await downloadFile(fileName);
    console.log(`✓ Downloaded ${downloadedBuffer.length} bytes`);
    console.log('\n--- File Contents ---');
    console.log(downloadedBuffer.toString('utf-8'));
    console.log('--- End of File ---\n');

    // Step 6: Success message
    console.log('========================================');
    console.log('✓ MinIO Demo Completed Successfully!');
    console.log('========================================');
    console.log('\nMinIO Console: http://localhost:9001');
    console.log('Username: admin');
    console.log('Password: minioadmin123\n');
    console.log('You can now access the MinIO web console to view your files!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error during demo:', error.message);
    console.error('\nMake sure MinIO is running:');
    console.error('  docker-compose up -d\n');
    process.exit(1);
  }
}

// Run the demo
runDemo();
