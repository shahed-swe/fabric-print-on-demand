const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected for seeding...'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample product data
const productsData = [
  {
    name: 'Classic Cotton T-Shirt',
    sku: 'TSH-001',
    subcategory: 'Unisex',
    shortDescription: 'Comfortable everyday t-shirt made from 100% cotton',
    description: '<p>This <strong>classic cotton t-shirt</strong> is perfect for everyday wear. Made from premium 100% cotton fabric, it offers exceptional comfort and durability.</p><ul><li>Soft and breathable fabric</li><li>Pre-shrunk for perfect fit</li><li>Double-stitched for durability</li></ul>',
    basePrice: 20.00,
    price: 30.00,
    material: '100% Cotton',
    weight: '180 GSM',
    fit: 'Regular Fit',
    sizes: [
      { size: 'S', stockQuantity: 50, enabled: true },
      { size: 'M', stockQuantity: 75, enabled: true },
      { size: 'L', stockQuantity: 60, enabled: true },
      { size: 'XL', stockQuantity: 40, enabled: true },
      { size: 'XXL', stockQuantity: 25, enabled: true }
    ],
    colors: [
      { name: 'White', hexCode: '#FFFFFF', stockQuantity: 100, enabled: true },
      { name: 'Black', hexCode: '#000000', stockQuantity: 80, enabled: true },
      { name: 'Navy Blue', hexCode: '#000080', stockQuantity: 60, enabled: true },
      { name: 'Gray', hexCode: '#808080', stockQuantity: 50, enabled: true }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        alt: 'Classic Cotton T-Shirt - Front View',
        isPrimary: true,
        sortOrder: 0
      },
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        alt: 'Classic Cotton T-Shirt - Side View',
        isPrimary: false,
        sortOrder: 1
      }
    ],
    sizeChart: {
      measurements: [
        { size: 'S', chest: '34-36"', length: '27"', shoulder: '15.5"', sleeve: '7.5"' },
        { size: 'M', chest: '38-40"', length: '28"', shoulder: '17"', sleeve: '8"' },
        { size: 'L', chest: '42-44"', length: '29"', shoulder: '18.5"', sleeve: '8.5"' },
        { size: 'XL', chest: '46-48"', length: '30"', shoulder: '20"', sleeve: '9"' },
        { size: 'XXL', chest: '50-52"', length: '31"', shoulder: '21.5"', sleeve: '9.5"' }
      ]
    },
    careInstructions: [
      'Machine wash cold with like colors',
      'Tumble dry low',
      'Do not bleach',
      'Iron on low heat if needed',
      'Do not dry clean'
    ],
    features: [
      'Pre-shrunk fabric',
      'Double-stitched sleeves and bottom hem',
      'Tag-free label',
      'Ribbed crew neck',
      'Side-seamed construction'
    ],
    printableAreas: [
      { name: 'Front', maxWidth: 12, maxHeight: 16, enabled: true },
      { name: 'Back', maxWidth: 12, maxHeight: 16, enabled: true }
    ],
    tags: ['cotton', 't-shirt', 'casual', 'everyday', 'unisex'],
    metaTitle: 'Classic Cotton T-Shirt - Comfortable Everyday Wear',
    metaDescription: 'Shop our premium 100% cotton t-shirt. Soft, durable, and perfect for custom printing. Available in multiple sizes and colors.',
    status: 'active',
    featured: true
  },
  {
    name: 'Premium Pullover Hoodie',
    sku: 'HOD-001',
    subcategory: 'Unisex',
    shortDescription: 'Cozy pullover hoodie with kangaroo pocket',
    description: '<p>Stay warm and stylish with our <strong>premium pullover hoodie</strong>. Features a soft fleece interior and durable exterior.</p><ul><li>80% Cotton, 20% Polyester blend</li><li>Lined hood with matching drawcord</li><li>Front kangaroo pocket</li><li>Ribbed cuffs and waistband</li></ul>',
    basePrice: 35.00,
    price: 55.00,
    material: '80% Cotton, 20% Polyester',
    weight: '280 GSM',
    fit: 'Regular Fit',
    sizes: [
      { size: 'S', stockQuantity: 30, enabled: true },
      { size: 'M', stockQuantity: 50, enabled: true },
      { size: 'L', stockQuantity: 45, enabled: true },
      { size: 'XL', stockQuantity: 35, enabled: true },
      { size: 'XXL', stockQuantity: 20, enabled: true }
    ],
    colors: [
      { name: 'Black', hexCode: '#000000', stockQuantity: 70, enabled: true },
      { name: 'Charcoal Gray', hexCode: '#36454F', stockQuantity: 60, enabled: true },
      { name: 'Navy', hexCode: '#000080', stockQuantity: 50, enabled: true }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        alt: 'Premium Pullover Hoodie - Front View',
        isPrimary: true,
        sortOrder: 0
      }
    ],
    sizeChart: {
      measurements: [
        { size: 'S', chest: '38-40"', length: '26"', shoulder: '17"', sleeve: '33"' },
        { size: 'M', chest: '42-44"', length: '27"', shoulder: '18.5"', sleeve: '34"' },
        { size: 'L', chest: '46-48"', length: '28"', shoulder: '20"', sleeve: '35"' },
        { size: 'XL', chest: '50-52"', length: '29"', shoulder: '21.5"', sleeve: '36"' },
        { size: 'XXL', chest: '54-56"', length: '30"', shoulder: '23"', sleeve: '37"' }
      ]
    },
    careInstructions: [
      'Machine wash cold inside out',
      'Tumble dry low',
      'Do not bleach',
      'Do not iron if decorated',
      'Do not dry clean'
    ],
    features: [
      'Double-lined hood',
      'Matching drawcord',
      'Pouch pocket',
      'Ribbed cuffs and waistband',
      '1x1 athletic rib knit cuffs with spandex'
    ],
    printableAreas: [
      { name: 'Front', maxWidth: 12, maxHeight: 16, enabled: true },
      { name: 'Back', maxWidth: 13, maxHeight: 18, enabled: true }
    ],
    tags: ['hoodie', 'pullover', 'casual', 'warm', 'cotton-blend'],
    metaTitle: 'Premium Pullover Hoodie - Warm & Comfortable',
    metaDescription: 'Cozy pullover hoodie with fleece interior. Perfect for custom designs. Available in multiple sizes.',
    status: 'active',
    featured: true
  },
  {
    name: 'Long Sleeve Performance Shirt',
    sku: 'SHT-001',
    subcategory: 'Men\'s',
    shortDescription: 'Moisture-wicking long sleeve athletic shirt',
    description: '<p>Our <strong>performance long sleeve shirt</strong> is designed for active lifestyles. Features moisture-wicking technology to keep you dry and comfortable.</p><ul><li>Lightweight and breathable</li><li>UPF 50+ sun protection</li><li>Quick-dry fabric</li><li>Flatlock seams prevent chafing</li></ul>',
    basePrice: 25.00,
    price: 42.00,
    material: '100% Polyester Performance Fabric',
    weight: '140 GSM',
    fit: 'Slim Fit',
    sizes: [
      { size: 'S', stockQuantity: 40, enabled: true },
      { size: 'M', stockQuantity: 60, enabled: true },
      { size: 'L', stockQuantity: 55, enabled: true },
      { size: 'XL', stockQuantity: 45, enabled: true },
      { size: 'XXL', stockQuantity: 30, enabled: true }
    ],
    colors: [
      { name: 'Black', hexCode: '#000000', stockQuantity: 80, enabled: true },
      { name: 'Royal Blue', hexCode: '#4169E1', stockQuantity: 70, enabled: true },
      { name: 'Red', hexCode: '#FF0000', stockQuantity: 60, enabled: true }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        alt: 'Long Sleeve Performance Shirt',
        isPrimary: true,
        sortOrder: 0
      }
    ],
    sizeChart: {
      measurements: [
        { size: 'S', chest: '36-38"', length: '28"', shoulder: '16"', sleeve: '34"' },
        { size: 'M', chest: '40-42"', length: '29"', shoulder: '17.5"', sleeve: '35"' },
        { size: 'L', chest: '44-46"', length: '30"', shoulder: '19"', sleeve: '36"' },
        { size: 'XL', chest: '48-50"', length: '31"', shoulder: '20.5"', sleeve: '37"' },
        { size: 'XXL', chest: '52-54"', length: '32"', shoulder: '22"', sleeve: '38"' }
      ]
    },
    careInstructions: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not bleach',
      'Do not iron',
      'Do not dry clean'
    ],
    features: [
      'Moisture-wicking technology',
      'UPF 50+ sun protection',
      'Quick-dry fabric',
      'Flatlock seams',
      'Raglan sleeves for mobility'
    ],
    printableAreas: [
      { name: 'Front', maxWidth: 11, maxHeight: 14, enabled: true },
      { name: 'Back', maxWidth: 11, maxHeight: 14, enabled: true },
      { name: 'Left Sleeve', maxWidth: 3, maxHeight: 5, enabled: true }
    ],
    tags: ['performance', 'athletic', 'long-sleeve', 'mens', 'moisture-wicking'],
    metaTitle: 'Long Sleeve Performance Shirt - Athletic Wear',
    metaDescription: 'High-performance moisture-wicking long sleeve shirt. Perfect for sports and outdoor activities.',
    status: 'active',
    featured: false
  },
  {
    name: 'Women\'s V-Neck Tee',
    sku: 'TSH-002',
    subcategory: 'Women\'s',
    shortDescription: 'Soft and flattering v-neck t-shirt',
    description: '<p>A feminine take on the classic tee. This <strong>v-neck t-shirt</strong> features a flattering fit and ultra-soft fabric.</p><ul><li>100% combed and ringspun cotton</li><li>Flattering v-neckline</li><li>Side-seamed for better fit</li><li>Tear-away label</li></ul>',
    basePrice: 18.00,
    price: 30.00,
    material: '100% Combed and Ringspun Cotton',
    weight: '145 GSM',
    fit: 'Relaxed Fit',
    sizes: [
      { size: 'XS', stockQuantity: 25, enabled: true },
      { size: 'S', stockQuantity: 45, enabled: true },
      { size: 'M', stockQuantity: 50, enabled: true },
      { size: 'L', stockQuantity: 40, enabled: true },
      { size: 'XL', stockQuantity: 30, enabled: true }
    ],
    colors: [
      { name: 'White', hexCode: '#FFFFFF', stockQuantity: 90, enabled: true },
      { name: 'Pink', hexCode: '#FFC0CB', stockQuantity: 70, enabled: true },
      { name: 'Lavender', hexCode: '#E6E6FA', stockQuantity: 60, enabled: true },
      { name: 'Mint', hexCode: '#98FF98', stockQuantity: 50, enabled: true }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
        alt: 'Women\'s V-Neck Tee',
        isPrimary: true,
        sortOrder: 0
      }
    ],
    sizeChart: {
      measurements: [
        { size: 'XS', chest: '30-32"', length: '25"', shoulder: '14"', sleeve: '6"' },
        { size: 'S', chest: '32-34"', length: '26"', shoulder: '14.5"', sleeve: '6.5"' },
        { size: 'M', chest: '34-36"', length: '27"', shoulder: '15"', sleeve: '7"' },
        { size: 'L', chest: '36-38"', length: '28"', shoulder: '15.5"', sleeve: '7.5"' },
        { size: 'XL', chest: '38-40"', length: '29"', shoulder: '16"', sleeve: '8"' }
      ]
    },
    careInstructions: [
      'Machine wash cold with like colors',
      'Tumble dry low',
      'Do not bleach',
      'Cool iron if needed',
      'Do not dry clean'
    ],
    features: [
      'Slim fit',
      'Longer body length',
      'Curved bottom hem',
      'Shoulder-to-shoulder taping',
      'Side-seamed construction'
    ],
    printableAreas: [
      { name: 'Front', maxWidth: 10, maxHeight: 12, enabled: true },
      { name: 'Back', maxWidth: 10, maxHeight: 12, enabled: true }
    ],
    tags: ['womens', 'v-neck', 't-shirt', 'casual', 'soft'],
    metaTitle: 'Women\'s V-Neck T-Shirt - Soft & Flattering',
    metaDescription: 'Ultra-soft v-neck t-shirt with flattering fit. Perfect for custom designs and everyday wear.',
    status: 'active',
    featured: false
  },
  {
    name: 'Kids\' Crew Neck T-Shirt',
    sku: 'TSH-003',
    subcategory: 'Kids',
    shortDescription: 'Durable and comfortable kids\' t-shirt',
    description: '<p>Perfect for active kids! This <strong>crew neck t-shirt</strong> is made from soft, durable cotton that can handle playtime.</p><ul><li>100% preshrunk cotton</li><li>Ribbed crew neck</li><li>Double-needle stitching</li><li>Tear-away label</li></ul>',
    basePrice: 15.00,
    price: 25.00,
    material: '100% Preshrunk Cotton',
    weight: '165 GSM',
    fit: 'Regular Fit',
    sizes: [
      { size: 'XS', stockQuantity: 40, enabled: true },
      { size: 'S', stockQuantity: 50, enabled: true },
      { size: 'M', stockQuantity: 55, enabled: true },
      { size: 'L', stockQuantity: 45, enabled: true },
      { size: 'XL', stockQuantity: 35, enabled: true }
    ],
    colors: [
      { name: 'White', hexCode: '#FFFFFF', stockQuantity: 80, enabled: true },
      { name: 'Red', hexCode: '#FF0000', stockQuantity: 70, enabled: true },
      { name: 'Royal Blue', hexCode: '#4169E1', stockQuantity: 65, enabled: true },
      { name: 'Kelly Green', hexCode: '#4CBB17', stockQuantity: 55, enabled: true }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503919436801-6c3b5b6d0525?w=800',
        alt: 'Kids\' Crew Neck T-Shirt',
        isPrimary: true,
        sortOrder: 0
      }
    ],
    sizeChart: {
      measurements: [
        { size: 'XS', chest: '26-28"', length: '19"', shoulder: '12"', sleeve: '5"' },
        { size: 'S', chest: '28-30"', length: '21"', shoulder: '13"', sleeve: '5.5"' },
        { size: 'M', chest: '30-32"', length: '23"', shoulder: '14"', sleeve: '6"' },
        { size: 'L', chest: '32-34"', length: '25"', shoulder: '15"', sleeve: '6.5"' },
        { size: 'XL', chest: '34-36"', length: '27"', shoulder: '16"', sleeve: '7"' }
      ]
    },
    careInstructions: [
      'Machine wash cold',
      'Tumble dry medium',
      'Do not bleach',
      'Warm iron if needed',
      'Do not dry clean'
    ],
    features: [
      'Preshrunk for minimal shrinkage',
      'Double-needle stitching throughout',
      'Ribbed crew neck',
      'Tear-away label',
      'Durable construction'
    ],
    printableAreas: [
      { name: 'Front', maxWidth: 9, maxHeight: 11, enabled: true },
      { name: 'Back', maxWidth: 9, maxHeight: 11, enabled: true }
    ],
    tags: ['kids', 't-shirt', 'children', 'cotton', 'durable'],
    metaTitle: 'Kids\' Crew Neck T-Shirt - Durable & Comfortable',
    metaDescription: 'High-quality kids\' t-shirt built for playtime. Soft, durable cotton perfect for custom printing.',
    status: 'active',
    featured: false
  },
  {
    name: 'Zip-Up Hoodie',
    sku: 'HOD-002',
    subcategory: 'Unisex',
    shortDescription: 'Versatile full-zip hoodie with pockets',
    description: '<p>Layer up with our <strong>full-zip hoodie</strong>. Features a durable metal zipper and cozy fleece interior.</p><ul><li>50% Cotton, 50% Polyester</li><li>Unlined hood with drawcord</li><li>Front pockets</li><li>YKK metal zipper</li></ul>',
    basePrice: 38.00,
    price: 58.00,
    material: '50% Cotton, 50% Polyester',
    weight: '280 GSM',
    fit: 'Regular Fit',
    sizes: [
      { size: 'S', stockQuantity: 25, enabled: true },
      { size: 'M', stockQuantity: 40, enabled: true },
      { size: 'L', stockQuantity: 35, enabled: true },
      { size: 'XL', stockQuantity: 30, enabled: true },
      { size: 'XXL', stockQuantity: 20, enabled: true }
    ],
    colors: [
      { name: 'Black', hexCode: '#000000', stockQuantity: 60, enabled: true },
      { name: 'Charcoal', hexCode: '#36454F', stockQuantity: 50, enabled: true },
      { name: 'Navy', hexCode: '#000080', stockQuantity: 40, enabled: true }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
        alt: 'Zip-Up Hoodie',
        isPrimary: true,
        sortOrder: 0
      }
    ],
    sizeChart: {
      measurements: [
        { size: 'S', chest: '38-40"', length: '26"', shoulder: '17"', sleeve: '33"' },
        { size: 'M', chest: '42-44"', length: '27"', shoulder: '18.5"', sleeve: '34"' },
        { size: 'L', chest: '46-48"', length: '28"', shoulder: '20"', sleeve: '35"' },
        { size: 'XL', chest: '50-52"', length: '29"', shoulder: '21.5"', sleeve: '36"' },
        { size: 'XXL', chest: '54-56"', length: '30"', shoulder: '23"', sleeve: '37"' }
      ]
    },
    careInstructions: [
      'Machine wash cold inside out',
      'Tumble dry low',
      'Do not bleach',
      'Do not iron zipper',
      'Do not dry clean'
    ],
    features: [
      'Metal zipper',
      'Unlined hood with drawcord',
      'Front pockets',
      'Ribbed cuffs and waistband',
      'Brushed fleece interior'
    ],
    printableAreas: [
      { name: 'Front', maxWidth: 5, maxHeight: 7, enabled: true },
      { name: 'Back', maxWidth: 13, maxHeight: 18, enabled: true }
    ],
    tags: ['hoodie', 'zip-up', 'jacket', 'casual', 'fleece'],
    metaTitle: 'Full Zip-Up Hoodie - Comfortable Layering',
    metaDescription: 'Versatile zip-up hoodie with fleece interior. Perfect for layering and custom designs.',
    status: 'active',
    featured: false
  }
];

