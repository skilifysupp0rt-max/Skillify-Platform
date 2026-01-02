const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.addFocusHours = async (req, res, next) => {
    try {
        const { hours } = req.body;
        const user = await User.findByPk(req.user.id);
        if (user) {
            user.focusHours = (user.focusHours || 0) + Number(hours);
            await user.save();
            res.json({ message: 'Focus stored', focusHours: user.focusHours });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        next(err);
    }
};

exports.updateXP = async (req, res, next) => {
    try {
        const { xp } = req.body;
        const user = await User.findByPk(req.user.id);

        if (user) {
            user.xp = xp;
            user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
            await user.save();
            res.json({ message: 'XP updated', xp: user.xp, level: user.level });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        next(err);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'xp', 'level', 'streak', 'focusHours', 'isVerified', 'avatar', 'bio', 'location', 'website']
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, bio, location, website } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username) user.username = username;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (website !== undefined) user.website = website;

        await user.save();
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify current password (if user has one - Google auth users might not)
        if (user.passwordHash) {
            const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.destroy();

        req.logout((err) => {
            if (err) console.error('Logout error:', err);
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const avatarPath = '/uploads/avatars/' + req.file.filename;

        user.avatar = avatarPath;
        await user.save();

        res.json({ message: 'Avatar updated', avatar: avatarPath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

