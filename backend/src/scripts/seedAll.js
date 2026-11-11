const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected for database seeding...'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Category data
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

async function seedAll() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // ============ SEED CATEGORIES ============
    console.log('📁 Seeding Categories...');
    await Category.deleteMany({});
    const categories = await Category.insertMany(categoriesData);
    console.log(`✓ Created ${categories.length} categories\n`);

    // Get specific categories for product assignment
    const tshirtCategory = categories.find(c => c.slug === 't-shirts');
    const hoodieCategory = categories.find(c => c.slug === 'hoodies');
    const longSleeveCategory = categories.find(c => c.slug === 'long-sleeve-shirts');

    // ============ SEED PRODUCTS ============
    console.log('📦 Seeding Products...');
    await Product.deleteMany({});

    const productsData = [
      {
        name: 'Classic Cotton T-Shirt',
        sku: 'TSH-001',
        category: tshirtCategory._id,
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
        category: hoodieCategory._id,
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
        category: longSleeveCategory._id,
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
        category: tshirtCategory._id,
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
        category: tshirtCategory._id,
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
        category: hoodieCategory._id,
        subcategory: 'Unisex',
        shortDescription: 'Full-zip hoodie with dual pockets',
        description: '<p>Versatile <strong>zip-up hoodie</strong> perfect for layering. Features full front zipper and dual side pockets.</p><ul><li>50% Cotton, 50% Polyester fleece</li><li>YKK metal zipper</li><li>Two front pockets</li><li>Dyed-to-match drawcords</li></ul>',
        basePrice: 38.00,
        price: 58.00,
        material: '50% Cotton, 50% Polyester',
        weight: '300 GSM',
        fit: 'Regular Fit',
        sizes: [
          { size: 'S', stockQuantity: 35, enabled: true },
          { size: 'M', stockQuantity: 55, enabled: true },
          { size: 'L', stockQuantity: 50, enabled: true },
          { size: 'XL', stockQuantity: 40, enabled: true },
          { size: 'XXL', stockQuantity: 25, enabled: true }
        ],
        colors: [
          { name: 'Black', hexCode: '#000000', stockQuantity: 85, enabled: true },
          { name: 'Heather Gray', hexCode: '#D3D3D3', stockQuantity: 75, enabled: true },
          { name: 'Navy', hexCode: '#000080', stockQuantity: 65, enabled: true },
          { name: 'Maroon', hexCode: '#800000', stockQuantity: 50, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
            alt: 'Zip-Up Hoodie - Front View',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '40-42"', length: '27"', shoulder: '17.5"', sleeve: '34"' },
            { size: 'M', chest: '44-46"', length: '28"', shoulder: '19"', sleeve: '35"' },
            { size: 'L', chest: '48-50"', length: '29"', shoulder: '20.5"', sleeve: '36"' },
            { size: 'XL', chest: '52-54"', length: '30"', shoulder: '22"', sleeve: '37"' },
            { size: 'XXL', chest: '56-58"', length: '31"', shoulder: '23.5"', sleeve: '38"' }
          ]
        },
        careInstructions: [
          'Machine wash cold inside out',
          'Tumble dry low',
          'Do not bleach',
          'Cool iron if needed',
          'Do not dry clean'
        ],
        features: [
          'Full front YKK zipper',
          'Unlined hood with matching drawcord',
          'Split front pouch pockets',
          '1x1 athletic rib knit cuffs',
          'Air jet yarn for softer feel'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 4, maxHeight: 4, enabled: true },
          { name: 'Back', maxWidth: 13, maxHeight: 18, enabled: true }
        ],
        tags: ['hoodie', 'zip-up', 'casual', 'layering', 'fleece'],
        metaTitle: 'Full Zip-Up Hoodie - Comfortable & Versatile',
        metaDescription: 'Premium zip-up hoodie with fleece interior. Perfect for custom printing and everyday wear.',
        status: 'active',
        featured: true
      },
      {
        name: 'Tank Top',
        sku: 'TSH-004',
        category: tshirtCategory._id,
        subcategory: 'Unisex',
        shortDescription: 'Lightweight athletic tank top',
        description: '<p>Stay cool with this <strong>athletic tank top</strong>. Perfect for workouts and summer wear.</p><ul><li>100% combed ringspun cotton</li><li>Athletic fit</li><li>Curved bottom hem</li><li>Side-seamed</li></ul>',
        basePrice: 16.00,
        price: 26.00,
        material: '100% Combed Ringspun Cotton',
        weight: '135 GSM',
        fit: 'Slim Fit',
        sizes: [
          { size: 'S', stockQuantity: 45, enabled: true },
          { size: 'M', stockQuantity: 60, enabled: true },
          { size: 'L', stockQuantity: 50, enabled: true },
          { size: 'XL', stockQuantity: 35, enabled: true }
        ],
        colors: [
          { name: 'White', hexCode: '#FFFFFF', stockQuantity: 70, enabled: true },
          { name: 'Black', hexCode: '#000000', stockQuantity: 65, enabled: true },
          { name: 'Gray', hexCode: '#808080', stockQuantity: 55, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800',
            alt: 'Athletic Tank Top',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '34-36"', length: '27"', shoulder: '9"' },
            { size: 'M', chest: '38-40"', length: '28"', shoulder: '10"' },
            { size: 'L', chest: '42-44"', length: '29"', shoulder: '11"' },
            { size: 'XL', chest: '46-48"', length: '30"', shoulder: '12"' }
          ]
        },
        careInstructions: [
          'Machine wash cold',
          'Tumble dry low',
          'Do not bleach',
          'Low iron if needed',
          'Do not dry clean'
        ],
        features: [
          'Athletic ribbed binding',
          'Curved bottom hem',
          'Side-seamed construction',
          'Tear-away label',
          'Preshrunk fabric'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 11, maxHeight: 14, enabled: true },
          { name: 'Back', maxWidth: 11, maxHeight: 14, enabled: true }
        ],
        tags: ['tank-top', 'athletic', 'summer', 'workout', 'sleeveless'],
        metaTitle: 'Athletic Tank Top - Lightweight & Comfortable',
        metaDescription: 'Lightweight cotton tank top perfect for workouts and summer. Great for custom printing.',
        status: 'active',
        featured: false
      },
      {
        name: 'Crewneck Sweatshirt',
        sku: 'SWT-001',
        category: categories.find(c => c.slug === 'sweatshirts')._id,
        subcategory: 'Unisex',
        shortDescription: 'Classic fleece crewneck sweatshirt',
        description: '<p>Timeless <strong>crewneck sweatshirt</strong> with soft fleece interior. A wardrobe essential.</p><ul><li>50% Cotton, 50% Polyester</li><li>Pill-resistant fleece</li><li>Ribbed collar, cuffs, and waistband</li><li>Set-in sleeves</li></ul>',
        basePrice: 28.00,
        price: 45.00,
        material: '50% Cotton, 50% Polyester',
        weight: '271 GSM',
        fit: 'Regular Fit',
        sizes: [
          { size: 'S', stockQuantity: 40, enabled: true },
          { size: 'M', stockQuantity: 65, enabled: true },
          { size: 'L', stockQuantity: 60, enabled: true },
          { size: 'XL', stockQuantity: 45, enabled: true },
          { size: 'XXL', stockQuantity: 30, enabled: true }
        ],
        colors: [
          { name: 'Black', hexCode: '#000000', stockQuantity: 95, enabled: true },
          { name: 'Navy', hexCode: '#000080', stockQuantity: 80, enabled: true },
          { name: 'Ash Gray', hexCode: '#B2BEB5', stockQuantity: 70, enabled: true },
          { name: 'Forest Green', hexCode: '#228B22', stockQuantity: 55, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
            alt: 'Crewneck Sweatshirt',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '38-40"', length: '27"', shoulder: '17"', sleeve: '33"' },
            { size: 'M', chest: '42-44"', length: '28"', shoulder: '18.5"', sleeve: '34"' },
            { size: 'L', chest: '46-48"', length: '29"', shoulder: '20"', sleeve: '35"' },
            { size: 'XL', chest: '50-52"', length: '30"', shoulder: '21.5"', sleeve: '36"' },
            { size: 'XXL', chest: '54-56"', length: '31"', shoulder: '23"', sleeve: '37"' }
          ]
        },
        careInstructions: [
          'Machine wash cold',
          'Tumble dry low',
          'Do not bleach',
          'Cool iron if needed',
          'Do not dry clean'
        ],
        features: [
          'Air jet yarn for softer feel',
          'Double-needle stitching',
          'Set-in sleeves',
          '1x1 athletic rib knit collar',
          'Pill-resistant fleece'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 12, maxHeight: 16, enabled: true },
          { name: 'Back', maxWidth: 13, maxHeight: 18, enabled: true }
        ],
        tags: ['sweatshirt', 'crewneck', 'fleece', 'casual', 'warm'],
        metaTitle: 'Crewneck Sweatshirt - Classic & Comfortable',
        metaDescription: 'Classic fleece crewneck sweatshirt. Perfect for custom designs and everyday comfort.',
        status: 'active',
        featured: true
      },
      {
        name: 'Polo Shirt',
        sku: 'SHT-002',
        category: longSleeveCategory._id,
        subcategory: 'Men\'s',
        shortDescription: 'Classic cotton pique polo shirt',
        description: '<p>Professional <strong>polo shirt</strong> with timeless style. Features durable cotton pique fabric.</p><ul><li>100% Cotton pique</li><li>3-button placket</li><li>Ribbed collar and cuffs</li><li>Side vents</li></ul>',
        basePrice: 22.00,
        price: 35.00,
        material: '100% Cotton Pique',
        weight: '210 GSM',
        fit: 'Regular Fit',
        sizes: [
          { size: 'S', stockQuantity: 42, enabled: true },
          { size: 'M', stockQuantity: 58, enabled: true },
          { size: 'L', stockQuantity: 52, enabled: true },
          { size: 'XL', stockQuantity: 44, enabled: true },
          { size: 'XXL', stockQuantity: 28, enabled: true }
        ],
        colors: [
          { name: 'White', hexCode: '#FFFFFF', stockQuantity: 85, enabled: true },
          { name: 'Black', hexCode: '#000000', stockQuantity: 75, enabled: true },
          { name: 'Navy', hexCode: '#000080', stockQuantity: 70, enabled: true },
          { name: 'Red', hexCode: '#FF0000', stockQuantity: 45, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800',
            alt: 'Classic Polo Shirt',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '36-38"', length: '28"', shoulder: '16"', sleeve: '8"' },
            { size: 'M', chest: '40-42"', length: '29"', shoulder: '17.5"', sleeve: '8.5"' },
            { size: 'L', chest: '44-46"', length: '30"', shoulder: '19"', sleeve: '9"' },
            { size: 'XL', chest: '48-50"', length: '31"', shoulder: '20.5"', sleeve: '9.5"' },
            { size: 'XXL', chest: '52-54"', length: '32"', shoulder: '22"', sleeve: '10"' }
          ]
        },
        careInstructions: [
          'Machine wash cold',
          'Tumble dry low',
          'Do not bleach',
          'Medium iron',
          'Do not dry clean'
        ],
        features: [
          'Cotton pique fabric',
          '3-button clean-finished placket',
          'Ribbed collar and sleeve cuffs',
          'Side vents',
          'Double-needle bottom hem'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 4, maxHeight: 4, enabled: true },
          { name: 'Back', maxWidth: 12, maxHeight: 16, enabled: true }
        ],
        tags: ['polo', 'shirt', 'professional', 'cotton', 'casual'],
        metaTitle: 'Classic Polo Shirt - Professional & Comfortable',
        metaDescription: 'Premium cotton pique polo shirt. Perfect for business casual and custom embroidery.',
        status: 'active',
        featured: false
      },
      {
        name: 'Raglan Baseball Tee',
        sku: 'TSH-005',
        category: tshirtCategory._id,
        subcategory: 'Unisex',
        shortDescription: '3/4 sleeve raglan baseball t-shirt',
        description: '<p>Sporty <strong>raglan baseball tee</strong> with contrasting 3/4 length sleeves. Retro style meets modern comfort.</p><ul><li>100% Combed ringspun cotton</li><li>Contrasting raglan sleeves</li><li>3/4 sleeve length</li><li>Side-seamed</li></ul>',
        basePrice: 19.00,
        price: 32.00,
        material: '100% Combed Ringspun Cotton',
        weight: '155 GSM',
        fit: 'Regular Fit',
        sizes: [
          { size: 'S', stockQuantity: 38, enabled: true },
          { size: 'M', stockQuantity: 52, enabled: true },
          { size: 'L', stockQuantity: 48, enabled: true },
          { size: 'XL', stockQuantity: 36, enabled: true }
        ],
        colors: [
          { name: 'White/Black', hexCode: '#FFFFFF', stockQuantity: 60, enabled: true },
          { name: 'White/Navy', hexCode: '#FFFFFF', stockQuantity: 55, enabled: true },
          { name: 'White/Red', hexCode: '#FFFFFF', stockQuantity: 45, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
            alt: 'Raglan Baseball Tee',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '36-38"', length: '27"', shoulder: '15.5"', sleeve: '18"' },
            { size: 'M', chest: '40-42"', length: '28"', shoulder: '17"', sleeve: '19"' },
            { size: 'L', chest: '44-46"', length: '29"', shoulder: '18.5"', sleeve: '20"' },
            { size: 'XL', chest: '48-50"', length: '30"', shoulder: '20"', sleeve: '21"' }
          ]
        },
        careInstructions: [
          'Machine wash cold',
          'Tumble dry low',
          'Do not bleach',
          'Low iron if needed',
          'Do not dry clean'
        ],
        features: [
          'Contrasting raglan sleeves',
          '3/4 sleeve length',
          'Ribbed crew neck',
          'Side-seamed construction',
          'Tear-away label'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 11, maxHeight: 14, enabled: true },
          { name: 'Back', maxWidth: 11, maxHeight: 14, enabled: true }
        ],
        tags: ['raglan', 'baseball', 't-shirt', 'retro', '3/4-sleeve'],
        metaTitle: 'Raglan Baseball Tee - Sporty Retro Style',
        metaDescription: 'Classic 3/4 sleeve raglan tee with contrasting sleeves. Perfect for custom designs.',
        status: 'active',
        featured: false
      },
      {
        name: 'Heavyweight Hoodie',
        sku: 'HOD-003',
        category: hoodieCategory._id,
        subcategory: 'Unisex',
        shortDescription: 'Ultra-warm heavyweight hoodie',
        description: '<p>Premium <strong>heavyweight hoodie</strong> designed for maximum warmth. Triple-fleece construction.</p><ul><li>82% Cotton, 18% Polyester</li><li>12 oz heavyweight fleece</li><li>Triple-needle stitching</li><li>Thick drawcords</li></ul>',
        basePrice: 42.00,
        price: 65.00,
        material: '82% Cotton, 18% Polyester',
        weight: '400 GSM',
        fit: 'Oversized',
        sizes: [
          { size: 'S', stockQuantity: 25, enabled: true },
          { size: 'M', stockQuantity: 40, enabled: true },
          { size: 'L', stockQuantity: 45, enabled: true },
          { size: 'XL', stockQuantity: 35, enabled: true },
          { size: 'XXL', stockQuantity: 22, enabled: true }
        ],
        colors: [
          { name: 'Black', hexCode: '#000000', stockQuantity: 75, enabled: true },
          { name: 'Charcoal', hexCode: '#36454F', stockQuantity: 55, enabled: true },
          { name: 'Olive', hexCode: '#808000', stockQuantity: 42, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1620799140188-3b2a7f90efa3?w=800',
            alt: 'Heavyweight Hoodie',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '42-44"', length: '27"', shoulder: '18"', sleeve: '34"' },
            { size: 'M', chest: '46-48"', length: '28"', shoulder: '19.5"', sleeve: '35"' },
            { size: 'L', chest: '50-52"', length: '29"', shoulder: '21"', sleeve: '36"' },
            { size: 'XL', chest: '54-56"', length: '30"', shoulder: '22.5"', sleeve: '37"' },
            { size: 'XXL', chest: '58-60"', length: '31"', shoulder: '24"', sleeve: '38"' }
          ]
        },
        careInstructions: [
          'Machine wash cold inside out',
          'Tumble dry low',
          'Do not bleach',
          'Do not iron decorations',
          'Do not dry clean'
        ],
        features: [
          '12 oz heavyweight fleece',
          'Triple-needle stitching',
          'Thick round drawcords',
          'Front pouch pocket',
          'Ribbed cuffs and waistband'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 12, maxHeight: 16, enabled: true },
          { name: 'Back', maxWidth: 13, maxHeight: 18, enabled: true }
        ],
        tags: ['hoodie', 'heavyweight', 'warm', 'winter', 'premium'],
        metaTitle: 'Heavyweight Hoodie - Maximum Warmth & Comfort',
        metaDescription: 'Premium 12 oz heavyweight hoodie for cold weather. Built to last with triple-needle stitching.',
        status: 'active',
        featured: true
      },
      {
        name: 'Muscle Tank',
        sku: 'TSH-006',
        category: tshirtCategory._id,
        subcategory: 'Men\'s',
        shortDescription: 'Athletic muscle tank for workouts',
        description: '<p>Sleeveless <strong>muscle tank</strong> designed for gym performance. Deep armholes for maximum movement.</p><ul><li>100% Cotton</li><li>Deep armholes</li><li>Athletic fit</li><li>Side-seamed</li></ul>',
        basePrice: 14.00,
        price: 22.00,
        material: '100% Cotton',
        weight: '130 GSM',
        fit: 'Slim Fit',
        sizes: [
          { size: 'S', stockQuantity: 40, enabled: true },
          { size: 'M', stockQuantity: 55, enabled: true },
          { size: 'L', stockQuantity: 48, enabled: true },
          { size: 'XL', stockQuantity: 32, enabled: true }
        ],
        colors: [
          { name: 'Black', hexCode: '#000000', stockQuantity: 70, enabled: true },
          { name: 'White', hexCode: '#FFFFFF', stockQuantity: 60, enabled: true },
          { name: 'Heather Gray', hexCode: '#D3D3D3', stockQuantity: 45, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
            alt: 'Muscle Tank',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '34-36"', length: '26"' },
            { size: 'M', chest: '38-40"', length: '27"' },
            { size: 'L', chest: '42-44"', length: '28"' },
            { size: 'XL', chest: '46-48"', length: '29"' }
          ]
        },
        careInstructions: [
          'Machine wash cold',
          'Tumble dry low',
          'Do not bleach',
          'Cool iron if needed',
          'Do not dry clean'
        ],
        features: [
          'Deep armholes',
          'Athletic fit',
          'Side-seamed',
          'Ribbed collar',
          'Preshrunk cotton'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 10, maxHeight: 12, enabled: true },
          { name: 'Back', maxWidth: 10, maxHeight: 12, enabled: true }
        ],
        tags: ['tank', 'muscle', 'workout', 'gym', 'sleeveless'],
        metaTitle: 'Muscle Tank - Athletic Gym Wear',
        metaDescription: 'Athletic muscle tank for workouts. Deep armholes for unrestricted movement.',
        status: 'active',
        featured: false
      },
      {
        name: 'Organic Cotton Tee',
        sku: 'TSH-007',
        category: tshirtCategory._id,
        subcategory: 'Unisex',
        shortDescription: 'Eco-friendly organic cotton t-shirt',
        description: '<p>Sustainable <strong>organic cotton tee</strong> that\'s good for you and the planet. GOTS certified.</p><ul><li>100% Organic cotton</li><li>GOTS certified</li><li>Fair trade</li><li>Chemical-free dyes</li></ul>',
        basePrice: 24.00,
        price: 38.00,
        material: '100% Organic Cotton',
        weight: '175 GSM',
        fit: 'Relaxed Fit',
        sizes: [
          { size: 'S', stockQuantity: 32, enabled: true },
          { size: 'M', stockQuantity: 48, enabled: true },
          { size: 'L', stockQuantity: 42, enabled: true },
          { size: 'XL', stockQuantity: 28, enabled: true }
        ],
        colors: [
          { name: 'Natural', hexCode: '#F5F5DC', stockQuantity: 55, enabled: true },
          { name: 'Earth Brown', hexCode: '#8B4513', stockQuantity: 45, enabled: true },
          { name: 'Sage Green', hexCode: '#9DC183', stockQuantity: 38, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
            alt: 'Organic Cotton Tee',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '36-38"', length: '27"', shoulder: '16"', sleeve: '7.5"' },
            { size: 'M', chest: '40-42"', length: '28"', shoulder: '17.5"', sleeve: '8"' },
            { size: 'L', chest: '44-46"', length: '29"', shoulder: '19"', sleeve: '8.5"' },
            { size: 'XL', chest: '48-50"', length: '30"', shoulder: '20.5"', sleeve: '9"' }
          ]
        },
        careInstructions: [
          'Machine wash cold with like colors',
          'Tumble dry low',
          'Use eco-friendly detergent',
          'Low iron if needed',
          'Do not dry clean'
        ],
        features: [
          'GOTS certified organic cotton',
          'Fair trade manufactured',
          'Chemical-free dyes',
          'Sustainable production',
          'Relaxed comfortable fit'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 11, maxHeight: 14, enabled: true },
          { name: 'Back', maxWidth: 11, maxHeight: 14, enabled: true }
        ],
        tags: ['organic', 'eco-friendly', 'sustainable', 't-shirt', 'gots'],
        metaTitle: 'Organic Cotton T-Shirt - Sustainable & Eco-Friendly',
        metaDescription: 'GOTS certified organic cotton tee. Sustainable, fair trade, and perfect for conscious consumers.',
        status: 'active',
        featured: true
      },
      {
        name: 'Oversized Hoodie',
        sku: 'HOD-004',
        category: hoodieCategory._id,
        subcategory: 'Unisex',
        shortDescription: 'Trendy oversized fit hoodie',
        description: '<p>Fashion-forward <strong>oversized hoodie</strong> with relaxed streetwear style. Extra roomy and comfortable.</p><ul><li>80% Cotton, 20% Polyester</li><li>Oversized relaxed fit</li><li>Dropped shoulders</li><li>Extended length</li></ul>',
        basePrice: 36.00,
        price: 56.00,
        material: '80% Cotton, 20% Polyester',
        weight: '290 GSM',
        fit: 'Oversized',
        sizes: [
          { size: 'S', stockQuantity: 30, enabled: true },
          { size: 'M', stockQuantity: 48, enabled: true },
          { size: 'L', stockQuantity: 52, enabled: true },
          { size: 'XL', stockQuantity: 38, enabled: true }
        ],
        colors: [
          { name: 'Sand', hexCode: '#C2B280', stockQuantity: 65, enabled: true },
          { name: 'Black', hexCode: '#000000', stockQuantity: 72, enabled: true },
          { name: 'Washed Blue', hexCode: '#4682B4', stockQuantity: 48, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800',
            alt: 'Oversized Hoodie',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '44-46"', length: '28"', shoulder: '20"', sleeve: '35"' },
            { size: 'M', chest: '48-50"', length: '29"', shoulder: '21.5"', sleeve: '36"' },
            { size: 'L', chest: '52-54"', length: '30"', shoulder: '23"', sleeve: '37"' },
            { size: 'XL', chest: '56-58"', length: '31"', shoulder: '24.5"', sleeve: '38"' }
          ]
        },
        careInstructions: [
          'Machine wash cold',
          'Tumble dry low',
          'Do not bleach',
          'Cool iron reverse side',
          'Do not dry clean'
        ],
        features: [
          'Oversized relaxed fit',
          'Dropped shoulder design',
          'Extended body length',
          'Soft fleece interior',
          'Ribbed cuffs and hem'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 14, maxHeight: 18, enabled: true },
          { name: 'Back', maxWidth: 14, maxHeight: 20, enabled: true }
        ],
        tags: ['hoodie', 'oversized', 'streetwear', 'trendy', 'fashion'],
        metaTitle: 'Oversized Hoodie - Trendy Streetwear Style',
        metaDescription: 'Fashion-forward oversized hoodie with relaxed fit. Perfect for modern streetwear designs.',
        status: 'active',
        featured: false
      },
      {
        name: 'Ringer Tee',
        sku: 'TSH-008',
        category: tshirtCategory._id,
        subcategory: 'Unisex',
        shortDescription: 'Retro ringer t-shirt with contrast trim',
        description: '<p>Classic <strong>ringer tee</strong> with contrasting neck and sleeve trim. Vintage-inspired style.</p><ul><li>100% Cotton jersey</li><li>Contrast ringer neck</li><li>Contrast sleeve bands</li><li>Retro fit</li></ul>',
        basePrice: 18.00,
        price: 28.00,
        material: '100% Cotton Jersey',
        weight: '160 GSM',
        fit: 'Slim Fit',
        sizes: [
          { size: 'S', stockQuantity: 42, enabled: true },
          { size: 'M', stockQuantity: 56, enabled: true },
          { size: 'L', stockQuantity: 50, enabled: true },
          { size: 'XL', stockQuantity: 38, enabled: true }
        ],
        colors: [
          { name: 'White/Black', hexCode: '#FFFFFF', stockQuantity: 68, enabled: true },
          { name: 'White/Red', hexCode: '#FFFFFF', stockQuantity: 55, enabled: true },
          { name: 'Heather/Navy', hexCode: '#D3D3D3', stockQuantity: 48, enabled: true }
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800',
            alt: 'Ringer Tee',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        sizeChart: {
          measurements: [
            { size: 'S', chest: '34-36"', length: '27"', shoulder: '15"', sleeve: '7"' },
            { size: 'M', chest: '38-40"', length: '28"', shoulder: '16.5"', sleeve: '7.5"' },
            { size: 'L', chest: '42-44"', length: '29"', shoulder: '18"', sleeve: '8"' },
            { size: 'XL', chest: '46-48"', length: '30"', shoulder: '19.5"', sleeve: '8.5"' }
          ]
        },
        careInstructions: [
          'Machine wash cold',
          'Tumble dry low',
          'Do not bleach',
          'Low iron if needed',
          'Do not dry clean'
        ],
        features: [
          'Contrast ringer neckband',
          'Contrast sleeve bands',
          '100% cotton jersey',
          'Side-seamed',
          'Retro-inspired fit'
        ],
        printableAreas: [
          { name: 'Front', maxWidth: 10, maxHeight: 13, enabled: true },
          { name: 'Back', maxWidth: 10, maxHeight: 13, enabled: true }
        ],
        tags: ['ringer', 't-shirt', 'retro', 'vintage', 'contrast'],
        metaTitle: 'Ringer Tee - Retro Vintage Style',
        metaDescription: 'Classic ringer t-shirt with contrast trim. Vintage-inspired style perfect for retro designs.',
        status: 'active',
        featured: false
      }
    ];

    const products = await Product.insertMany(productsData);
    console.log(`✓ Created ${products.length} products\n`);

    // Display summary
    console.log('📊 SEEDING SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log('═'.repeat(50));
    
    console.log('\n📁 Categories:');
    categories.forEach(cat => {
      const productCount = products.filter(p => p.category.toString() === cat._id.toString()).length;
      console.log(`  - ${cat.name} (${productCount} products)`);
    });

    console.log('\n📦 Products:');
    products.forEach(product => {
      const totalStock = product.sizes.reduce((sum, s) => sum + s.stockQuantity, 0);
      console.log(`  - ${product.name} (${product.sku})`);
      console.log(`    Price: ৳${product.price}, Stock: ${totalStock}, Status: ${product.status}`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedAll();
