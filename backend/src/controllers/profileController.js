const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { uploadFile: uploadToMinio, getFileUrl } = require('../config/minio');

exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email exists and doesn't belong to current user
    const user = await User.findOne({ email });
    
    if (user && user._id.toString() !== req.user._id.toString()) {
      return res.status(200).json({ exists: true, message: 'Email already has an account' });
    }

    res.status(200).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log('Received files:', req.files);
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.file;
    
    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' });
    }

    // Create unique filename for profile picture
    const filename = `profile-${req.user._id}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Upload to MinIO
    const uploadResult = await uploadToMinio(file.data, filename, file.mimetype);
    
    // Update user profile picture URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: uploadResult.url },
      { new: true }
    ).select('-password');

    console.log('Profile picture uploaded successfully to MinIO:', filename);

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture', details: error.message });
  }
};
