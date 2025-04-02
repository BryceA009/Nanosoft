const express = require('express');
const { getCustomers, getCustomersLike, getCustomer, addCustomer, deleteCustomer, updateCustomer } = require('../controllers/customer_controller');
const router = express.Router();

// Routes
router.get('/', getCustomers);

router.get('/like', getCustomersLike);

router.get('/:id', getCustomer);

router.post('/', addCustomer);

router.delete('/:id', deleteCustomer);

router.put('/:id', updateCustomer);

module.exports = router;