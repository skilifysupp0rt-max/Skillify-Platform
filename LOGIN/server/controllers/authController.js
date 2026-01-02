const bcrypt = require('bcrypt');
const passport = require('passport');
const { User, sequelize } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

const OTP_EXPIRES_SEC = 600; // Increased to 10 mins

// Helper: Generate OTP
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// --- CONTROLLERS ---

// In-memory OTP Store for Pre-registration
const otpStore = new Map();

exports.sendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        // check if user already exists
        const existing = await User.findOne({ where: { email } });
        if (existing && existing.isVerified) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const otp = generateOtp();
        const expiresAt = Date.now() + OTP_EXPIRES_SEC * 1000;

        otpStore.set(email, { otp, expiresAt, verified: false });

        // Use Service
        await emailService.sendOtpEmail(email, otp);

        res.json({ message: 'OTP sent', expiresInSec: OTP_EXPIRES_SEC });
    } catch (err) { next(err); }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Check In-Memory first (Pre-registration)
        const stored = otpStore.get(email);
        if (stored) {
            if (Date.now() > stored.expiresAt) {
                otpStore.delete(email);
                return res.status(400).json({ message: 'OTP Expired' });
            }
            if (stored.otp === String(otp).trim()) {
                stored.verified = true;
                otpStore.set(email, stored); // Update state
                return res.json({ message: 'Verified', verified: true });
            }
        }

        // Fallback: Check Database (Post-registration verification?)
        // Keeping old logic just in case, but frontend seems to use pre-reg.
        const user = await User.findOne({ where: { email } });
        if (user) {
            if (user.otpSecret === String(otp).trim()) {
                user.isVerified = true;
                user.otpSecret = null;
                await user.save();
                return res.json({ message: 'Verified', verified: true });
            }
        }

        return res.status(400).json({ message: 'Invalid OTP' });
    } catch (err) { next(err); }
};

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if verified in otpStore
        const stored = otpStore.get(email);
        const isPreVerified = stored && stored.verified === true;

        const existing = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
        if (existing) return res.status(409).json({ message: 'Username or Email exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            passwordHash: hashedPassword,
            isVerified: isPreVerified ? true : false
        });

        // Clear OTP store
        if (isPreVerified) otpStore.delete(email);

        // If NOT pre-verified (legacy flow), maybe send email? 
        // But current frontend enforces pre-verification.

        res.json({ message: 'Account created!', userId: newUser.id });
    } catch (err) { next(err); }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || 'Login failed' });

        req.logIn(user, async (err) => {
            if (err) return next(err);

            // Streak Logic
            const now = new Date();
            const last = new Date(user.lastLoginDate);
            const diffTime = Math.abs(now - last);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.streak += 1;
            } else if (diffDays > 1) {
                user.streak = 1;
            }
            // If 0 days (same day), keep streak

            user.lastLoginDate = now;
            await user.save();

            return res.json({
                message: 'Logged In ✅',
                username: user.username,
                verified: user.isVerified,
                streak: user.streak
            });
        });
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out' });
    });
};

exports.getCurrentUser = (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        verified: req.user.isVerified,
        xp: req.user.xp,
        level: req.user.level,
        streak: req.user.streak,
        focusHours: req.user.focusHours,
        courseProgress: req.user.courseProgress || {},
        role: req.user.role // Exposed for Admin Check
    });
};
