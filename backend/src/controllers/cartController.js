const Cart = require('../models/Cart');
const Design = require('../models/Design');
const Product = require('../models/Product');

// @desc    Get cart items for a user
// @route   GET /api/cart
// @access  Public
exports.getCartItems = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get cart for user
    let cart = await Cart.findOne({ userId })
      .populate('items.designId')
      .populate('items.productId');

    if (!cart) {
      return res.json({ items: [], total: 0 });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ 
      items: cart.items,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Error fetching cart items', error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Public
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, designId, quantity, size, color, price, itemType } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!itemType || !['design', 'product'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    if (itemType === 'product' && !productId) {
      return res.status(400).json({ message: 'Product ID is required for product items' });
    }

    if (itemType === 'design' && !designId) {
      return res.status(400).json({ message: 'Design ID is required for design items' });
    }

    // Validate product/design exists
    if (itemType === 'product') {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Validate size if provided
      if (size && product.sizes) {
        const sizeExists = product.sizes.find(s => s.size === size && s.enabled);
        if (!sizeExists) {
          return res.status(400).json({ message: 'Invalid size selected' });
        }
      }
      
      // Validate color if provided
      if (color && product.colors) {
        const colorExists = product.colors.find(c => c.name === color && c.enabled);
        if (!colorExists) {
          return res.status(400).json({ message: 'Invalid color selected' });
        }
      }
    } else if (itemType === 'design') {
      const design = await Design.findById(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    let existingItemIndex = -1;
    
    if (itemType === 'product') {
      existingItemIndex = cart.items.findIndex(item => 
        item.itemType === 'product' &&
        item.productId?.toString() === productId &&
        item.size === size &&
        item.color === color
      );
    } else {
      existingItemIndex = cart.items.findIndex(item => 
        item.itemType === 'design' &&
        item.designId?.toString() === designId
      );
    }

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      // Add new item
      const newItem = {
        quantity: quantity || 1,
        price: price || 0,
        itemType
      };

      if (itemType === 'product') {
        newItem.productId = productId;
        if (size) newItem.size = size;
        if (color) newItem.color = color;
      } else {
        newItem.designId = designId;
      }

      cart.items.push(newItem);
    }

    await cart.save();

    // Populate and return updated cart
    cart = await Cart.findById(cart._id)
      .populate('items.designId')
      .populate('items.productId');

    res.status(201).json({ 
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Public
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json({ 
      message: 'Cart item updated',
      cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// @desc    Update design size quantities
// @route   PUT /api/cart/design/:itemId/sizes
// @access  Public
exports.updateDesignSizes = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId, sizeQuantities } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!sizeQuantities || typeof sizeQuantities !== 'object') {
      return res.status(400).json({ message: 'Size quantities are required' });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const item = cart.items[itemIndex];

    if (item.itemType !== 'design') {
      return res.status(400).json({ message: 'This endpoint is only for design items' });
    }

    // Update the design's size quantities
    const design = await Design.findById(item.designId);
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Update size quantities
    design.sizeQuantities = sizeQuantities;
    
    // Calculate new total quantity
    const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + Number(qty), 0);
    
    if (totalQuantity < 1) {
      return res.status(400).json({ message: 'Total quantity must be at least 1' });
    }

    // Update cart item quantity
    cart.items[itemIndex].quantity = totalQuantity;
    
    // Recalculate price: $30 per item
    const DESIGN_PRICE = 30;
    const newTotalPrice = DESIGN_PRICE * totalQuantity;
    cart.items[itemIndex].price = newTotalPrice;
    design.price = newTotalPrice;

    await design.save();
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.designId')
      .populate('items.productId');

    res.json({ 
      message: 'Design sizes updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Update design sizes error:', error);
    res.status(500).json({ message: 'Error updating design sizes', error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Public
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json({ 
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// @desc    Clear all items from cart
// @route   DELETE /api/cart/user/:userId
// @access  Public
exports.removeByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ message: 'Cart already empty' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'All items removed from cart' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};
