const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
    dateKey: {
        type: DataTypes.STRING, // Format: YYYY-M-D
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Event;
