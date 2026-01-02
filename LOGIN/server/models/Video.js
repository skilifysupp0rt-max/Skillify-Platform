const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Video Progress - tracks which videos user has completed
const VideoProgress = sequelize.define('VideoProgress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    videoId: {
        type: DataTypes.STRING, // YouTube video ID
        allowNull: false
    },
    courseFile: {
        type: DataTypes.STRING, // e.g., 'web.html', 'ai.html'
        allowNull: false
    },
    moduleIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    watchedPercent: {
        type: DataTypes.INTEGER, // 0-100
        defaultValue: 0
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Video Likes
const VideoLike = sequelize.define('VideoLike', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    videoId: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Video Comments
const VideoComment = sequelize.define('VideoComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    videoId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

module.exports = { VideoProgress, VideoLike, VideoComment };
