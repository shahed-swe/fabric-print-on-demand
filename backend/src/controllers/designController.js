const Design = require('../models/Design');
const Cart = require('../models/Cart');

// @desc    Save design and add to cart
// @route   POST /api/designs
// @access  Public
exports.saveDesign = async (req, res) => {
  try {
    const { fileId, sizeQuantities, title, price, userId, elements } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Calculate total quantity and correct price
    const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + Number(qty), 0);
    const DESIGN_PRICE = 30;
    const calculatedPrice = DESIGN_PRICE * totalQuantity;

    // Process elements if provided
    let processedElements = null;
    if (elements) {
      try {
        processedElements = {
          front: { texts: [], images: [] },
          back: { texts: [], images: [] }
        };

        // Process front elements
        if (elements.front) {
          // Copy text elements as-is
          processedElements.front.texts = elements.front.texts || [];
          
          // Process images - they should already have fileIds from upload
          if (elements.front.images && elements.front.images.length > 0) {
            processedElements.front.images = elements.front.images.map(img => ({
              fileId: img.fileId || img.src, // Use fileId if available, fallback to src
              left: img.left,
              top: img.top,
              scaleX: img.scaleX,
              scaleY: img.scaleY,
              angle: img.angle,
              width: img.width,
              height: img.height
            }));
          }
        }

        // Process back elements
        if (elements.back) {
          // Copy text elements as-is
          processedElements.back.texts = elements.back.texts || [];
          
          // Process images - they should already have fileIds from upload
          if (elements.back.images && elements.back.images.length > 0) {
            processedElements.back.images = elements.back.images.map(img => ({
              fileId: img.fileId || img.src, // Use fileId if available, fallback to src
              left: img.left,
              top: img.top,
              scaleX: img.scaleX,
              scaleY: img.scaleY,
              angle: img.angle,
              width: img.width,
              height: img.height
            }));
          }
        }
      } catch (elementsError) {
        console.error('Error processing elements:', elementsError);
        // Continue without elements if processing fails
        processedElements = null;
      }
    }

    // Create the design with calculated price and elements
    const design = await Design.create({
      userId,
      fileId,
      sizeQuantities,
      title,
      price: calculatedPrice,
      elements: processedElements
    });

    // Add design to cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Add design to cart as a cart item with correct quantity and price
    cart.items.push({
      designId: design._id,
      quantity: totalQuantity,
      price: calculatedPrice,
      itemType: 'design'
    });

    await cart.save();

    res.status(201).json({ 
      design,
      message: 'Design saved and added to cart successfully'
    });
  } catch (error) {
    console.error('Save design error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error saving design',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

// @desc    Get single design with element details
// @route   GET /api/designs/:id
// @access  Public
exports.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const design = await Design.findById(id);
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // If design has elements with images, generate URLs for them
    if (design.elements) {
      const { getFileUrl } = require('../config/minio');
      
      // Generate URLs for front images
      if (design.elements.front && design.elements.front.images) {
        design.elements.front.images = await Promise.all(
          design.elements.front.images.map(async (img) => {
            if (img.fileId) {
              const url = await getFileUrl(img.fileId);
              return { ...img.toObject(), url };
            }
            return img;
          })
        );
      }
      
      // Generate URLs for back images
      if (design.elements.back && design.elements.back.images) {
        design.elements.back.images = await Promise.all(
          design.elements.back.images.map(async (img) => {
            if (img.fileId) {
              const url = await getFileUrl(img.fileId);
              return { ...img.toObject(), url };
            }
            return img;
          })
        );
      }
    }

    res.json(design);
  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all designs (admin only)
// @route   GET /api/admin/designs
// @access  Admin
exports.getAllDesigns = async (req, res) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    console.error('Get all designs error:', error);
    res.status(500).json({ message: error.message });
  }
};
