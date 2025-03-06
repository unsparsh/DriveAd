import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertiser',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['auto', 'car'],
    required: true
  },
  duration: {
    type: Number, // in days
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  bannerCount: {
    type: Number,
    required: true,
    min: 1
  },
  remainingBanners: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  bannerImage: {
    type: String, // URL to the banner image
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;