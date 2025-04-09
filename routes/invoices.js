const express = require('express');
const {getInvoices, getInvoice, getTotalInvoices, addInvoice, clearInvoices, deleteInvoice, updateInvoice, addTestInvoices} = require('../controllers/invoice_controller');
const router = express.Router();

// Routes
router.get('/', getInvoices);

router.get('/count', getTotalInvoices);

router.get('/:id', getInvoice);

router.post('/', addInvoice);

router.post('/test', addTestInvoices);

router.delete('/clear', clearInvoices);

router.delete('/:id', deleteInvoice);

router.put('/:id', updateInvoice);



module.exports = router;