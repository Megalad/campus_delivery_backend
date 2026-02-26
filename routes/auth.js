const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, phone, password, location } = req.body;

    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
  name: req.body.fullname,
  email: req.body.email,
  password: hashedPassword,
  phone: req.body.phone,
  locationId: req.body.location,
  role: req.body.role || 'Customer' // <-- ADD THIS LINE!
});

    await newUser.save();
    return res.status(201).json({ message: "User created successfully!" });
  } catch (err) {
    console.error("REGISTER ERROR:", err); // <-- this will show the real reason for 500
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

    return res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
// GET USER PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE USER PROFILE
router.put("/profile/:id", async (req, res) => {
  try {
    const { name, phone, locationId } = req.body;
    
    // Update the user and return the new document
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, locationId },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;