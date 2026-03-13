const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategory: {
    type: String,
    enum: ['Men\'s', 'Women\'s', 'Unisex', 'Kids'],
    default: 'Unisex'
  },
  
  // Description (Rich Text)
  description: String, // Rich HTML content
  shortDescription: String, // Plain text for listings
  
  // Pricing
  basePrice: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  
  // Size & Variants
  sizes: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    },
    stockQuantity: {
      type: Number,
      default: 0
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  
  // Colors
  colors: [{
    name: String,
    hexCode: String,
    stockQuantity: {
      type: Number,
      default: 0
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  
  // Material & Specifications
  material: String, // "100% Cotton", "65% Polyester 35% Cotton"
  weight: String, // "180 GSM"
  fit: {
    type: String,
    enum: ['Regular Fit', 'Slim Fit', 'Oversized', 'Relaxed Fit']
  },
  
  // Images (MULTIPLE)
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Legacy field for backward compatibility
  imageUrl: String,
  
  // Custom Logo & Image
  logo: {
    fileId: String, // MinIO file ID
    url: String,
    filename: String
  },
  customImage: {
    fileId: String, // MinIO file ID
    url: String,
    filename: String
  },
  haveCustomPrint: {
    type: Boolean,
    default: false
  },
  
  // Custom Style for Print-on-Demand
  customStyle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomStyle'
  },
  
  // Size Chart
  sizeChart: {
    measurements: [{
      size: String,
      chest: String,
      length: String,
      shoulder: String,
      sleeve: String
    }]
  },
  
  // Care Instructions
  careInstructions: [String],
  
  // Product Features
  features: [String],
  
  // Print-on-Demand Specific
  printableAreas: [{
    name: {
      type: String,
      enum: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve']
    },
    maxWidth: Number,
    maxHeight: Number,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  
  // SEO & Tags
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  
  // Stock (legacy)
  stockQuantity: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Legacy customization options
  customizationOptions: [{
    name: String,
    type: String,
    required: Boolean,
    options: [String]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
