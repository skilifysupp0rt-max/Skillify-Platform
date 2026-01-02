const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return only the first error message for simplicity or all of them
        const extractedErrors = errors.array().map(err => err.msg);
        return res.status(400).json({
            message: extractedErrors[0], // Send first error as toast message
            errors: extractedErrors
        });
    }
    next();
};

module.exports = { validate };
