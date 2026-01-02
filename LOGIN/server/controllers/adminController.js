const { User, Post, Task, VideoProgress, Subscription } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.count();
        const totalPosts = await Post.count();
        const totalTasks = await Task.count();
        const totalVideosWatched = await VideoProgress.count({ where: { completed: true } });

        // Active today (users logged in within last 24h)
        const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
        const activeUsers = await User.count({
            where: { lastLoginDate: { [Op.gt]: oneDayAgo } }
        });

        // Subscriptions
        const proMembers = await Subscription.count({ where: { plan: 'pro', status: 'active' } });
        const enterpriseMembers = await Subscription.count({ where: { plan: 'enterprise', status: 'active' } });

        // Revenue (sum of all active subscriptions)
        const subscriptions = await Subscription.findAll({
            where: { status: 'active' },
            attributes: ['amount']
        });
        const totalRevenue = subscriptions.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

        // New users this week
        const oneWeekAgo = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = await User.count({
            where: { createdAt: { [Op.gt]: oneWeekAgo } }
        });

        res.json({
            users: totalUsers,
            posts: totalPosts,
            tasks: totalTasks,
            videosWatched: totalVideosWatched,
            activeNow: activeUsers,
            proMembers,
            enterpriseMembers,
            totalRevenue: totalRevenue.toFixed(2),
            newUsersThisWeek,
            serverStatus: 'Online',
            uptime: process.uptime()
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            attributes: ['id', 'username', 'email', 'role', 'xp', 'level', 'lastLoginDate', 'isVerified'],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            users: rows
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent deleting self or other admins (optional safety)
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin accounts via API' });
        }

        await user.destroy();
        res.json({ message: 'User banned/deleted successfully' });
    } catch (err) {
        next(err);
    }
};

exports.getSystemActivity = async (req, res, next) => {
    try {
        const users = await User.findAll({ limit: 5, order: [['createdAt', 'DESC']], attributes: ['username', 'createdAt'] });
        const posts = await Post.findAll({ limit: 5, order: [['createdAt', 'DESC']], include: { model: User, attributes: ['username'] } });
        const tasks = await Task.findAll({ limit: 5, order: [['createdAt', 'DESC']], include: { model: User, attributes: ['username'] } });

        const activity = [
            ...users.map(u => ({ type: 'USER', msg: `New user joined: ${u.username}`, time: u.createdAt, user: u.username })),
            ...posts.map(p => ({ type: 'POST', msg: `New post by ${p.User ? p.User.username : 'Unknown'}`, time: p.createdAt, user: p.User ? p.User.username : '?' })),
            ...tasks.map(t => ({ type: 'TASK', msg: `Task created by ${t.User ? t.User.username : 'Unknown'}`, time: t.createdAt, user: t.User ? t.User.username : '?' }))
        ];

        activity.sort((a, b) => new Date(b.time) - new Date(a.time));
        res.json(activity.slice(0, 20));
    } catch (err) {
        next(err);
    }
};

// Promote user to admin
exports.promoteUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'User is already an admin' });

        user.role = 'admin';
        await user.save();

        res.json({ message: `${user.username} is now an admin!` });
    } catch (err) {
        next(err);
    }
};

// Demote admin to user
exports.demoteUser = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'admin') return res.status(400).json({ message: 'User is not an admin' });

        // Prevent self-demotion
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot demote yourself' });
        }

        user.role = 'user';
        await user.save();

        res.json({ message: `${user.username} is no longer an admin` });
    } catch (err) {
        next(err);
    }
};

// Send message to single user (via email if configured)
exports.sendMessage = async (req, res, next) => {
    try {
        const { email, subject, message } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Try to send email if transporter exists
        const transporter = req.app.get('emailTransporter');
        if (transporter) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'admin@skillify.com',
                to: email,
                subject: subject,
                html: `<h2>${subject}</h2><p>${message}</p><hr><p>- Skillify Admin</p>`
            });
            res.json({ message: `Email sent to ${email}` });
        } else {
            // Fallback: just log and confirm
            console.log(`[ADMIN MESSAGE] To: ${email}, Subject: ${subject}`);
            res.json({ message: `Message logged for ${email} (email not configured)` });
        }
    } catch (err) {
        next(err);
    }
};

