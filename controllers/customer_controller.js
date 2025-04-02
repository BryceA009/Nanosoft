const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'postgres', // Replace with your database name
    password: 'BryceA09', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});


// @desc Get all customers

const getCustomers = async (req, res, next) => {

    try {
        const {order_by = 'id', sort = 'asc' } = req.query;
        let query = `SELECT
                id,
                first_name, 
                last_name,
                address, 
                phone, 
                email
                FROM customers`;

        let params = [];
        let whereClauses = [];

        // Validate allowed columns for ordering to prevent SQL injection
        const validColumns = ['id', 'first_name', 'last_name', 'address', 'phone', 'email'];
        const validSorts = ['asc', 'desc'];

        if (!validColumns.includes(order_by) || !validSorts.includes(sort.toLowerCase())) {
            return res.status(400).json({ error: "Invalid order_by or sort parameter" });
        }

        query += ` ORDER BY ${order_by} ${sort.toUpperCase()}`;

        // Execute query
        const result = await pool.query(query, params);
        res.json(result.rows);

    }

    catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCustomersLike = async (req, res, next) => {

    try {
        const {first_name = '', last_name = '', order_by = 'id', sort = 'asc' } = req.query;
        let query = `SELECT
                id,
                first_name, 
                last_name,
                address, 
                phone, 
                email
                FROM customers`;

        let params = [];
        let whereClauses = [];

        // Validate allowed columns for ordering to prevent SQL injection
        const validColumns = ['id', 'first_name', 'last_name', 'address', 'phone', 'email'];
        const validSorts = ['asc', 'desc'];

        if (!validColumns.includes(order_by) || !validSorts.includes(sort.toLowerCase())) {
            return res.status(400).json({ error: "Invalid order_by or sort parameter" });
        }

        if (first_name) {
            whereClauses.push(`upper(first_name) LIKE $${params.length + 1}`);
            params.push(`%${first_name}%`);
        }

        if (last_name) {
            whereClauses.push(`upper(last_name) LIKE $${params.length + 1}`);
            params.push(`%${last_name}%`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += ` ORDER BY ${order_by} ${sort.toUpperCase()}`;

        // Execute query
        const result = await pool.query(query, params);
        res.json(result.rows);

    }

    catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCustomer = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`SELECT * FROM customers where id = ${id}`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

const addCustomer = async (req, res) => {
    const { first_name, last_name, address, phone, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO customers (first_name, last_name, address, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [first_name, last_name, address, phone, email]
        );
        res.status(201).json(result.rows[0]); // Return the newly created customer
    } catch (err) {
        console.error('Error inserting customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
   };

const deleteCustomer = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`DELETE FROM customers WHERE id = ${id};`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const updateCustomer = async (req, res) => {
    const { first_name, last_name, address, vat_no, phone, email } = req.body;
    const id = parseInt(req.params.id); // Extract ID from request params

    try {
        const result = await pool.query(
            `UPDATE customers 
             SET 
                 first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 address = COALESCE($3, address), 
                 phone = COALESCE($4, phone), 
                 email = COALESCE($5, email) 
             WHERE id = $6 
             RETURNING *`,
            [first_name || null, last_name || null, address || null, phone || null, email || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json(result.rows[0]); // Return updated customer data
    } catch (err) {
        console.error('Error updating customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = { getCustomers, getCustomersLike, getCustomer, addCustomer, deleteCustomer, updateCustomer };
