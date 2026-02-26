const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true // e.g., 'Main', 'Drink', 'Snack'
  },
  image: { 
    type: String // Stores the file path to the food photo
  },
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vendor', 
    required: true // Links the item to the specific Vendor Shop
  },
  isAvailable: { 
    type: Boolean, 
    default: true // Vendors can easily hide items later if they run out of stock
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);