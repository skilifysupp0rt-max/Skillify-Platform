// Promote Skillify Support to admin
const { User } = require('./models');

async function run() {
    const users = await User.findAll({ attributes: ['id', 'username', 'role'] });
    console.log('Current users:', users.map(u => `${u.username} (${u.role})`).join(', '));

    // Try to find Skillify Support
    const support = users.find(u => u.username.toLowerCase().includes('skillify') || u.username.toLowerCase().includes('support'));

    if (support) {
        support.role = 'admin';
        await support.save();
        console.log(`✅ ${support.username} is now admin!`);
    } else {
        console.log('❌ Skillify Support not found. Making all users admin...');
        for (const u of users) {
            u.role = 'admin';
            await u.save();
            console.log(`✅ ${u.username} is now admin`);
        }
    }
    process.exit(0);
}

run();
