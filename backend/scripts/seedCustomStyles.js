const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const CustomStyle = require('../src/models/CustomStyle');
const { uploadFile: uploadToMinio, getFileUrl } = require('../src/config/minio');
require('dotenv').config();

// Get the root directory of the project
const rootDir = path.join(__dirname, '../../');
const imagesDir = path.join(rootDir, 'frontend/public/images');

// Image files to upload
const IMAGE_FILES = [
  { name: 'crew_front.png', path: path.join(imagesDir, 'crew_front.png') },
  { name: 'crew_back.png', path: path.join(imagesDir, 'crew_back.png') },
  { name: 'womens_crew_front.png', path: path.join(imagesDir, 'womens_crew_front.png') },
  { name: 'womens_crew_back.png', path: path.join(imagesDir, 'womens_crew_back.png') },
  { name: 'mens_hoodie_front.png', path: path.join(imagesDir, 'mens_hoodie_front.png') },
  { name: 'mens_hoodie_back.png', path: path.join(imagesDir, 'mens_hoodie_back.png') },
  { name: 'mens_longsleeve_front.png', path: path.join(imagesDir, 'mens_longsleeve_front.png') },
  { name: 'mens_longsleeve_back.png', path: path.join(imagesDir, 'mens_longsleeve_back.png') },
  { name: 'mens_tank_front.png', path: path.join(imagesDir, 'mens_tank_front.png') },
  { name: 'mens_tank_back.png', path: path.join(imagesDir, 'mens_tank_back.png') }
];

// Upload image to MinIO
const uploadImageToMinio = async (imagePath, imageName) => {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const timestamp = Date.now();
    const fileName = `${timestamp}-${imageName.replace(/\s+/g, '-')}`;
    
    console.log(`Uploading ${imageName}...`);
    const uploadResult = await uploadToMinio(fileBuffer, fileName, 'image/png');
    
    console.log(`✓ Uploaded ${imageName} to MinIO`);
    
    return {
      fileId: fileName,
      url: uploadResult.url,
      filename: imageName
    };
  } catch (error) {
    console.error(`✗ Failed to upload ${imageName}:`, error.message);
    throw error;
  }
};

const seedCustomStyles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fabric-print-on-demand');
    console.log('✓ Connected to MongoDB\n');

    // Upload all images to MinIO first
    console.log('===== Uploading Images to MinIO =====');
    const uploadedImages = {};
    
    for (const imageFile of IMAGE_FILES) {
      try {
        const imageData = await uploadImageToMinio(imageFile.path, imageFile.name);
        uploadedImages[imageFile.name] = imageData;
      } catch (error) {
        console.error(`Error uploading ${imageFile.name}. Make sure the image exists at ${imageFile.path}`);
        throw error;
      }
    }

    console.log('\n===== Creating Custom Styles =====');
    
    // Define default custom styles using uploaded image URLs
    const defaultStyles = [
      {
        title: "Mens T-shirt",
        description: "Classic men's crew neck t-shirt",
        price: 500,
        frontImage: uploadedImages['crew_front.png'],
        backImage: uploadedImages['crew_back.png'],
        sortOrder: 1,
        active: true
      },
      {
        title: "Women's T-shirt",
        description: "Classic women's crew neck t-shirt",
        price: 500,
        frontImage: uploadedImages['womens_crew_front.png'],
        backImage: uploadedImages['womens_crew_back.png'],
        sortOrder: 2,
        active: true
      },
      {
        title: "Hoodie",
        description: "Comfortable men's hoodie",
        price: 800,
        frontImage: uploadedImages['mens_hoodie_front.png'],
        backImage: uploadedImages['mens_hoodie_back.png'],
        sortOrder: 3,
        active: true
      },
      {
        title: "Long Sleeve",
        description: "Men's long sleeve shirt",
        price: 600,
        frontImage: uploadedImages['mens_longsleeve_front.png'],
        backImage: uploadedImages['mens_longsleeve_back.png'],
        sortOrder: 4,
        active: true
      },
      {
        title: "Mens Tank",
        description: "Sleeveless men's tank top",
        price: 450,
        frontImage: uploadedImages['mens_tank_front.png'],
        backImage: uploadedImages['mens_tank_back.png'],
        sortOrder: 5,
        active: true
      }
    ];

    // Check if custom styles already exist
    const existingCount = await CustomStyle.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing custom styles.`);
      console.log('Removing existing custom styles...');
      await CustomStyle.deleteMany({});
      console.log('✓ Existing custom styles removed.\n');
    }

    // Insert default styles
    const insertedStyles = await CustomStyle.insertMany(defaultStyles);
    console.log(`✓ Successfully seeded ${insertedStyles.length} custom styles to the database:`);
    insertedStyles.forEach(style => {
      console.log(`   - ${style.title} ($${style.price})`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding custom styles:', error);
    process.exit(1);
  }
};

// Run the seed script
seedCustomStyles();
