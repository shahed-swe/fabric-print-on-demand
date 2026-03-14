const Color = require('../models/Color');

// @desc    Get all colors
// @route   GET /api/colors
// @access  Public
exports.getColors = async (req, res) => {
  try {
    const { sortBy = 'sortOrder' } = req.query;
    
    let sort = {};
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'name') {
      sort = { name: 1 };
    } else {
      sort = { sortOrder: 1, createdAt: -1 };
    }

    // Only fetch active colors for public API
    const colors = await Color.find({ active: true }).sort(sort);
    res.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({ message: 'Error fetching colors', error: error.message });
  }
};

// @desc    Get all colors for admin (with pagination)
// @route   GET /admin/colors
// @access  Private/Admin
exports.getColorsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'sortOrder' } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { hexCode: { $regex: search, $options: 'i' } }
      ];
    }

    let sort = {};
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'name') {
      sort = { name: 1 };
    } else {
      sort = { sortOrder: 1, createdAt: -1 };
    }

    const total = await Color.countDocuments(query);
    const colors = await Color.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      colors,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({ message: 'Error fetching colors', error: error.message });
  }
};

// @desc    Get single color
// @route   GET /api/colors/:id
// @access  Public
exports.getColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    res.json(color);
  } catch (error) {
    console.error('Error fetching color:', error);
    res.status(500).json({ message: 'Error fetching color', error: error.message });
  }
};

// @desc    Create color
// @route   POST /admin/colors
// @access  Private/Admin
exports.createColor = async (req, res) => {
  try {
    const { name, hexCode, displayName, description, sortOrder } = req.body;

    if (!name || !hexCode || !displayName) {
      return res.status(400).json({ 
        message: 'Name, hex code, and display name are required' 
      });
    }

    // Check if color with same hex code already exists
    const existingColor = await Color.findOne({ hexCode: hexCode.toLowerCase() });
    if (existingColor) {
      return res.status(400).json({ 
        message: 'Color with this hex code already exists' 
      });
    }

    const color = await Color.create({
      name,
      hexCode: hexCode.toLowerCase(),
      displayName,
      description: description || '',
      sortOrder: sortOrder || 0,
      active: true
    });

    res.status(201).json(color);
  } catch (error) {
    console.error('Error creating color:', error);
    res.status(500).json({ 
      message: 'Error creating color', 
      error: error.message 
    });
  }
};

// @desc    Update color
// @route   PUT /admin/colors/:id
// @access  Private/Admin
exports.updateColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    const { name, hexCode, displayName, description, sortOrder, active } = req.body;

    // Check if new hex code is already used by another color
    if (hexCode && hexCode.toLowerCase() !== color.hexCode) {
      const existingColor = await Color.findOne({ hexCode: hexCode.toLowerCase() });
      if (existingColor) {
        return res.status(400).json({ 
          message: 'Color with this hex code already exists' 
        });
      }
    }

    const updatedColor = await Color.findByIdAndUpdate(
      req.params.id,
      {
        name: name || color.name,
        hexCode: hexCode ? hexCode.toLowerCase() : color.hexCode,
        displayName: displayName || color.displayName,
        description: description !== undefined ? description : color.description,
        sortOrder: sortOrder !== undefined ? sortOrder : color.sortOrder,
        active: active !== undefined ? active : color.active,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedColor);
  } catch (error) {
    console.error('Error updating color:', error);
    res.status(500).json({ 
      message: 'Error updating color', 
      error: error.message 
    });
  }
};

// @desc    Delete color
// @route   DELETE /admin/colors/:id
// @access  Private/Admin
exports.deleteColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    await Color.findByIdAndDelete(req.params.id);
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    console.error('Error deleting color:', error);
    res.status(500).json({ 
      message: 'Error deleting color', 
      error: error.message 
    });
  }
};

// @desc    Bulk toggle active status
// @route   PATCH /admin/colors/bulk/toggle-active
// @access  Private/Admin
exports.toggleColorActiveBulk = async (req, res) => {
  try {
    const { ids, active } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    await Color.updateMany(
      { _id: { $in: ids } },
      { active, updatedAt: Date.now() }
    );

    res.json({ message: `${ids.length} colors updated successfully` });
  } catch (error) {
    console.error('Error toggling colors:', error);
    res.status(500).json({ 
      message: 'Error toggling colors', 
      error: error.message 
    });
  }
};
