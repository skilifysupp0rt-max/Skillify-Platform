const { sequelize } = require('./models');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Dropping Users_backup table...');
        await sequelize.query("DROP TABLE IF EXISTS Users_backup;");
        console.log('Users_backup dropped.');

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

fix();
