const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const kanbanController = require('../controllers/kanbanController');
const communityController = require('../controllers/communityController');
const calendarController = require('../controllers/calendarController');

// All routes here need auth
router.use(isAuthenticated);

// Kanban
router.get('/kanban', kanbanController.getTasks);
router.post('/kanban', kanbanController.createTask);
router.put('/kanban/:id', kanbanController.updateTask);
router.delete('/kanban/:id', kanbanController.deleteTask);

// Community
router.get('/community', communityController.getPosts);
router.post('/community', communityController.createPost);

// Calendar
router.get('/calendar', calendarController.getEvents);
router.post('/calendar', calendarController.saveEvent);

module.exports = router;
