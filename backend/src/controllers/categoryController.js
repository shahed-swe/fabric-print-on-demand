const Category = require('../models/Category');
const slugify = require('slugify');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;
    const category = await Category.create({
      name,
      description,
      slug: slugify(name, { lower: true }),
      parentCategory
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentCategory } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        description,
        slug: name ? slugify(name, { lower: true }) : undefined,
        parentCategory
      },
      { new: true }
    );
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
