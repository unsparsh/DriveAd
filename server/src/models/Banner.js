import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  isAssigned: {
    type: Boolean,
    default: false
  },
  verificationPhotos: [{
    url: String,
    timestamp: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    metadata: {
      dateTaken: Date,
      location: {
        latitude: Number,
        longitude: Number
      }
    }
  }],
  assignedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'verified', 'completed'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;