
const customers = require('./routes/customers');
const invoices = require('./routes/invoices');
const settings = require('./routes/settings');
const status = require('./routes/status');
const currency = require('./routes/currency');
const invoice_detail = require('./routes/invoice_details');

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

app.use(express.static('public'))
// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'postgres', // Replace with your database name
    password: 'BryceA09', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

// Test the database connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Error connecting to PostgreSQL:', err));
app.use(express.json()); // Middleware to parse JSON bodies

// Routes will go here

//Get customers
app.use('/api/customers', customers);
app.use('/api/invoices', invoices);
app.use('/api/settings', settings);
app.use('/api/status', status);
app.use('/api/currency', currency);
app.use('/api/invoice_detail', invoice_detail);


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
