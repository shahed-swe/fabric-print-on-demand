const CustomStyle = require('../models/CustomStyle');

// Get all custom styles
exports.getCustomStyles = async (req, res) => {
  try {
    const { sortBy = 'sortOrder' } = req.query;
    
    let sort = {};
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'price-asc') {
      sort = { price: 1 };
    } else if (sortBy === 'price-desc') {
      sort = { price: -1 };
    } else {
      sort = { sortOrder: 1, createdAt: -1 };
    }

    // Only fetch active styles for public API
    const customStyles = await CustomStyle.find({ active: true }).sort(sort);
    res.json(customStyles);
  } catch (error) {
    console.error('Error fetching custom styles:', error);
    res.status(500).json({ message: 'Error fetching custom styles', error: error.message });
  }
};

// Get all custom styles for admin (with pagination)
exports.getCustomStylesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'sortOrder' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let sort = {};
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'price-asc') {
      sort = { price: 1 };
    } else if (sortBy === 'price-desc') {
      sort = { price: -1 };
    } else {
      sort = { sortOrder: 1, createdAt: -1 };
    }

    const total = await CustomStyle.countDocuments(query);
    const customStyles = await CustomStyle.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      customStyles,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching custom styles:', error);
    res.status(500).json({ message: 'Error fetching custom styles', error: error.message });
  }
};

// Get single custom style
exports.getCustomStyle = async (req, res) => {
  try {
    const customStyle = await CustomStyle.findById(req.params.id);
    if (!customStyle) {
      return res.status(404).json({ message: 'Custom style not found' });
    }
    res.json(customStyle);
  } catch (error) {
    console.error('Error fetching custom style:', error);
    res.status(500).json({ message: 'Error fetching custom style', error: error.message });
  }
};

// Create custom style
exports.createCustomStyle = async (req, res) => {
  try {
    const { title, description, price, frontImage, backImage, sortOrder } = req.body;

    if (!title || !price || !frontImage || !backImage) {
      return res.status(400).json({ message: 'Missing required fields: title, price, frontImage, backImage' });
    }

    const customStyle = new CustomStyle({
      title,
      description: description || '',
      price,
      frontImage,
      backImage,
      sortOrder: sortOrder || 0,
      active: true
    });

    await customStyle.save();
    res.status(201).json({ message: 'Custom style created successfully', customStyle });
  } catch (error) {
    console.error('Error creating custom style:', error);
    res.status(500).json({ message: 'Error creating custom style', error: error.message });
  }
};

// Update custom style
exports.updateCustomStyle = async (req, res) => {
  try {
    const { title, description, price, frontImage, backImage, active, sortOrder } = req.body;

    const customStyle = await CustomStyle.findById(req.params.id);
    if (!customStyle) {
      return res.status(404).json({ message: 'Custom style not found' });
    }

    if (title !== undefined) customStyle.title = title;
    if (description !== undefined) customStyle.description = description;
    if (price !== undefined) customStyle.price = price;
    if (frontImage !== undefined) customStyle.frontImage = frontImage;
    if (backImage !== undefined) customStyle.backImage = backImage;
    if (active !== undefined) customStyle.active = active;
    if (sortOrder !== undefined) customStyle.sortOrder = sortOrder;

    await customStyle.save();
    res.json({ message: 'Custom style updated successfully', customStyle });
  } catch (error) {
    console.error('Error updating custom style:', error);
    res.status(500).json({ message: 'Error updating custom style', error: error.message });
  }
};

// Delete custom style
exports.deleteCustomStyle = async (req, res) => {
  try {
    const customStyle = await CustomStyle.findByIdAndDelete(req.params.id);
    if (!customStyle) {
      return res.status(404).json({ message: 'Custom style not found' });
    }
    res.json({ message: 'Custom style deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom style:', error);
    res.status(500).json({ message: 'Error deleting custom style', error: error.message });
  }
};
