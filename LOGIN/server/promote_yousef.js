// Script to promote a user to admin by username or email
const { User } = require('./models');

async function promoteYousef() {
    try {
        // Find user by username (case insensitive)
        const user = await User.findOne({
            where: { username: 'Yousef' }
        }) || await User.findOne({
            where: { username: 'yousef' }
        });

        if (!user) {
            // Try to find any user and make them admin
            const anyUser = await User.findOne();
            if (anyUser) {
                anyUser.role = 'admin';
                await anyUser.save();
                console.log(`✅ Made ${anyUser.username} (${anyUser.email}) an admin!`);
            } else {
                console.log('❌ No users found in database');
            }
            return;
        }

        user.role = 'admin';
        await user.save();
        console.log(`✅ ${user.username} is now an admin!`);
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}

promoteYousef();
