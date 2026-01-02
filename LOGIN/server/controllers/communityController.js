const { Post, User } = require('../models');

exports.getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Post.findAndCountAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['username', 'id', 'avatar'] }], // Added avatar to include
            limit,
            offset
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            posts: rows
        });
    } catch (err) {
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const { content } = req.body;
        const username = req.user.username;
        const initials = username.substring(0, 2).toUpperCase();

        const post = await Post.create({
            content,
            authorName: username,
            authorInitials: initials,
            UserId: req.user.id
        });

        // Return with user info
        const fullPost = await Post.findByPk(post.id, {
            include: [{ model: User, attributes: ['username'] }]
        });

        res.json(fullPost);
    } catch (err) {
        next(err);
    }
};
