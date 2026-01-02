const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// Temporary Promoter (Delete in production)
router.post('/promote-self', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            req.user.role = 'admin';
            await req.user.save();
            res.json({ message: 'You are now an Admin! Refresh the page.' });
        } else {
            res.status(401).json({ message: 'Login first' });
        }
    } catch (e) { res.status(500).json(e); }
});

// All routes below require admin role
router.use(isAdmin);

// Stats & Data
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/activity', adminController.getSystemActivity);

// Real Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/leaderboard', adminController.getLeaderboard);
router.get('/payments', adminController.getPayments);
router.get('/users/:id/details', adminController.getUserDetails);

// User Management
router.delete('/users/:id', adminController.deleteUser);

// Role Management
router.post('/promote', adminController.promoteUser);
router.post('/demote', adminController.demoteUser);

// Messaging
router.post('/message', adminController.sendMessage);
router.post('/broadcast', adminController.sendBroadcast);

module.exports = router;

