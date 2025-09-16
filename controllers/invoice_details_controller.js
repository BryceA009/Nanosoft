const { Pool } = require('pg');
const config = require('../config.js');

// PostgreSQL connection configuration
const pool = new Pool({
    user: config.user, // Replace with your PostgreSQL username
    host: config.host,
    database: config.database, // Replace with your database name
    password: config.password, // Replace with your PostgreSQL password
    port: config.port, // Default PostgreSQL port
});


// @desc Get all customers

const getInvoiceDetails = async (req, res, next) => {
    const { invoice_id } = req.query;

    try {
        let query = 'SELECT * FROM invoice_details';
        let params = [];

        if (invoice_id) {
            query += ' WHERE invoice_id = $1';
            params.push(invoice_id);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching invoice details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getInvoiceDetail = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`SELECT * FROM invoice_details where id = ${id}`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching invoice detail:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addInvoiceDetail = async (req, res) => {
    const { description, qty, price, invoice_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO invoice_details (description, qty, price, invoice_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [description, qty, price, invoice_id]
        );
        res.status(201).json(result.rows[0]); // Return the newly created customer
    } catch (err) {
        console.error('Error inserting invoice details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteInvoiceDetail = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`DELETE FROM invoice_details WHERE id = ${id};`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error deleting invoice detail:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const updateInvoiceDetail = async (req, res) => {
    const { description, qty, price, invoice_id } = req.body;
    const id = parseInt(req.params.id); // Extract ID from request params

    try {
        const result = await pool.query(
            `UPDATE invoice_details
             SET 
                 description = COALESCE($1, description), 
                 qty = COALESCE($2, qty), 
                 price = COALESCE($3, price), 
                 invoice_id = COALESCE($4, invoice_id)
             WHERE id = $5
             RETURNING *`,
            [description || null, qty || null, price || null, invoice_id || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice detail not found' });
        }

        res.status(200).json(result.rows[0]); // Return updated customer data
    } catch (err) {
        console.error('Error updating invoice detail:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = { getInvoiceDetails, getInvoiceDetail, addInvoiceDetail, deleteInvoiceDetail, updateInvoiceDetail };