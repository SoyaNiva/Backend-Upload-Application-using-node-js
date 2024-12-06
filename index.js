const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Enable CORS for frontend interaction
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure the storage and file filter
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  // File filter to restrict file types
  const fileFilter = (req, file, cb) => {
    console.log('file',file)
    console.log('file.mimetype',file.mimetype)
    
    const allowedTypes = ['video/mp4', 'video/mkv', 'video/avi']; // Adjust allowed file types

    const extname = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp4', '.mkv', '.avi'];
    
    if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(extname)) {
      const error = new Error('Unsupported file type');
      error.code = 'LIMIT_UNEXPECTED_FILE';
      return cb(error, false);  // Reject the file
    }
    cb(null, true); // Accept the file
  };
  
  // Create the upload instance
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter, // Apply the file filter
    limits: { fileSize: 1024 * 1024 * 1024 },
  }).single('file');



  app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        console.log('Upload error:', err.message);
        return res.status(400).send({ message: err.message });
      }
      console.log('Uploaded file:', req.file);
      res.status(200).send({ message: 'File uploaded successfully' });
    });
  });



// // API to handle file uploads
// app.post("/upload", upload.single("file"), (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         // Respond with file details
//         res.status(200).json({
//             message: "File uploaded successfully",
//             file: {
//                 name: req.file.filename,
//                 path: `/uploads/${req.file.filename}`,
//                 size: req.file.size,
//             },
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "File upload failed", error: error.message });
//     }
// });

// API to fetch uploaded files
app.get("/files", (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: "Unable to fetch files" });
        }
        res.status(200).json({ files });
    });
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
