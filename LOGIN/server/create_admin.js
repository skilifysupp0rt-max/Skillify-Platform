const { Sequelize } = require('sequelize');
const path = require('path');
const { User } = require('./models');

// Setup standalone DB connection
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

const username = process.argv[2];

if (!username) {
    console.error('❌ Please provide a username.');
    console.error('Usage: node create_admin.js <username>');
    process.exit(1);
}

const promote = async () => {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.error(`❌ User '${username}' not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();
        console.log(`\n✅ SUCCESS: User '${username}' is now an ADMIN!`);
        console.log('👉 You can now access the Admin Dashboard at: http://localhost:5000/admin.html');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

promote();
