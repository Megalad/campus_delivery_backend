const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Vendor', 'Customer'], 
    default: 'Customer' 
  }, // As per your Entity 1 
  locationId: { type: String }, // For Customers 
  campus: { type: String } // For Admins 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);