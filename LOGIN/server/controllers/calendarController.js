const { Event } = require('../models');

exports.getEvents = async (req, res, next) => {
    try {
        const events = await Event.findAll({ where: { UserId: req.user.id } });
        // Transform to simple key-value object if frontend expects that, or list
        // Frontend expects: { "2025-12-25": "Holiday", ... }
        const eventMap = {};
        events.forEach(e => {
            eventMap[e.dateKey] = e.title;
        });
        res.json(eventMap);
    } catch (err) {
        next(err);
    }
};

exports.saveEvent = async (req, res, next) => {
    try {
        const { dateKey, title } = req.body;
        // Check if exists
        let event = await Event.findOne({ where: { dateKey, UserId: req.user.id } });
        if (title === '') {
            if (event) await event.destroy();
            return res.json({ message: 'Event deleted' });
        }

        if (event) {
            event.title = title;
            await event.save();
        } else {
            await Event.create({ dateKey, title, UserId: req.user.id });
        }
        res.json({ message: 'Event saved' });
    } catch (err) {
        next(err);
    }
};
