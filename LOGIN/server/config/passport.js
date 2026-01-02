const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = function (passport) {
    // Local Strategy
    passport.use(new LocalStrategy({ usernameField: 'username' }, // or email if preferred, but we support both logic in controller usually or here
        async (username, password, done) => {
            try {
                // Allow login with email OR username
                const { Op } = require('sequelize');
                const user = await User.findOne({
                    where: {
                        [Op.or]: [{ username: username }, { email: username }]
                    }
                });

                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }
                if (!user.isVerified) {
                    return done(null, false, { message: 'Email not verified' });
                }

                const isMatch = await bcrypt.compare(password, user.passwordHash || '');
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                let user = await User.findOne({ where: { googleId: profile.id } });
                if (!user) {
                    user = await User.findOne({ where: { email } }); // Link by email if exists
                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                    } else {
                        user = await User.create({
                            googleId: profile.id,
                            username: profile.displayName,
                            email: email,
                            isVerified: true
                        });
                    }
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
