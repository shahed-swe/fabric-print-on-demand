const Product = require('../models/Product');
const Category = require('../models/Category');

// Helper function to transform image URLs to use backend API endpoint
const transformProductUrls = (product) => {
  if (!product) return product;
  
  const productObj = product.toObject ? product.toObject() : product;
  
  if (productObj.images && Array.isArray(productObj.images)) {
    productObj.images = productObj.images.map(img => {
      if (img.url) {
        // Extract filename from URL (handles both old /uploads/ and new /api/files/ formats)
        let filename = img.url;
        if (filename.includes('/uploads/')) {
          filename = filename.split('/uploads/')[1];
        } else if (filename.includes('/api/files/')) {
          filename = filename.split('/api/files/')[1];
        }
        // Ensure we use the backend API endpoint
        img.url = `${process.env.UPLOAD_API_URL || 'http://localhost:5001'}/api/files/${filename}`;
      }
      return img;
    });
  }
  
  return productObj;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { 
      subcategory, 
      status, 
      featured,
      search,
      page = 1,
      limit = 20,
      sortBy = 'newest',
      minPrice,
      maxPrice,
      category
    } = req.query;

    // Build query
    const query = {};
    
    if (subcategory) query.subcategory = subcategory;
    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured === 'true';
    if (category) query.category = category;
    
    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Search by name, SKU, or tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Determine sort order
    let sortOption = {};
    switch (sortBy) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'name-asc':
        sortOption = { name: 1 };
        break;
      case 'name-desc':
        sortOption = { name: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('customStyle', 'title price')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    // Transform URLs to use backend API endpoint
    const transformedProducts = products.map(transformProductUrls);

    res.json({
      products: transformedProducts,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('customStyle', 'title price frontImage backImage');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(transformProductUrls(product));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.price) {
      return res.status(400).json({ 
        message: 'Name and price are required' 
      });
    }

    // Check if SKU already exists
    if (productData.sku) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (existingProduct) {
        return res.status(400).json({ 
          message: 'Product with this SKU already exists' 
        });
      }
    }

    // Verify category exists
    if (productData.category) {
      const categoryExists = await Category.findById(productData.category);
      if (!categoryExists) {
        return res.status(400).json({ 
          message: 'Category not found' 
        });
      }
    }

    const product = await Product.create(productData);
    
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('customStyle', 'title price frontImage backImage');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Error creating product', 
      error: error.message 
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if SKU is being changed and if new SKU already exists
    if (productData.sku && productData.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (existingProduct) {
        return res.status(400).json({ 
          message: 'Product with this SKU already exists' 
        });
      }
    }

    // Verify category exists if being changed
    if (productData.category && productData.category !== product.category?.toString()) {
      const categoryExists = await Category.findById(productData.category);
      if (!categoryExists) {
        return res.status(400).json({ 
          message: 'Category not found' 
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug')
    .populate('customStyle', 'title price frontImage backImage');

    res.json(transformProductUrls(updatedProduct));
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Error updating product', 
      error: error.message 
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Error deleting product', 
      error: error.message 
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      subcategory, 
      search,
      sortBy = 'newest',
      minPrice,
      maxPrice
    } = req.query;
    
    let categoryObjectId;
    
    // Check if categoryId is a valid ObjectId format (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(categoryId)) {
      categoryObjectId = categoryId;
    } else {
      // It's a slug, lookup category first
      const category = await Category.findOne({ slug: categoryId });
      if (!category) {
        return res.status(404).json({ 
          message: 'Category not found',
          products: [],
          totalPages: 0,
          currentPage: page,
          total: 0
        });
      }
      categoryObjectId = category._id;
    }

    // Build query
    const query = {
      category: categoryObjectId,
      status: 'active'
    };

    if (subcategory) query.subcategory = subcategory;
    
    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Search by name, SKU, or tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Determine sort order
    let sortOption = {};
    switch (sortBy) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'name-asc':
        sortOption = { name: 1 };
        break;
      case 'name-desc':
        sortOption = { name: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug description')
      .populate('customStyle', 'title price frontImage backImage')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
exports.updateProductStock = async (req, res) => {
  try {
    const { sizes, colors } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (sizes) {
      product.sizes = sizes;
    }
    
    if (colors) {
      product.colors = colors;
    }

    await product.save();
    
    res.json(transformProductUrls(product));
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ 
      message: 'Error updating stock', 
      error: error.message 
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      featured: true,
      status: 'active'
    })
      .populate('category', 'name slug')
      .populate('customStyle', 'title price frontImage backImage')
      .limit(10);

    // Transform URLs to use backend API endpoint
    const transformedProducts = products.map(transformProductUrls);

    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