async function seedProducts() {
  try {
    // Get all categories
    const categories = await Category.find();
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found. Please run category seeder first.');
      console.log('Creating a default category...');
      
      const defaultCategory = await Category.create({
        name: 'T-Shirts',
        description: 'Classic t-shirts for everyday wear',
        slug: 't-shirts'
      });
      
      categories.push(defaultCategory);
    }

    console.log(`Found ${categories.length} categories`);
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Assign categories to products
    const productsWithCategories = productsData.map((product, index) => {
      // Assign category based on product type
      let category;
      if (product.sku.startsWith('TSH')) {
        category = categories.find(c => c.name.toLowerCase().includes('t-shirt')) || categories[0];
      } else if (product.sku.startsWith('HOD')) {
        category = categories.find(c => c.name.toLowerCase().includes('hoodie')) || categories[0];
      } else if (product.sku.startsWith('SHT')) {
        category = categories.find(c => c.name.toLowerCase().includes('shirt')) || categories[0];
      } else {
        category = categories[index % categories.length];
      }
      
      return {
        ...product,
        category: category._id
      };
    });

    // Create products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✓ Created ${createdProducts.length} products`);
    
    // Display summary
    console.log('\n📦 Products Created:');
    createdProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.sku})`);
      console.log(`    Status: ${product.status}, Featured: ${product.featured}`);
      console.log(`    Sizes: ${product.sizes.length}, Colors: ${product.colors.length}`);
      console.log(`    Total Stock: ${product.sizes.reduce((sum, s) => sum + s.stockQuantity, 0)}`);
      console.log('');
    });

    console.log('✅ Product seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

// Run seeder
seedProducts();
