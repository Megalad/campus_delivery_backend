const mongoose = require('mongoose');

// Define what a single item in the cart looks like
const orderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vendor', 
    required: true 
  },
  items: [orderItemSchema], // Array of the cart items
  totalAmount: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { type: String, enum: ['PromptPay', 'Cash'], default: 'Cash' },
  paymentSlip: { type: String },
  status: { 
    type: String, 
    // These perfectly match the tabs you built on the Vendor Dashboard!
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);