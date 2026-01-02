const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Cache user details to avoid complex joins every time if desired, 
    // but better to rely on associations. We'll store some for simplicity.
    authorName: {
        type: DataTypes.STRING
    },
    authorInitials: {
        type: DataTypes.STRING
    },
    avatarColor: {
        type: DataTypes.STRING,
        defaultValue: '#6366f1'
    }
});

module.exports = Post;
