const { Sequelize } = require('sequelize');
const path = require('path');
const { User } = require('./models');

// Setup standalone DB connection
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

const listAdmins = async () => {
    try {
        await sequelize.authenticate();
        const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: ['id', 'username', 'email', 'createdAt']
        });

        console.log('\n🛡️  CURRENT ADMINS:');
        console.log('--------------------------------------------------');
        if (admins.length === 0) {
            console.log('No admins found.');
        } else {
            admins.forEach(admin => {
                console.log(`[${admin.id}] ${admin.username} (${admin.email})`);
                console.log(`    Promoted: ${new Date(admin.createdAt).toLocaleDateString()}`);
                console.log('--------------------------------------------------');
            });
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

listAdmins();
