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


const getCurrencies = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM currency');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching currencies:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCurrency = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`SELECT * FROM currency where id = ${id}`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching currency:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addCurrency = async (req, res) => {
    const { name, symbol } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO currency (name, symbol) VALUES ($1, $2) RETURNING *',
            [name, symbol]
        );
        res.status(201).json(result.rows[0]); // Return the newly created customer
    } catch (err) {
        console.error('Error inserting currency:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteCurrency = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`DELETE FROM currency WHERE id = ${id};`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error deleting currency:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const updateCurrency = async (req, res) => {
    const { name, symbol } = req.body;
    const id = parseInt(req.params.id); // Extract ID from request params

    try {
        const result = await pool.query(
            `UPDATE currency
             SET 
                 name = COALESCE($1, name),
                 symbol = COALESCE($2, symbol)
             WHERE id = $3 
             RETURNING *`,
            [name || null, symbol || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Currency not found' });
        }

        res.status(200).json(result.rows[0]); // Return updated customer data
    } catch (err) {
        console.error('Error updating currency:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { getCurrencies, getCurrency, addCurrency, deleteCurrency, updateCurrency };