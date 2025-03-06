import mongoose from 'mongoose';

const advertiserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyAddress: {
    type: String,
    required: true
  },
  gstin: {
    type: String,
    trim: true
  },
  campaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Advertiser = mongoose.model('Advertiser', advertiserSchema);

export default Advertiser;