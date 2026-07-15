const express = require('express');
const router = express.Router();
const { listNotifications, clearAllNotifications } = require('../controllers/notificationController');

router.get('/', listNotifications);
router.post('/clear', clearAllNotifications);

module.exports = router;
