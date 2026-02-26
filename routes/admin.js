const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Item = require('../models/Item'); // Needed so we can delete a vendor's menu when we delete the vendor!

// 1. GET STATS (Your existing code)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const allOrders = await Order.find()
      .populate('vendorId', 'shopName locationId')
      .populate('customerId', 'name locationId') // <-- ADD THIS EXACT LINE!
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ totalUsers, totalVendors, totalOrders, orders: allOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NEW MANAGEMENT ROUTES ---

// 2. GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    // We use .select('-password') so we don't accidentally send passwords to the frontend!
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE USER
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET ALL VENDORS
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE VENDOR & THEIR MENU
router.delete('/vendors/:id', async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    // Automatically delete all menu items that belonged to this shop so the database stays clean
    await Item.deleteMany({ vendorId: req.params.id }); 
    res.json({ message: "Vendor and menu items deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;