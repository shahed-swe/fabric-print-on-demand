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


exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    await Design.findOneAndDelete({ _id: id });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.removeByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    await Design.deleteMany({ userId });
    res.json({ message: 'All items removed from cart' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
