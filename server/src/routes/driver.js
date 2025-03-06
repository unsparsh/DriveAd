import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ExifImage } from 'exif';
import Banner from '../models/Banner.js';
import Driver from '../models/Driver.js';
import Campaign from '../models/Campaign.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/verifications';
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

// Get available banners for driver
router.get(
  '/available-banners',
  authenticateUser,
  authorizeRole('driver'),
  async (req, res) => {
    try {
      const driver = await Driver.findOne({ user: req.user.userId });
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver profile not found' });
      }
      
      // Get active campaigns with available banners for the driver's vehicle type
      const campaigns = await Campaign.aggregate([
        {
          $match: {
            status: 'active',
            vehicleType: driver.vehicleType,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
            remainingBanners: { $gt: 0 }
          }
        },
        {
          $lookup: {
            from: 'banners',
            let: { campaignId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$campaign', '$$campaignId'] },
                      { $eq: ['$status', 'available'] }
                    ]
                  }
                }
              },
              { $limit: 5 }
            ],
            as: 'availableBanners'
          }
        },
        {
          $match: {
            'availableBanners.0': { $exists: true }
          }
        }
      ]);
      
      res.json(campaigns);
    } catch (error) {
      console.error('Available banners fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch available banners', error: error.message });
    }
  }
);

// Claim a banner
router.post(
  '/claim-banner/:bannerId',
  authenticateUser,
  authorizeRole('driver'),
  async (req, res) => {
    try {
      const driver = await Driver.findOne({ user: req.user.userId });
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver profile not found' });
      }
      
      // Check if driver already has active banners
      if (driver.activeBanners.length >= 2) {
        return res.status(400).json({ message: 'You can only have up to 2 active banners at a time' });
      }
      
      // Find and update the banner
      const banner = await Banner.findOneAndUpdate(
        { _id: req.params.bannerId, status: 'available', isAssigned: false },
        {
          driver: driver._id,
          isAssigned: true,
          status: 'assigned',
          assignedDate: new Date()
        },
        { new: true }
      );
      
      if (!banner) {
        return res.status(404).json({ message: 'Banner not available or already assigned' });
      }
      
      // Update campaign remaining banners count
      await Campaign.findByIdAndUpdate(
        banner.campaign,
        { $inc: { remainingBanners: -1 } }
      );
      
      // Add banner to driver's active banners
      await Driver.findByIdAndUpdate(
        driver._id,
        { $push: { activeBanners: banner._id } }
      );
      
      res.json({
        message: 'Banner claimed successfully',
        banner
      });
    } catch (error) {
      console.error('Banner claim error:', error);
      res.status(500).json({ message: 'Failed to claim banner', error: error.message });
    }
  }
);

// Upload verification photo
router.post(
  '/verify-banner/:bannerId',
  authenticateUser,
  authorizeRole('driver'),
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Verification photo is required' });
      }
      
      const driver = await Driver.findOne({ user: req.user.userId });
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver profile not found' });
      }
      
      // Find the banner
      const banner = await Banner.findOne({
        _id: req.params.bannerId,
        driver: driver._id,
        status: { $in: ['assigned', 'verified'] }
      });
      
      if (!banner) {
        return res.status(404).json({ message: 'Banner not found or not assigned to you' });
      }
      
      const photoPath = `/uploads/verifications/${req.file.filename}`;
      const fullPath = path.join(process.cwd(), 'uploads/verifications', req.file.filename);
      
      // Extract EXIF data
      let metadata = {
        dateTaken: new Date(),
        location: { latitude: null, longitude: null }
      };
      
      try {
        const exifData = await new Promise((resolve, reject) => {
          new ExifImage({ image: fullPath }, (error, exifData) => {
            if (error) {
              console.log('EXIF extraction error:', error);
              resolve(null);
            } else {
              resolve(exifData);
            }
          });
        });
        
        if (exifData) {
          // Extract date taken
          if (exifData.exif && exifData.exif.DateTimeOriginal) {
            const dateParts = exifData.exif.DateTimeOriginal.split(' ')[0].split(':');
            const timeParts = exifData.exif.DateTimeOriginal.split(' ')[1].split(':');
            
            metadata.dateTaken = new Date(
              parseInt(dateParts[0]),
              parseInt(dateParts[1]) - 1,
              parseInt(dateParts[2]),
              parseInt(timeParts[0]),
              parseInt(timeParts[1]),
              parseInt(timeParts[2])
            );
          }
          
          // Extract GPS data if available
          if (exifData.gps && exifData.gps.GPSLatitude && exifData.gps.GPSLongitude) {
            const latRef = exifData.gps.GPSLatitudeRef || 'N';
            const lngRef = exifData.gps.GPSLongitudeRef || 'E';
            
            const latValue = exifData.gps.GPSLatitude.reduce((acc, val, i) => {
              const divisor = [1, 60, 3600][i];
              return acc + val / divisor;
            }, 0);
            
            const lngValue = exifData.gps.GPSLongitude.reduce((acc, val, i) => {
              const divisor = [1, 60, 3600][i];
              return acc + val / divisor;
            }, 0);
            
            metadata.location.latitude = latRef === 'N' ? latValue : -latValue;
            metadata.location.longitude = lngRef === 'E' ? lngValue : -lngValue;
          }
        }
      } catch (exifError) {
        console.error('EXIF processing error:', exifError);
      }
      
      // Verify if the photo was taken today
      const today = new Date();
      const photoDate = metadata.dateTaken;
      
      const isVerified = (
        photoDate.getDate() === today.getDate() &&
        photoDate.getMonth() === today.getMonth() &&
        photoDate.getFullYear() === today.getFullYear()
      );
      
      // Add verification photo
      const verificationPhoto = {
        url: photoPath,
        timestamp: new Date(),
        isVerified,
        metadata
      };
      
      await Banner.findByIdAndUpdate(
        banner._id,
        {
          $push: { verificationPhotos: verificationPhoto },
          status: isVerified ? 'verified' : 'assigned'
        }
      );
      
      res.json({
        message: isVerified ? 'Banner verified successfully' : 'Photo uploaded but verification failed. Please ensure the photo was taken today.',
        isVerified,
        photoDetails: verificationPhoto
      });
    } catch (error) {
      console.error('Banner verification error:', error);
      res.status(500).json({ message: 'Failed to verify banner', error: error.message });
    }
  }
);

