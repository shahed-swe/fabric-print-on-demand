const Design = require('../models/Design');
const Cart = require('../models/Cart');

// @desc    Save design and add to cart
// @route   POST /api/designs
// @access  Public
exports.saveDesign = async (req, res) => {
  try {
    const { fileId, sizeQuantities, title, price, userId } = req.body;
    console.log('Received design data:', req.body);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Create the design
    const design = await Design.create({
      userId,
      fileId,
      sizeQuantities,
      title,
      price
    });

    // Add design to cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Add design to cart as a cart item
    cart.items.push({
      designId: design._id,
      quantity: 1,
      price: price,
      itemType: 'design'
    });

    await cart.save();

    res.status(201).json({ 
      design,
      message: 'Design saved and added to cart successfully'
    });
  } catch (error) {
    console.error('Save design error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get designs for a user
// @route   GET /api/designs
// @access  Public
exports.getDesigns = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const designs = await Design.find({ userId });
    res.json(designs);
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ message: error.message });
  }
};
