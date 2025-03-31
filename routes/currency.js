const express = require('express');
const { getCurrencies, getCurrency, addCurrency, deleteCurrency, updateCurrency} = require('../controllers/currency_controller')
const router = express.Router();

// Routes
router.get('/', getCurrencies);

router.get('/:id', getCurrency);

router.post('/', addCurrency);

router.delete('/:id', deleteCurrency);

router.put('/:id', updateCurrency);

module.exports = router;