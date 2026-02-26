const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// --- MULTER SETUP ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/vendors/profiles';
    
    // Check if directory exists, if not, create it recursively
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // This creates vendors AND profiles
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, (req.body.ownerId || 'user') + "_" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- CREATE SHOP ---
router.post('/register-shop', upload.single('image'), async (req, res) => {
  try {
    const { shopName, locationId, cuisineType, ownerId } = req.body;

    // Validation: Log received ID to your terminal
    console.log("Backend received ownerId:", ownerId);

    // Validate ownerId format (must be a 24-character hex string)
    if (!ownerId || ownerId.length !== 24) {
      return res.status(400).json({ message: "Invalid User ID format. Please re-login." });
    }

    const existingShop = await Vendor.findOne({ ownerId });
    if (existingShop) return res.status(400).json({ message: "Shop already exists for this user." });

    const newShop = new Vendor({
      shopName,
      locationId,
      cuisineType,
      ownerId,
      image: req.file ? `/uploads/vendors/profiles/${req.file.filename}` : ''
    });

    await newShop.save();
    res.status(201).json({ message: "Shop Registered successfully!", vendor: newShop });
  } catch (err) {
    // This prints the EXACT error in your terminal to fix the 500 error
    console.error("DETAILED SERVER ERROR:", err); 
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- READ VENDORS BY LOCATION ---
router.get('/location/:locationId', async (req, res) => {
  try {
    const vendors = await Vendor.find({ locationId: req.params.locationId });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-shop/:ownerId', async (req, res) => {
  try {
    const shop = await Vendor.findOne({ ownerId: req.params.ownerId });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET A SPECIFIC VENDOR BY ID (For Customer Menu) ---
router.get('/:id', async (req, res) => {
  try {
    // NEW SAFETY CHECK:
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: "Invalid Vendor ID" });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TOGGLE SHOP STATUS (OPEN/CLOSED) ---
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Flip the boolean (if true, make false. If false, make true)
    vendor.isOpen = !vendor.isOpen;
    await vendor.save();

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;