const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

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
        const { order_by = 'id', page_size = 10, page_number = 1, sort = 'asc' } = req.query;
        let query = `SELECT
                    c.id,
                    c.first_name, 
                    c.last_name,
                    c.address, 
                    c.phone, 
                    c.email,
                    c.invoice_count
                    FROM customers AS c`;
    
        let query_total =   `SELECT
                            COUNT(*)
                            FROM Customers` 
                            
    
        let params = [];
        let whereClauses = [];
    
        // Validate allowed columns for ordering to prevent SQL injection
        const validColumns = ['id', 'first_name', 'last_name', 'address', 'phone', 'email', 'invoice_count'];
        const validSorts = ['asc', 'desc'];
    
        if (!validColumns.includes(order_by) || !validSorts.includes(sort.toLowerCase())) {
            return res.status(400).json({ error: "Invalid order_by or sort parameter" });
        }
    
        query += ` ORDER BY ${order_by} ${sort.toUpperCase()}`;
        query += ` offset ${(page_number-1) * page_size}`;
        query += ` limit ${page_size}`;
    
        // Execute query
        const result = await pool.query(query, params);
        const number_of_customers = await pool.query(query_total)
    
        res.json({
            count: Number(number_of_customers.rows[0].count), // assuming query_total returns COUNT(*)
            customers: result.rows
        });
    
    
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCustomersLike = async (req, res, next) => {
    try {
        const {
            name_search = '',
            page_size = 10,
            page_number = 1,
            order_by = 'id',
            sort = 'asc'
        } = req.query;

        const validColumns = ['id', 'first_name', 'last_name', 'address', 'phone', 'email', 'invoice_count'];
        const validSorts = ['asc', 'desc'];

        if (!validColumns.includes(order_by) || !validSorts.includes(sort.toLowerCase())) {
            return res.status(400).json({ error: "Invalid order_by or sort parameter" });
        }

        let params = [];
        let whereClauses = [];

        const parts = name_search.split(" ");
        const first_name = (parts[0] || '').trim();
        const last_name = (parts.slice(1).join(' ') || '').trim();

        // Add dynamic filters
        if (first_name) {
            whereClauses.push(`(c.first_name ILIKE $${params.length + 1} OR c.last_name ILIKE $${params.length + 1} OR c.email ILIKE $${params.length + 1} OR c.phone ILIKE $${params.length + 1})`);
            params.push(`%${first_name}%`);
        }

        if (last_name) {
            whereClauses.push(`c.last_name ILIKE $${params.length + 1}`);
            params.push(`%${last_name}%`);
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
            SELECT 
                c.id,
                c.first_name,
                c.last_name,
                c.address,
                c.phone,
                c.email,
                c.invoice_count
            FROM customers c
            ${whereSQL}
            ORDER BY ${order_by} ${sort.toUpperCase()}
            OFFSET ${(page_number - 1) * page_size}
            LIMIT ${page_size};
        `;

        let query_total = `SELECT
        COUNT(*)
        FROM Customers c
        ${whereSQL}` 

        const number_of_customers = await pool.query(query_total, params)

        const result = await pool.query(query, params);
        res.json({
            count: Number(number_of_customers.rows[0].count),
            customers: result.rows
        });

    } 
    
    catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTotalCustomers = async (req, res, next) => {

    try {
        let query = `SELECT count(*) as total_customers
                        from customers`;  

        // Execute query
        const result = await pool.query(query);
        res.json(result.rows[0]);     
    
    } catch (err) {
        console.error('Error fetching total:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCustomer = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`SELECT * FROM customers where id = ${id}`);
      

        if (result.rows[0] == undefined){
            return res.json("no_match");   
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addCustomer = async (req, res) => {
    const { first_name, last_name, address, phone, email, invoice_count } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await client.query(
            'INSERT INTO customers (first_name, last_name, address, phone, email, invoice_count) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, address, phone, email, invoice_count]
        );

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]); // Return the newly created customer
    } 
    
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Error inserting customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

    finally {
        client.release();
    }
};

const clearCustomers = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`select clearCustomers()`);
        await client.query('COMMIT');
        res.json("Customer data base cleared");
    } 
    
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

    finally {
        client.release();
    }

};

const deleteCustomer = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`DELETE FROM customers WHERE id = ${id};`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: err.message });
    }

};

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

const addTestCustomers = async (req, res) => {

    const { number_of_customers = 10 } = req.query;
    const BATCH_SIZE = 10000;
    var total_customers = Number(number_of_customers);
    var num_batches = Math.ceil(total_customers / BATCH_SIZE);
    let all_customers = 0;
    const client = await pool.connect();

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
        await client.query('BEGIN');
    
        while (num_batches > 0) {
            let customer_batch = (total_customers - BATCH_SIZE) > 0 ? BATCH_SIZE : total_customers;
            let customers = [];

            for (let i = 0; i < customer_batch; i++) {
                customers.push({
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    address: faker.location.streetAddress(),
                    phone: faker.phone.number({ style: 'international' }),
                    email: faker.internet.email(),
                    invoice_count: 0
                });
            }
      
        // Prepare SQL placeholders and values
            let values = [];
            let placeholders = customers.map((cust, index) => {
            const i = index * 6;
            values.push(
                cust.first_name, 
                cust.last_name, 
                cust.address, 
                cust.phone, 
                cust.email, 
                cust.invoice_count
            );
                return `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6})`;
                }).join(', ');
      
            let query = 
            `INSERT INTO customers (first_name, last_name, address, phone, email, invoice_count)
            VALUES ${placeholders};`;
      
        // Execute query

            const result = await client.query(query, values);
            all_customers += customer_batch
            total_customers -=  BATCH_SIZE;
            num_batches -= 1;

            res.write(`${total_customers} left to send\n`);
        }

        await client.query('COMMIT'); 
        res.write('Task complete.\n');
        res.status(201).end();

        
    }   
    
    catch (err) {
        await client.query('ROLLBACK'); // 🔁 Rollback everything on error
        console.error('Error inserting test customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    } 
      
    finally {
        client.release();
    }
      
};








module.exports = { getCustomers, getCustomersLike, getTotalCustomers, getCustomer, addCustomer, addTestCustomers, clearCustomers, deleteCustomer,  updateCustomer };
