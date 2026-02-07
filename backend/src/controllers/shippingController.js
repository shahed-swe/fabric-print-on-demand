const ShippingAddress = require('../models/ShippingAddress');

exports.getAddresses = async (req, res) => {
  try {
    const {userId} = req.query
    const addresses = await ShippingAddress.find({ userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body' });
  }
  try {
    const address = await ShippingAddress.create({
      userId,
      ...req.body
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  try {
    const address = await ShippingAddress.findByIdAndDelete(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};