const express = require('express');
const { getCustomers, getCustomersLike, getTotalCustomers, getCustomer, addCustomer, clearCustomers,  addTestCustomers, deleteCustomer, updateCustomer } = require('../controllers/customer_controller');
const router = express.Router();

// Routes
router.get('/', getCustomers);

router.get('/like', getCustomersLike);

router.get('/count', getTotalCustomers);

router.get('/:id', getCustomer);

router.post('/', addCustomer);

router.post('/test', addTestCustomers)

router.delete('/clear', clearCustomers);

router.delete('/:id', deleteCustomer);

router.put('/:id', updateCustomer);

module.exports = router;