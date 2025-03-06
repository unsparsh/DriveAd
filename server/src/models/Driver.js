import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['auto', 'car'],
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true
  },
  activeBanners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banner'
  }],
  earnings: {
    type: Number,
    default: 0
  },
  paymentDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;