const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentMethod: { type: String, enum: ['PromptPay', 'Cash'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  amount: { type: Number, required: true },
  paymentSlip: { type: String } // Stores the image URL if PromptPay
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);