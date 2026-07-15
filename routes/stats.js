const express = require('express');
const router = express.Router();
const { stats } = require('../controllers/statsController');

router.get('/', stats);

module.exports = router;
