const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const transporter = require('../config/email');
const { sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // if(user.type == 'Admin') {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(user.type !== 'Admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateAdminToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user || user.type !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate reset password token
exports.validateResetToken = async (req, res) => {
  try {
    console.log('\n========== VALIDATE RESET TOKEN ==========');
    const { token } = req.body;
    console.log('Token received:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    if (!token) {
      console.log('❌ No token provided');
      console.log('==========================================\n');
      return res.status(400).json({ valid: false, message: 'No token provided' });
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Token hashed:', hashedToken);

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    console.log('User found with valid token:', user ? 'YES ✅' : 'NO ❌');

    if (!user) {
      console.log('❌ Invalid or expired token');
      console.log('==========================================\n');
      return res.status(400).json({ valid: false, message: 'Invalid or expired reset token' });
    }

    console.log('✅ Token is valid!');
    console.log('Token expires at:', user.resetPasswordExpire);
    console.log('==========================================\n');
    return res.json({ valid: true, message: 'Token is valid' });

  } catch (error) {
    console.error('❌ Validate token error:', error.message);
    console.log('==========================================\n');
    res.status(500).json({ valid: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    console.log('\n========== FORGOT PASSWORD REQUEST ==========');
    const { email } = req.body;
    console.log('Email requested:', email);

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'YES ✅' : 'NO ❌');

    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log('Reset token generated:', resetToken.substring(0, 10) + '...');

    // Set token and expiration (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();
    console.log('User saved with token ✅');

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    console.log('Reset URL:', resetUrl);

    // Send email
    console.log('Sending password reset email...');
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);
    console.log('Email result:', emailResult);
    console.log('==========================================\n');

    res.json({
      message: 'Password reset email has been sent to your email address'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    console.log('==========================================\n');
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    console.log('\n========== RESET PASSWORD REQUEST ==========');
    const { token, newPassword, confirmPassword } = req.body;
    console.log('Token received:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('Token length:', token?.length || 0);

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide token and password' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Token hashed:', hashedToken);

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    console.log('User found with matching token:', user ? 'YES ✅' : 'NO ❌');
    
    if (user) {
      console.log('Token expiration:', user.resetPasswordExpire);
      console.log('Current time:', new Date(Date.now()));
      console.log('Token valid:', user.resetPasswordExpire > Date.now() ? 'YES ✅' : 'NO ❌');
    } else {
      // Debug: Check if token exists in DB at all
      const anyUser = await User.findOne({
        resetPasswordToken: { $ne: null }
      });
      console.log('Any user with reset token in DB:', anyUser ? 'YES' : 'NO');
      if (anyUser) {
        console.log('Token in DB:', anyUser.resetPasswordToken.substring(0, 20) + '...');
        console.log('Token we hashed:', hashedToken);
      }
    }

    if (!user) {
      console.log('❌ Invalid or expired reset token');
      console.log('==========================================\n');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();
    console.log('✅ Password updated successfully!');
    console.log('==========================================\n');

    res.json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
};

