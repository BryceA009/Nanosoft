const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'postgres', // Replace with your database name
    password: 'BryceA09', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});


const getStatuses = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM status');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching statuses:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

const getStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`SELECT * FROM status where id = ${id}`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

const addStatus = async (req, res) => {
    const {name} = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO status (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]); // Return the newly created customer
    } catch (err) {
        console.error('Error inserting status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
   };

const deleteStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`DELETE FROM status WHERE id = ${id};`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error deleting status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const updateStatus = async (req, res) => {
    const {name} = req.body;
    const id = parseInt(req.params.id); // Extract ID from request params

    try {
        const result = await pool.query(
            `UPDATE status 
             SET 
                 name = COALESCE($1, name)
             WHERE id = $2 
             RETURNING *`,
            [name || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Status not found' });
        }

        res.status(200).json(result.rows[0]); // Return updated customer data
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { getStatuses, getStatus, addStatus, deleteStatus, updateStatus };
