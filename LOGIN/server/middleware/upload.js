const multer = require('multer');
const path = require('path');

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/'); // Save to uploads/avatars
    },
    filename: (req, file, cb) => {
        // Filename: user-{id}-{timestamp}.ext
        // We use req.user.id if available, otherwise just timestamp
        const userId = req.user ? req.user.id : 'guest';
        const ext = path.extname(file.originalname);
        cb(null, `user-${userId}-${Date.now()}${ext}`);
    }
});

// File Filter (Images Only)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: fileFilter
});

module.exports = upload;
