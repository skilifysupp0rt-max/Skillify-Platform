const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const Post = require('./Post');
const Event = require('./Event');
const { VideoProgress, VideoLike, VideoComment } = require('./Video');
const Subscription = require('./Subscription');

// Associations
User.hasMany(Task, { onDelete: 'CASCADE' });
Task.belongsTo(User);

User.hasMany(Post, { onDelete: 'CASCADE' });
Post.belongsTo(User);

User.hasMany(Event, { onDelete: 'CASCADE' });
Event.belongsTo(User);

// Video associations
User.hasMany(VideoProgress, { onDelete: 'CASCADE' });
VideoProgress.belongsTo(User);

User.hasMany(VideoLike, { onDelete: 'CASCADE' });
VideoLike.belongsTo(User);

User.hasMany(VideoComment, { onDelete: 'CASCADE' });
VideoComment.belongsTo(User);

// Subscription associations
User.hasMany(Subscription, { onDelete: 'CASCADE' });
Subscription.belongsTo(User);

module.exports = {
    sequelize,
    User,
    Task,
    Post,
    Event,
    VideoProgress,
    VideoLike,
    VideoComment,
    Subscription
};

