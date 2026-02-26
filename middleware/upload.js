const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // We use the vendorId from the request body to name the folder
    const vendorId = req.body.vendorId || 'general'; 
    const dir = `./uploads/vendors/${vendorId}/items`;

    // Automatically create the folder if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Save file with a timestamp to avoid name conflicts
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
module.exports = upload;