const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { upload, uploadImage } = require('../controllers/uploadController');

router.post('/', requireAuth, upload.single('image'), uploadImage);

module.exports = router;