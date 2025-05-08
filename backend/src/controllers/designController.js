const Design = require('../models/Design');

exports.saveDesign = async (req, res) => {
  try {
    const { fileId, sizeQuantities, title, price,userId } = req.body;
    console.log('Received data:', req.body); // Log the received data
    const design = await Design.create({
      userId: userId,
      fileId,
      sizeQuantities,
      title,
      price
    });
    res.status(201).json(design);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDesigns = async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user._id });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
