function isAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized. Please login.' });
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Access denied. Admins only.' });
}

module.exports = { isAuthenticated, isAdmin };
