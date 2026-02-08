const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendAccountCreationEmail } = require('../services/emailService');

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
      type: 'Customer'
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

