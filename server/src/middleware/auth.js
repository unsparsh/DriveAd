import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Advertiser from '../models/Advertiser.js';
import Driver from '../models/Driver.js';

// Authenticate user middleware
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user info to request
    req.user = {
      userId: user._id,
      role: user.role
    };
    
    // Add role-specific IDs
    if (user.role === 'advertiser') {
      const advertiser = await Advertiser.findOne({ user: user._id });
      if (advertiser) {
        req.user.advertiserId = advertiser._id;
      }
    } else if (user.role === 'driver') {
      const driver = await Driver.findOne({ user: user._id });
      if (driver) {
        req.user.driverId = driver._id;
      }
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Authorize role middleware
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};