const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.STRING, // 'user', 'admin'
        defaultValue: 'user'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    googleId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    focusHours: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    lastLoginDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    courseProgress: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    otpSecret: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = User;
