const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Enable CORS for frontend interaction
app.use(cors());

// Configure the storage and file filter
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = '/tmp'; // Use temporary directory
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
    console.log('file', file);
    console.log('file.mimetype', file.mimetype);

    const allowedTypes = ['video/mp4', 'video/mkv', 'video/avi']; // Adjust allowed file types

    const extname = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp4', '.mkv', '.avi'];

    if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(extname)) {
        const error = new Error('Unsupported file type');
        error.code = 'LIMIT_UNEXPECTED_FILE';
        return cb(error, false); // Reject the file
    }
    cb(null, true); // Accept the file
};

// Create the upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter, // Apply the file filter
    limits: { fileSize: 1024 * 1024 * 1024 }, // Set file size limit
}).single('file');

// Endpoint to handle file uploads
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log('Upload error:', err.message);
            return res.status(400).send({ message: err.message });
        }

        console.log('Uploaded file:', req.file);

        // Respond with file details
        res.status(200).send({
            message: 'File uploaded successfully',
            file: {
                name: req.file.filename,
                path: `/tmp/${req.file.filename}`,
                size: req.file.size,
            },
        });
    });
});

// Serve static files in /tmp directory for testing (optional, for local use only)
app.use('/tmp', express.static('/tmp'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
