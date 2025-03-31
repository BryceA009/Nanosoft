const express = require('express');
const { getStatuses, getStatus, addStatus, deleteStatus, updateStatus } = require('../controllers/status_controller');
const router = express.Router();

// Routes
router.get('/', getStatuses);

router.get('/:id', getStatus);

router.post('/', addStatus);

router.delete('/:id', deleteStatus);

router.put('/:id', updateStatus);

module.exports = router;