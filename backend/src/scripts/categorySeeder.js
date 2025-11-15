const mongoose = require('mongoose');
const Category = require('../models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected for category seeding...'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample category data
const categoriesData = [
  {
    name: 'T-Shirts',
    description: 'Classic t-shirts for everyday wear and custom printing',
    slug: 't-shirts'
  },
  {
    name: 'Hoodies',
    description: 'Comfortable hoodies and sweatshirts for cooler weather',
    slug: 'hoodies'
  },
  {
    name: 'Long Sleeve Shirts',
    description: 'Long sleeve shirts for versatile styling',
    slug: 'long-sleeve-shirts'
  },
  {
    name: 'Tank Tops',
    description: 'Sleeveless tops for warm weather and athletic wear',
    slug: 'tank-tops'
  },
  {
    name: 'Polo Shirts',
    description: 'Classic polo shirts for a smart casual look',
    slug: 'polo-shirts'
  },
  {
    name: 'Sweatshirts',
    description: 'Crew neck sweatshirts for comfort and warmth',
    slug: 'sweatshirts'
  }
];

async function seedCategories() {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('✓ Cleared existing categories');

    // Create categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✓ Created ${createdCategories.length} categories`);
    
    // Display summary
    console.log('\n📁 Categories Created:');
    createdCategories.forEach(category => {
      console.log(`  - ${category.name} (${category.slug})`);
    });

    console.log('\n✅ Category seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

// Run seeder
seedCategories();
