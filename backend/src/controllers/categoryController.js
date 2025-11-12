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

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('===== DELETE CATEGORY REQUEST =====');
    console.log('Category ID from params:', id);
    console.log('Request path:', req.path);
    console.log('Request URL:', req.url);
    console.log('Full request original URL:', req.originalUrl);
    
    const category = await Category.findByIdAndDelete(id);
    console.log('Category found and deleted:', category);
    
    if (!category) {
      console.log('Category not found with ID:', id);
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', deletedCategory: category });
  } catch (error) {
    console.error('Error deleting category:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};
