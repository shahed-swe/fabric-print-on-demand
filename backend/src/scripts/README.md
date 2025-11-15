# Database Seeders

This directory contains scripts to populate the database with sample data for development and testing.

## Available Seeders

### 1. Category Seeder (`categorySeeder.js`)
Seeds the database with product categories:
- T-Shirts
- Hoodies
- Long Sleeve Shirts
- Tank Tops
- Polo Shirts
- Sweatshirts

### 2. Product Seeder (`productSeeder.js`)
Seeds the database with sample products including:
- Classic Cotton T-Shirt (Unisex)
- Premium Pullover Hoodie (Unisex)
- Long Sleeve Performance Shirt (Men's)
- Women's V-Neck Tee
- Kids' Crew Neck T-Shirt
- Zip-Up Hoodie (Unisex)

Each product includes:
- Complete size variants (XS-XXXL)
- Multiple color options with stock quantities
- Multiple product images
- Detailed size chart measurements
- Care instructions
- Product features
- Printable areas configuration
- SEO metadata
- Rich text descriptions

### 3. Seed All (`seedAll.js`)
Runs both category and product seeders in sequence.

## Usage

From the backend directory:

```bash
# Seed only categories
npm run seed:categories

# Seed only products (requires categories to exist)
npm run seed:products

# Seed everything (recommended)
npm run seed:all
```

## Important Notes

⚠️ **Warning**: These seeders will **DELETE ALL EXISTING DATA** in the respective collections before seeding.

- `seed:categories` - Deletes all categories
- `seed:products` - Deletes all products
- `seed:all` - Deletes all categories and products

## Product Data Structure

Each seeded product includes:

### Basic Information
- Name, SKU, Category, Subcategory
- Short and long (HTML) descriptions
- Base price and selling price
- Material, weight, fit type

### Variants
- **Sizes**: S, M, L, XL, XXL with individual stock quantities
- **Colors**: Multiple colors with hex codes and stock per color

### Images
- Multiple product images
- Primary image flag
- Sort order for display

### Size Chart
Detailed measurements for each size:
- Chest width
- Length
- Shoulder width
- Sleeve length

### Care & Features
- Care instructions (washing, drying, ironing)
- Product features (construction, materials, special details)

### Print Configuration
- Printable areas (Front, Back, Sleeves)
- Maximum print dimensions for each area
- Enable/disable per area

### SEO
- Meta title
- Meta description
- Tags for search

## Example Output

```
🌱 Starting database seeding...

📁 Seeding Categories...
✓ Created 6 categories

📦 Seeding Products...
✓ Created 5 products

📊 SEEDING SUMMARY
══════════════════════════════════════════════════
Categories: 6
Products: 5
══════════════════════════════════════════════════

📁 Categories:
  - T-Shirts (3 products)
  - Hoodies (1 products)
  - Long Sleeve Shirts (1 products)
  ...

📦 Products:
  - Classic Cotton T-Shirt (TSH-001)
    Price: $30, Stock: 250, Status: active
  - Premium Pullover Hoodie (HOD-001)
    Price: $55, Stock: 180, Status: active
  ...

✅ Database seeding completed successfully!
```

## Environment Variables

Make sure your `.env` file is configured with:
```
MONGODB_URI=mongodb://localhost:27017/fabric-print-on-demand
```

## Troubleshooting

**Error: "No categories found"**
- Run `npm run seed:categories` first, then `npm run seed:products`
- Or use `npm run seed:all` to seed everything at once

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check your MONGODB_URI in .env file
- Verify database access permissions
