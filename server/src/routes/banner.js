import express from 'express';
import Banner from '../models/Banner.js';
import Campaign from '../models/Campaign.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get banner details by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate({
        path: 'campaign',
        select: 'name vehicleType startDate endDate bannerImage'
      })
      .populate({
        path: 'driver',
        select: 'vehicleType vehicleNumber'
      });
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Banner fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch banner details', error: error.message });
  }
});

// Get banners by campaign ID
router.get('/campaign/:campaignId', authenticateUser, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Check if user is authorized to view this campaign's banners
    if (
      req.user.role === 'advertiser' && 
      campaign.advertiser.toString() !== req.user.advertiserId
    ) {
      return res.status(403).json({ message: 'Not authorized to view these banners' });
    }
    
    const banners = await Banner.find({ campaign: req.params.campaignId })
      .populate({
        path: 'driver',
        select: 'vehicleType vehicleNumber'
      });
    
    res.json(banners);
  } catch (error) {
    console.error('Campaign banners fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch campaign banners', error: error.message });
  }
});

export default router;