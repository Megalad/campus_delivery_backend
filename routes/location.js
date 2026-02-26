const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// CREATE (Add Location)
router.post('/', async (req, res) => {
  try {
    const newLocation = new Location({ locationName: req.body.locationName });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (List Locations)
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (Rename Location)
router.put('/:id', async (req, res) => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id, 
      { locationName: req.body.locationName }, 
      { new: true }
    );
    res.json(updatedLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (Remove Location)
router.delete('/:id', async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;