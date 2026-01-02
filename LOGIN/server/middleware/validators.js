const { body } = require('express-validator');

exports.registerRules = [
    body('username')
        .trim()
        .isLength({ min: 3 }).withMessage('Username must be 3+ chars')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be alphanumeric'),

    body('email')
        .trim()
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be 6+ chars')
    // .matches(/\d/).withMessage('Password must contain a number') // Strict mode optional
];

exports.loginRules = [
    body('username').trim().notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required')
];

exports.otpRules = [
    body('email').isEmail().withMessage('Invalid email'),
    body('otp').optional().trim().isLength({ min: 4 }).withMessage('Invalid OTP format')
];
