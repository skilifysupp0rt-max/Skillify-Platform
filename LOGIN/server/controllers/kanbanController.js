const { Task } = require('../models');

exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.findAll({ where: { UserId: req.user.id } });
        res.json(tasks);
    } catch (err) {
        next(err);
    }
};

exports.createTask = async (req, res, next) => {
    try {
        const { title, status, tag, dueDate } = req.body;
        const task = await Task.create({
            title,
            status: status || 'todo',
            tag: tag || 'General',
            dueDate,
            UserId: req.user.id
        });
        res.json(task);
    } catch (err) {
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ where: { id, UserId: req.user.id } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.update(req.body);
        res.json(task);
    } catch (err) {
        next(err);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ where: { id, UserId: req.user.id } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.destroy();
        res.json({ message: 'Task deleted' });
    } catch (err) {
        next(err);
    }
};
