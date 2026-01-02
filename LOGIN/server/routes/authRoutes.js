const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const { validate } = require('../middleware/validation');
const { registerRules, loginRules, otpRules } = require('../middleware/validators');

// Auth Endpoints
router.post('/send-otp', otpRules, validate, authController.sendOtp);
router.post('/register', registerRules, validate, authController.register);
router.post('/verify-otp', otpRules, validate, authController.verifyOtp);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/user', authController.getCurrentUser);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect('/dashboard.html');
    }
);

module.exports = router;
