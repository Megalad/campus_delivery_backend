const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  locationId: { type: String, required: true },
  cuisineType: { type: String, required: true },
  image: { type: String },
  
  // ONLY the manual toggle status
  isOpen: { type: Boolean, default: true }
  
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);