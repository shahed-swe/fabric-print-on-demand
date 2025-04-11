const ShippingAddress = require('../models/ShippingAddress');

exports.getAddresses = async (req, res) => {
  try {
    const {userId} = req.query
    console.log(userId)
    const addresses = await ShippingAddress.find({ userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const address = await ShippingAddress.create({
      userId: req.user._id,
      ...req.body
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
