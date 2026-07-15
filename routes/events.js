const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { listEvents, createNewEvent, editEvent, removeEvent } = require('../controllers/eventController');

router.get('/', requireAuth, listEvents);
router.post('/', requireAuth, requireRole('admin'), createNewEvent);
router.put('/:id', requireAuth, requireRole('admin'), editEvent);
router.delete('/:id', requireAuth, requireRole('admin'), removeEvent);

module.exports = router;