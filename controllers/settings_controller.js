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


// @desc Get all invoices

const getSettings = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM settings');
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const updateSettings = async (req, res) => {
    const { company_name, registration_no, vat_no, email, address, phone } = req.body;

    const result = await pool.query('SELECT * FROM settings');

    const id = result.rows[0].id

    try {
        const result = await pool.query(
            `UPDATE settings
             SET 
                 company_name = COALESCE($1, company_name), 
                 registration_no = COALESCE($2, registration_no), 
                 vat_no = COALESCE($3, vat_no), 
                 email = COALESCE($4, email), 
                 address = COALESCE($5, address),
                 phone = COALESCE($6, phone )

                
             WHERE id = $7
             RETURNING *`,
            [company_name || null, registration_no || null, vat_no || null, email || null, address || null, phone || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        res.status(200).json(result.rows[0]); // Return updated invoice data
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = { getSettings, updateSettings };