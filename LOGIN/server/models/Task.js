const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('todo', 'doing', 'done'),
        defaultValue: 'todo'
    },
    tag: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    dueDate: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Task;
