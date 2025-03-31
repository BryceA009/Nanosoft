const express = require('express');
const {getSettings, updateSettings} = require('../controllers/settings_controller');
const router = express.Router();

// Routes
router.get('/', getSettings);

router.put('/', updateSettings);

module.exports = router;