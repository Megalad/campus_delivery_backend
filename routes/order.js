const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// NEW: Import the Payment model so we can generate receipts
const Payment = require('../models/Payment'); 

// 1. SETUP MULTER FOR SLIP UPLOADS
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, 'slip-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 2. CREATE ORDER & PROCESS PAYMENT
router.post('/create', upload.single('paymentSlip'), async (req, res) => {
  try {
    const parsedItems = JSON.parse(req.body.items);

    const newOrder = new Order({
      customerId: req.body.customerId,
      vendorId: req.body.vendorId,
      items: parsedItems,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      paymentSlip: req.file ? `/uploads/${req.file.filename}` : null
    });

    const savedOrder = await newOrder.save();

    // --- NEW: AUTOMATICALLY CREATE THE PAYMENT ENTITY ---
    const newPayment = new Payment({
      orderId: savedOrder._id,
      paymentMethod: req.body.paymentMethod,
      amount: req.body.totalAmount,
      paymentSlip: req.file ? `/uploads/${req.file.filename}` : null,
      paymentStatus: 'Pending' // Starts as pending until vendor accepts
    });
    
    // Create Process Payment (Operation 1 from your rubric)
    await newPayment.save(); 
    // ---------------------------------------------------

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- 3. VENDOR: Get all orders for their shop ---
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const orders = await Order.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. VENDOR/ADMIN: Update order status ---
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId, 
      { status }, 
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    
    // --- NEW: AUTOMATICALLY UPDATE PAYMENT STATUS ---
    // Keep the Payment database synced with the Order status
    if (status === 'accepted' || status === 'completed') {
      await Payment.findOneAndUpdate(
        { orderId: req.params.orderId }, 
        { paymentStatus: 'Completed' }
      );
    } else if (status === 'cancelled') {
      await Payment.findOneAndUpdate(
        { orderId: req.params.orderId }, 
        { paymentStatus: 'Refunded' }
      );
    }
    // ------------------------------------------------

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. CUSTOMER: Get all orders for a specific customer ---
router.get('/customer/:customerId', async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId })
                              .populate('vendorId', 'shopName image locationId')
                              .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;