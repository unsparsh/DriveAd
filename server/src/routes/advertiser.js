import express from 'express';
import Campaign from '../models/Campaign.js';
import Banner from '../models/Banner.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/banners';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg and .png files are allowed'));
  }
});

// Create a new campaign
router.post(
  '/campaigns',
  authenticateUser,
  authorizeRole('advertiser'),
  upload.single('bannerImage'),
  async (req, res) => {
    try {
      const { name, vehicleType, duration, startDate, bannerCount } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'Banner image is required' });
      }
      
      // Calculate cost based on vehicle type and duration
      const ratePerDay = vehicleType === 'auto' ? 70 : 100;
      const totalCost = ratePerDay * duration * bannerCount;
      
      // Calculate end date
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + parseInt(duration));
      
      // Create campaign
      const campaign = new Campaign({
        advertiser: req.user.advertiserId,
        name,
        vehicleType,
        duration: parseInt(duration),
        startDate: start,
        endDate: end,
        totalCost,
        bannerCount: parseInt(bannerCount),
        remainingBanners: parseInt(bannerCount),
        bannerImage: `/uploads/banners/${req.file.filename}`
      });
      
      await campaign.save();
      
      // Create banner entries for this campaign
      const banners = [];
      for (let i = 0; i < bannerCount; i++) {
        banners.push({
          campaign: campaign._id,
          status: 'available'
        });
      }
      
      await Banner.insertMany(banners);
      
      res.status(201).json({
        message: 'Campaign created successfully',
        campaign
      });
    } catch (error) {
      console.error('Campaign creation error:', error);
      res.status(500).json({ message: 'Failed to create campaign', error: error.message });
    }
  }
);

// Get all campaigns for the advertiser
router.get(
  '/campaigns',
  authenticateUser,
  authorizeRole('advertiser'),
  async (req, res) => {
    try {
      const campaigns = await Campaign.find({ advertiser: req.user.advertiserId })
        .sort({ createdAt: -1 });
      
      res.json(campaigns);
    } catch (error) {
      console.error('Campaigns fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch campaigns', error: error.message });
    }
  }
);

// Get campaign details by ID
router.get(
  '/campaigns/:id',
  authenticateUser,
  authorizeRole('advertiser'),
  async (req, res) => {
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        advertiser: req.user.advertiserId
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      
      // Get banner statistics
      const bannerStats = await Banner.aggregate([
        { $match: { campaign: campaign._id } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }}
      ]);
      
      const stats = {
        available: 0,
        assigned: 0,
        verified: 0,
        completed: 0
      };
      
      bannerStats.forEach(stat => {
        stats[stat._id] = stat.count;
      });
      
      res.json({
        campaign,
        bannerStats: stats
      });
    } catch (error) {
      console.error('Campaign details fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch campaign details', error: error.message });
    }
  }
);

// Update campaign
router.put(
  '/campaigns/:id',
  authenticateUser,
  authorizeRole('advertiser'),
  async (req, res) => {
    try {
      const { name } = req.body;
      
      const campaign = await Campaign.findOneAndUpdate(
        { _id: req.params.id, advertiser: req.user.advertiserId },
        { name },
        { new: true }
      );
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      
      res.json({
        message: 'Campaign updated successfully',
        campaign
      });
    } catch (error) {
      console.error('Campaign update error:', error);
      res.status(500).json({ message: 'Failed to update campaign', error: error.message });
    }
  }
);

// Cancel campaign
router.put(
  '/campaigns/:id/cancel',
  authenticateUser,
  authorizeRole('advertiser'),
  async (req, res) => {
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        advertiser: req.user.advertiserId
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      
      if (campaign.status === 'completed') {
        return res.status(400).json({ message: 'Cannot cancel a completed campaign' });
      }
      
      campaign.status = 'cancelled';
      await campaign.save();
      
      // Update all unassigned banners to cancelled
      await Banner.updateMany(
        { campaign: campaign._id, isAssigned: false },
        { status: 'completed' }
      );
      
      res.json({
        message: 'Campaign cancelled successfully',
        campaign
      });
    } catch (error) {
      console.error('Campaign cancellation error:', error);
      res.status(500).json({ message: 'Failed to cancel campaign', error: error.message });
    }
  }
);

// Get dashboard statistics
router.get(
  '/dashboard',
  authenticateUser,
  authorizeRole('advertiser'),
  async (req, res) => {
    try {
      // Get campaign statistics
      const campaignStats = await Campaign.aggregate([
        { $match: { advertiser: req.user.advertiserId } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' }
        }}
      ]);
      
      // Get total banners
      const bannerStats = await Campaign.aggregate([
        { $match: { advertiser: req.user.advertiserId } },
        { $group: {
          _id: null,
          totalBanners: { $sum: '$bannerCount' },
          assignedBanners: { $sum: { $subtract: ['$bannerCount', '$remainingBanners'] } }
        }}
      ]);
      
      // Format statistics
      const stats = {
        campaigns: {
          total: 0,
          active: 0,
          pending: 0,
          completed: 0,
          cancelled: 0
        },
        banners: {
          total: 0,
          assigned: 0,
          available: 0
        },
        totalSpent: 0
      };
      
      campaignStats.forEach(stat => {
        stats.campaigns[stat._id] = stat.count;
        stats.campaigns.total += stat.count;
        
        if (stat._id === 'active' || stat._id === 'completed') {
          stats.totalSpent += stat.totalCost;
        }
      });
      
      if (bannerStats.length > 0) {
        stats.banners.total = bannerStats[0].totalBanners || 0;
        stats.banners.assigned = bannerStats[0].assignedBanners || 0;
        stats.banners.available = stats.banners.total - stats.banners.assigned;
      }
      
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics', error: error.message });
    }
  }
);

export default router;