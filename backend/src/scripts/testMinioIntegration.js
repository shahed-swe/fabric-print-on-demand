const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5001/api';

async function testFileUpload() {
  console.log('========================================');
  console.log('Testing MinIO Integration with Backend');
  console.log('========================================\n');

  try {
    // Step 1: Create a test PDF file
    console.log('1. Creating test PDF file...');
    const testContent = `
    ╔════════════════════════════════════════════╗
    ║   TEST PDF FOR MINIO INTEGRATION          ║
    ║   Created: ${new Date().toISOString()}    ║
    ╚════════════════════════════════════════════╝
    
    This is a test file to verify MinIO integration
    with the backend file upload system.
    `;
    
    const testFilePath = path.join(__dirname, 'test-design.pdf');
    fs.writeFileSync(testFilePath, testContent);
    console.log('✓ Test file created\n');

    // Step 2: Upload file via API
    console.log('2. Uploading file via API...');
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    
    const uploadResponse = await axios.post(`${API_URL}/upload`, form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    console.log('✓ Upload successful!');
    console.log('   Response:', uploadResponse.data);
    const fileId = uploadResponse.data.fileId;
    console.log('');

    // Step 3: Download file via API
    console.log('3. Downloading file via API...');
    const downloadResponse = await axios.get(`${API_URL}/files/${fileId}`, {
      responseType: 'arraybuffer'
    });
    
    console.log('✓ Download successful!');
    console.log(`   File size: ${downloadResponse.data.length} bytes`);
    console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
    console.log('');

    // Step 4: List all files
    console.log('4. Listing all files...');
    const listResponse = await axios.get(`${API_URL}/files`);
    console.log(`✓ Found ${listResponse.data.length} file(s) in database`);
    
    if (listResponse.data.length > 0) {
      console.log('\n   Recent files:');
      listResponse.data.slice(-3).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.filename}`);
        console.log(`      - Original: ${file.originalName}`);
        console.log(`      - Size: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`      - Bucket: ${file.bucket}`);
        console.log(`      - URL: ${file.path}`);
      });
    }
    console.log('');

    // Step 5: Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('5. Test file cleaned up\n');

    // Success
    console.log('========================================');
    console.log('✓ All Tests Passed Successfully!');
    console.log('========================================');
    console.log('\nMinIO Integration Summary:');
    console.log('✓ File upload to MinIO working');
    console.log('✓ File download from MinIO working');
    console.log('✓ Database storage working');
    console.log('✓ API endpoints functioning correctly');
    console.log('\nYour backend is now using MinIO for file storage!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.error('\nMake sure:');
    console.error('1. MinIO is running: docker-compose up -d');
    console.error('2. Backend server is running: npm start');
    console.error('');
    process.exit(1);
  }
}

// Run the test
testFileUpload();
