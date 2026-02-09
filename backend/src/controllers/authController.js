const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendAccountCreationEmail, sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const TEMPORARY_PASSWORD = 'Password1@';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'This email is already registered. Please use a different email or login instead.' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({ 
      name, 
      email, 
      password,
      verificationToken,
      verificationTokenExpire,
      isVerified: false
    });
    
    const token = generateToken(user._id);

    // Send verification email (fire and forget, but log errors)
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
      // Don't fail the registration, but user won't get email
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      isVerified: false,
      token,
      message: 'Account created! Please verify your email to complete registration.'
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
        isVerified: user.isVerified,
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

exports.createGuestAccount = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, just return their ID (don't resend email)
      const token = generateToken(user._id);
      return res.status(200).json({
        userId: user._id,
        email: user.email,
        token,
        message: 'Welcome back! You can now complete your order.'
      });
    }

    // Extract name from email (before @)
    const nameFromEmail = email.split('@')[0];
    const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    // Create new guest user with temporary password
    user = await User.create({
      name: capitalizedName,
      email,
      password: TEMPORARY_PASSWORD,
      type: 'Customer',
      isVerified: true  // Guest accounts are auto-verified for quick checkout
    });

    const token = generateToken(user._id);

    // Send account creation email with credentials
    sendAccountCreationEmail(user, TEMPORARY_PASSWORD).catch(err => {
      console.error('Failed to send account creation email:', err);
      // Don't fail the request, account was created successfully
    });

    res.status(201).json({
      userId: user._id,
      email: user.email,
      token,
      message: 'Account created successfully! Check your email for login credentials.'
    });
  } catch (error) {
    console.error('Create guest account error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpire = null;
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully! You can now access all features.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpire = verificationTokenExpire;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
      // Still respond success - user can manually request new link
    }

    res.status(200).json({ message: 'Verification email sent! Check your email.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    }

    // Generate reset token (1 hour expiration)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpire = resetTokenExpire;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailErr) {
      console.error('Failed to send password reset email:', emailErr);
      user.passwordResetToken = null;
      user.passwordResetExpire = null;
      await user.save();
      return res.status(500).json({ message: 'Error sending password reset email' });
    }

    res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide password and confirm password' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user by reset token and check expiration
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpire = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
};
