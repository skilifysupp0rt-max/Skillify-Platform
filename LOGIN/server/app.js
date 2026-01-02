require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize } = require('./models');

// Initialize App
const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://unpkg.com",
                "https://cdn.jsdelivr.net",
                "https://cdn.socket.io",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrcAttr: ["'unsafe-inline'"], // For onclick handlers
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://unpkg.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            styleSrcElem: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://unpkg.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://unpkg.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'", "https:", "wss:", "ws:"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Stricter rate limiting for login attempts (5 per minute)
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { message: 'Too many login attempts. Please try again after 1 minute.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/auth/login', loginLimiter);

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'skillify_secret_key_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Static Files
// Serve LOGIN directory (index.html, etc)
app.use(express.static(path.join(__dirname, '..')));
// Serve PUBLIC directory (dashboard.html, assets)
// Serve PUBLIC directory (dashboard.html, assets)
app.use(express.static(path.join(__dirname, '../../public')));
// Serve UPLOADS directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/apiRoutes'));
app.use('/api/video', require('./routes/videoRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Database Sync - Regular sync preserves data
sequelize.sync()
    .then(() => console.log('Database synced (SQLite) ✅'))
    .catch(err => console.error('Database sync failed ❌', err));

// 404 Handler - Must be after all routes
app.use((req, res, next) => {
    // For API requests, return JSON
    if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
        return res.status(404).json({ message: 'Not Found' });
    }
    // For page requests, serve custom 404 page
    res.status(404).sendFile(path.join(__dirname, '../../public/404.html'));
});

// Global Error Handler (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    // For API requests, return JSON
    if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
    // For page requests, serve custom 500 page
    res.status(500).sendFile(path.join(__dirname, '../../public/500.html'));
});

module.exports = app;