// Broadcast to all users
exports.sendBroadcast = async (req, res, next) => {
    try {
        const { subject, message } = req.body;
        const users = await User.findAll({ attributes: ['email'] });

        const transporter = req.app.get('emailTransporter');
        let sentCount = 0;

        if (transporter) {
            for (const user of users) {
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER || 'admin@skillify.com',
                        to: user.email,
                        subject: `[Skillify] ${subject}`,
                        html: `<h2>${subject}</h2><p>${message}</p><hr><p>- Skillify Team</p>`
                    });
                    sentCount++;
                } catch (e) {
                    console.error(`Failed to send to ${user.email}:`, e.message);
                }
            }
            res.json({ message: `Broadcast sent to ${sentCount}/${users.length} users` });
        } else {
            console.log(`[BROADCAST] Subject: ${subject}, Would send to ${users.length} users`);
            res.json({ message: `Broadcast logged for ${users.length} users (email not configured)` });
        }
    } catch (err) {
        next(err);
    }
};

// ============ REAL ANALYTICS ============
exports.getAnalytics = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date(new Date() - days * 24 * 60 * 60 * 1000);

        // Registration data by day
        const users = await User.findAll({
            where: { createdAt: { [Op.gt]: startDate } },
            attributes: ['createdAt']
        });

        // Group by date
        const registrationsByDay = {};
        users.forEach(u => {
            const day = u.createdAt.toISOString().split('T')[0];
            registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
        });

        // Video completions
        const videoProgress = await VideoProgress.findAll({
            where: { completedAt: { [Op.gt]: startDate }, completed: true },
            attributes: ['completedAt']
        });

        const completionsByDay = {};
        videoProgress.forEach(v => {
            if (v.completedAt) {
                const day = v.completedAt.toISOString().split('T')[0];
                completionsByDay[day] = (completionsByDay[day] || 0) + 1;
            }
        });

        res.json({
            registrations: registrationsByDay,
            videoCompletions: completionsByDay,
            totalNewUsers: users.length,
            totalCompletions: videoProgress.length
        });
    } catch (err) {
        next(err);
    }
};

// ============ REAL LEADERBOARD ============
exports.getLeaderboard = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'xp', 'level', 'streak', 'focusHours', 'avatar'],
            order: [['xp', 'DESC']],
            limit: 50
        });

        // Get video completion counts for each user
        const leaderboard = await Promise.all(users.map(async (user, index) => {
            const videosCompleted = await VideoProgress.count({
                where: { UserId: user.id, completed: true }
            });
            const postsCount = await Post.count({ where: { UserId: user.id } });

            return {
                rank: index + 1,
                id: user.id,
                username: user.username,
                xp: user.xp || 0,
                level: user.level || 1,
                streak: user.streak || 0,
                focusHours: user.focusHours || 0,
                videosCompleted,
                postsCount,
                avatar: user.avatar
            };
        }));

        res.json(leaderboard);
    } catch (err) {
        next(err);
    }
};

// ============ REAL PAYMENTS/SUBSCRIPTIONS ============
exports.getPayments = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.findAll({
            include: { model: User, attributes: ['username', 'email'] },
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        // Calculate totals
        const totalRevenue = subscriptions.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
        const activeCount = subscriptions.filter(s => s.status === 'active').length;

        res.json({
            subscriptions: subscriptions.map(s => ({
                id: s.id,
                user: s.User ? s.User.username : 'Unknown',
                email: s.User ? s.User.email : 'Unknown',
                plan: s.plan,
                status: s.status,
                amount: s.amount,
                billingPeriod: s.billingPeriod,
                startDate: s.startDate,
                endDate: s.endDate
            })),
            totalRevenue: totalRevenue.toFixed(2),
            activeSubscriptions: activeCount
        });
    } catch (err) {
        next(err);
    }
};

// ============ GET USER DETAILS ============
exports.getUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get all user activity
        const videosCompleted = await VideoProgress.count({ where: { UserId: id, completed: true } });
        const videosInProgress = await VideoProgress.count({ where: { UserId: id, completed: false } });
        const posts = await Post.count({ where: { UserId: id } });
        const tasks = await Task.count({ where: { UserId: id } });
        const subscription = await Subscription.findOne({ where: { UserId: id, status: 'active' } });

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            focusHours: user.focusHours,
            isVerified: user.isVerified,
            lastLoginDate: user.lastLoginDate,
            createdAt: user.createdAt,
            avatar: user.avatar,
            activity: {
                videosCompleted,
                videosInProgress,
                posts,
                tasks
            },
            subscription: subscription ? {
                plan: subscription.plan,
                status: subscription.status,
                startDate: subscription.startDate
            } : null
        });
    } catch (err) {
        next(err);
    }
};
