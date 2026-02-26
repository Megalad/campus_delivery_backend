const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Added for path handling
require("dotenv").config();

const app = express();

// --- 1. MIDDLEWARE ---
// Must be placed BEFORE routes
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. STATIC FOLDER ---
// This allows the frontend to see the uploaded shop/item images
// URL example: http://localhost:5001/uploads/vendors/profiles/image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. ROUTES ---
const authRoutes = require("./routes/auth");
const vendorRoutes = require('./routes/vendor');

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);

app.use("/api/items", require("./routes/item"));

app.use('/api/orders', require('./routes/order'));

app.use('/api/admin', require('./routes/admin'));
const locationRoutes = require('./routes/location');
const paymentRoutes = require('./routes/payment');

app.use('/api/locations', locationRoutes);
app.use('/api/payments', paymentRoutes);
// Test route to verify backend is alive
app.get("/", (req, res) => {
  res.send("CampusOne Delivery API is running on Port 5001...");
});

// --- 4. DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("🔥 Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- 5. SERVER START ---
// Using 5001 to avoid MacOS AirTunes conflict on 5000
const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📂 Static uploads enabled at: ${path.join(__dirname, 'uploads')}`);
});