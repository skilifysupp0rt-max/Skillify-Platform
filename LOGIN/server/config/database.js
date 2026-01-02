const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'), // Stored in the root of LOGIN folder or project root
    logging: false // Disable SQL logging to console
});

module.exports = sequelize;
