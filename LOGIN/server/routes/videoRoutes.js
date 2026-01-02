const express = require('express');
const router = express.Router();
const { VideoProgress, VideoLike, VideoComment } = require('../models/Video');
const { User } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

// ===== VIDEO PROGRESS =====

// Mark video as completed
router.post('/progress', isAuthenticated, async (req, res) => {
    try {
        const { videoId, courseFile, moduleIndex, watchedPercent } = req.body;
        const completed = watchedPercent >= 90; // 90%+ = completed

        const [progress, created] = await VideoProgress.findOrCreate({
            where: { UserId: req.user.id, videoId },
            defaults: { courseFile, moduleIndex, watchedPercent, completed, completedAt: completed ? new Date() : null }
        });

        if (!created) {
            progress.watchedPercent = Math.max(progress.watchedPercent, watchedPercent);
            if (watchedPercent >= 90 && !progress.completed) {
                progress.completed = true;
                progress.completedAt = new Date();
            }
            await progress.save();
        }

        // Award XP for completion
        if (completed && created) {
            const user = await User.findByPk(req.user.id);
            if (user) {
                user.xp = (user.xp || 0) + 100; // +100 XP per video
                user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
                await user.save();
            }
        }

        res.json({
            message: completed ? 'Video completed! +100 XP' : 'Progress saved',
            progress,
            nextUnlocked: completed
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's video progress
router.get('/progress', isAuthenticated, async (req, res) => {
    try {
        const progress = await VideoProgress.findAll({
            where: { UserId: req.user.id }
        });
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get progress for specific course
router.get('/progress/:courseFile', isAuthenticated, async (req, res) => {
    try {
        const progress = await VideoProgress.findAll({
            where: { UserId: req.user.id, courseFile: req.params.courseFile }
        });
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== LIKES =====

// Toggle like
router.post('/like', isAuthenticated, async (req, res) => {
    try {
        const { videoId } = req.body;
        const existing = await VideoLike.findOne({
            where: { UserId: req.user.id, videoId }
        });

        if (existing) {
            await existing.destroy();
            res.json({ liked: false });
        } else {
            await VideoLike.create({ UserId: req.user.id, videoId });
            res.json({ liked: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get like count for video
router.get('/likes/:videoId', async (req, res) => {
    try {
        const count = await VideoLike.count({
            where: { videoId: req.params.videoId }
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check if user liked video
router.get('/liked/:videoId', isAuthenticated, async (req, res) => {
    try {
        const like = await VideoLike.findOne({
            where: { UserId: req.user.id, videoId: req.params.videoId }
        });
        res.json({ liked: !!like });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== COMMENTS =====

// Add comment
router.post('/comment', isAuthenticated, async (req, res) => {
    try {
        const { videoId, content } = req.body;
        const comment = await VideoComment.create({
            UserId: req.user.id,
            videoId,
            content
        });
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get comments for video
router.get('/comments/:videoId', async (req, res) => {
    try {
        const comments = await VideoComment.findAll({
            where: { videoId: req.params.videoId },
            include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete comment (owner only)
router.delete('/comment/:id', isAuthenticated, async (req, res) => {
    try {
        const comment = await VideoComment.findByPk(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.UserId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await comment.destroy();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== DASHBOARD STATS =====

// Get comprehensive dashboard stats
router.get('/dashboard-stats', isAuthenticated, async (req, res) => {
    try {
        // Get all user's video progress
        const progress = await VideoProgress.findAll({
            where: { UserId: req.user.id }
        });

        // Calculate per-course stats
        const courseStats = {};
        const courseTotals = {
            'web.html': 9,
            'game.html': 6,
            'pan.html': 6,
            'design.html': 6,
            'cv.html': 6,
            'management.html': 6,
            'ai.html': 6
        };

        for (const [file, total] of Object.entries(courseTotals)) {
            const completed = progress.filter(p => p.courseFile === file && p.completed).length;
            courseStats[file] = {
                total,
                completed,
                percent: Math.round((completed / total) * 100)
            };
        }

        // Calculate overall stats
        const totalVideos = Object.values(courseTotals).reduce((a, b) => a + b, 0);
        const completedVideos = progress.filter(p => p.completed).length;
        const overallPercent = Math.round((completedVideos / totalVideos) * 100);

        // Get activity data for heatmap (last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const recentProgress = progress.filter(p =>
            p.completedAt && new Date(p.completedAt) >= ninetyDaysAgo
        );

        const activityMap = {};
        recentProgress.forEach(p => {
            const date = new Date(p.completedAt).toISOString().split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        res.json({
            courseStats,
            overall: {
                totalVideos,
                completedVideos,
                percent: overallPercent
            },
            activity: activityMap,
            totalLikes: await VideoLike.count({ where: { UserId: req.user.id } }),
            totalComments: await VideoComment.count({ where: { UserId: req.user.id } })
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