// Get driver's active banners
router.get(
  '/my-banners',
  authenticateUser,
  authorizeRole('driver'),
  async (req, res) => {
    try {
      const driver = await Driver.findOne({ user: req.user.userId });
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver profile not found' });
      }
      
      // Get active banners with campaign details
      const banners = await Banner.find({
        driver: driver._id,
        status: { $in: ['assigned', 'verified'] }
      }).populate({
        path: 'campaign',
        select: 'name vehicleType startDate endDate bannerImage'
      });
      
      res.json(banners);
    } catch (error) {
      console.error('My banners fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch your banners', error: error.message });
    }
  }
);

// Get driver's earnings
router.get(
  '/earnings',
  authenticateUser,
  authorizeRole('driver'),
  async (req, res) => {
    try {
      const driver = await Driver.findOne({ user: req.user.userId });
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver profile not found' });
      }
      
      // Get completed banners with earnings details
      const completedBanners = await Banner.find({
        driver: driver._id,
        status: 'completed'
      }).populate({
        path: 'campaign',
        select: 'name vehicleType startDate endDate'
      });
      
      // Calculate earnings per campaign
      const earningsByCampaign = {};
      let totalEarnings = 0;
      
      completedBanners.forEach(banner => {
        const campaign = banner.campaign;
        const campaignId = campaign._id.toString();
        
        if (!earningsByCampaign[campaignId]) {
          earningsByCampaign[campaignId] = {
            campaignName: campaign.name,
            bannerCount: 0,
            totalEarnings: 0,
            startDate: campaign.startDate,
            endDate: campaign.endDate
          };
        }
        
        const ratePerDay = campaign.vehicleType === 'auto' ? 70 : 100;
        const daysActive = Math.ceil((banner.verificationPhotos.length || 1) / 2); // Assuming 2 verifications per day
        const earnings = ratePerDay * daysActive;
        
        earningsByCampaign[campaignId].bannerCount++;
        earningsByCampaign[campaignId].totalEarnings += earnings;
        totalEarnings += earnings;
      });
      
      res.json({
        totalEarnings,
        earningsByCampaign: Object.values(earningsByCampaign)
      });
    } catch (error) {
      console.error('Earnings fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch earnings', error: error.message });
    }
  }
);

// Update payment details
router.put(
  '/payment-details',
  authenticateUser,
  authorizeRole('driver'),
  async (req, res) => {
    try {
      const { accountNumber, ifscCode, accountHolderName } = req.body;
      
      const driver = await Driver.findOneAndUpdate(
        { user: req.user.userId },
        {
          paymentDetails: {
            accountNumber,
            ifscCode,
            accountHolderName
          }
        },
        { new: true }
      );
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver profile not found' });
      }
      
      res.json({
        message: 'Payment details updated successfully',
        paymentDetails: driver.paymentDetails
      });
    } catch (error) {
      console.error('Payment details update error:', error);
      res.status(500).json({ message: 'Failed to update payment details', error: error.message });
    }
  }
);

export default router;