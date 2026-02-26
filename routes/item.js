const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// --- MULTER SETUP FOR FOOD ITEMS ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/items';
    
    // Automatically create the folder if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); 
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Saves file as item_123456789.jpg
    cb(null, "item_" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- ADD NEW MENU ITEM (POST) ---
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, vendorId } = req.body;

    // Validation
    if (!name || !price || !category || !vendorId) {
      return res.status(400).json({ message: "Missing required item fields." });
    }

    const newItem = new Item({
      name,
      price,
      category,
      vendorId,
      image: req.file ? `/uploads/items/${req.file.filename}` : ''
    });

    await newItem.save();
    res.status(201).json(newItem); // Send back the created item to update the UI instantly

  } catch (err) {
    console.error("DETAILED ERROR (Add Item):", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- GET ALL ITEMS FOR A SPECIFIC SHOP (GET) ---
// GET ITEMS BY VENDOR ID
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    // NEW: Safety check to prevent MongoDB crashes!
    if (!req.params.vendorId || req.params.vendorId === 'undefined') {
      return res.status(400).json([]); // Send back an empty menu instead of crashing
    }

    const items = await Item.find({ vendorId: req.params.vendorId });
    res.json(items);
  } catch (err) {
    console.error("DETAILED ERROR (Fetch Items):", err);
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE A MENU ITEM ---
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE A MENU ITEM ---
router.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    // Grab the new text data
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
    };
    
    // If the vendor uploaded a new photo, update the image path too
    if (req.file) {
      updateData.image = `/uploads/items/${req.file.filename}`;
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;