import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Advertiser from '../models/Advertiser.js';
import Driver from '../models/Driver.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, ...additionalData } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role
    });
    
    await user.save();
    
    // Create role-specific profile
    if (role === 'advertiser') {
      const { companyName, companyAddress, gstin } = additionalData;
      const advertiser = new Advertiser({
        user: user._id,
        companyName,
        companyAddress,
        gstin
      });
      await advertiser.save();
    } else if (role === 'driver') {
      const { vehicleType, vehicleNumber, licenseNumber } = additionalData;
      const driver = new Driver({
        user: user._id,
        vehicleType,
        vehicleNumber,
        licenseNumber
      });
      await driver.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profileData = {};
    
    if (user.role === 'advertiser') {
      profileData = await Advertiser.findOne({ user: user._id });
    } else if (user.role === 'driver') {
      profileData = await Driver.findOne({ user: user._id });
    }
    
    res.json({
      user,
      profile: profileData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

export default router;