const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    UserId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    plan: {
        type: DataTypes.ENUM('free', 'pro', 'enterprise'),
        defaultValue: 'free'
    },
    status: {
        type: DataTypes.ENUM('active', 'cancelled', 'expired', 'past_due'),
        defaultValue: 'active'
    },
    billingPeriod: {
        type: DataTypes.ENUM('monthly', 'yearly'),
        defaultValue: 'monthly'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
    },
    stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stripeSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paypalSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = Subscription;
