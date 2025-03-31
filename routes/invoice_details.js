const express = require('express');
const { getInvoiceDetails, getInvoiceDetail, addInvoiceDetail, deleteInvoiceDetail, updateInvoiceDetail } = require('../controllers/invoice_details_controller');
const router = express.Router();

// Routes
router.get('/', getInvoiceDetails);

router.get('/:id', getInvoiceDetail);

router.post('/', addInvoiceDetail);

router.delete('/:id', deleteInvoiceDetail);

router.put('/:id', updateInvoiceDetail);

module.exports = router;