const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { reportItem, listReports, resolveReport } = require('../controllers/reportController');

router.post('/', requireAuth, reportItem);
router.get('/', requireAuth, requireRole('admin'), listReports);
router.put('/:id', requireAuth, requireRole('admin'), resolveReport);

module.exports = router;