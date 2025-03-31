const express = require('express');
const {getInvoices, getInvoice, addInvoice, deleteInvoice, updateInvoice} = require('../controllers/invoice_controller');
const router = express.Router();

// Routes
router.get('/', getInvoices);

router.get('/:id', getInvoice);

router.post('/', addInvoice);

router.delete('/:id', deleteInvoice);

router.put('/:id', updateInvoice);

module.exports = router;