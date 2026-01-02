const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User Routes
router.get('/profile', isAuthenticated, userController.getProfile);
router.put('/update-profile', isAuthenticated, userController.updateProfile);
router.put('/change-password', isAuthenticated, userController.changePassword);
router.delete('/delete-account', isAuthenticated, userController.deleteAccount);
router.post('/xp', isAuthenticated, userController.updateXP);
router.put('/xp', isAuthenticated, userController.updateXP);
router.post('/focus', isAuthenticated, userController.addFocusHours);
router.post('/avatar', isAuthenticated, upload.single('avatar'), userController.uploadAvatar);
router.post('/upload-avatar', isAuthenticated, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;

