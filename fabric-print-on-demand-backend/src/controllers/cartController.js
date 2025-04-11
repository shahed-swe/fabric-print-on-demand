const Cart = require('../models/Cart');
const Design = require('../models/Design');

exports.getCartItems = async (req, res) => {
  try {
    const { userId } = req.query;
    const cartItems = await Design.find({ userId })
    res.json(cartItems);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Error fetching cart items' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const newItem = await Cart.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    await Cart.findOneAndDelete({ _id: id, userId: req.user._id });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
