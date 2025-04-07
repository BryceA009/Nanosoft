const { Pool } = require("pg");

// PostgreSQL connection configuration
const pool = new Pool({
  user: "postgres", // Replace with your PostgreSQL username
  host: "localhost",
  database: "postgres", // Replace with your database name
  password: "BryceA09", // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

const getInvoices = async (req, res, next) => {
  try {
    let {
      customer_id,
      search_data,
      status_id,
      order_by = "id",
      sort = "asc",
    } = req.query;
    let query = `SELECT 
                i.id, 
                status_id,
                invoice_date, 
                due_date, 
                customer_id, 
                c.first_name, 
                c.last_name 
                FROM invoices i
                  Inner Join customers c on i.customer_id = c.id `;

    let params = [];
    let whereClauses = [];
    let searchClauses = [];
    let first_part = ""
    let second_part = ""


    if (search_data) {
      let parts = search_data.split(" ");
      first_part = (parts[0] || '').toUpperCase().trim(); 
      second_part = (parts.slice(1).join(' ') || '').toUpperCase().trim(); 
    }


    // Validate allowed columns for ordering to prevent SQL injection
    const validColumns = [
      "id",
      "due_date",
      "invoice_date",
      "status_id",
      "first_name",
      "last_name",
    ];
    const validSorts = ["asc", "desc"];

    if (
      !validColumns.includes(order_by) ||
      !validSorts.includes(sort.toLowerCase())
    ) {
      return res
        .status(400)
        .json({ error: "Invalid order_by or sort parameter" });
    }

    if (status_id) {
      whereClauses.push(`status_id = $${params.length + 1}`);
      params.push(status_id);
    }

    if (customer_id) {
      if (!Array.isArray(customer_id)) {
        customer_id = [customer_id];
      }

      let startIndex = params.length + 1;
      let placeholders = customer_id
        .map((_, index) => `$${startIndex + index}`)
        .join(", ");

      whereClauses.push(`customer_id IN (${placeholders})`);
      params.push(...customer_id);
    }

    if (first_part) {
      searchClauses.push(`first_name iLIKE '%${first_part}%'`);
    }

    if (second_part) {
      searchClauses.push(`last_name iLIKE '%${second_part}%'`);
    }

    if (first_part && second_part) {
      query += ` WHERE ` + searchClauses.join(' AND ')

        if (whereClauses.length > 0) {
          query += ' AND ' + whereClauses.join(' AND ');
        }
    }

    if (first_part && second_part === "") {
      searchClauses.push(`CAST(invoice_date AS TEXT) LIKE '%${first_part}%'`);
      searchClauses.push(`CAST(due_date AS TEXT) LIKE '%${first_part}%'`);
      
      query += ` WHERE ` + searchClauses.join(' OR ');
  
      if (whereClauses.length > 0) {
          query += ' AND ' + whereClauses.join(' AND ');
      }
  }

    if (whereClauses.length > 0 && first_part == "") {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += ` ORDER BY ${order_by} ${sort.toUpperCase()}`;

    console.log(query)
    // Execute query
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(`SELECT * FROM invoices where id = ${id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addInvoice = async (req, res) => {
  const {
    invoice_date,
    customer_id,
    due_date,
    invoice_lines = [],
    invoice_note,
    status_id,
    currency_id,
    discount_rate,
    tax_rate,
  } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO invoices (invoice_date, customer_id, due_date, invoice_note, status_id, currency_id, discount_rate, tax_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        invoice_date,
        customer_id,
        due_date,
        invoice_note,
        status_id,
        currency_id,
        discount_rate,
        tax_rate,
      ]
    );
    const newInvoiceId = result.rows[0].id;
    invoice_lines.forEach(async (line) => {
      await pool.query(
        "INSERT INTO invoice_details (description, qty, price, invoice_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [line.description, line.qty, line.price, newInvoiceId]
      );
    });
    res.status(201).json(result.rows[0]); // Return the newly created invoice
  } catch (err) {
    console.error("Error inserting invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(`DELETE FROM invoices WHERE id = ${id};`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error deleting invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateInvoice = async (req, res) => {
  const {
    invoice_date,
    customer_id,
    due_date,
    invoice_note,
    status_id,
    currency_id,
    discount_rate,
    tax_rate,
  } = req.body;
  const id = parseInt(req.params.id); // Extract ID from request params

  try {
    const result = await pool.query(
      `UPDATE invoices 
             SET 
                 invoice_date = COALESCE($1, invoice_date), 
                 customer_id = COALESCE($2, customer_id), 
                 due_date = COALESCE($3, due_date), 
                 invoice_note = COALESCE($4, invoice_note), 
                 status_id = COALESCE($5, status_id),
                 currency_id= COALESCE($6, currency_id) ,
                 discount_rate= COALESCE($7, discount_rate),
                 tax_rate= COALESCE($8, tax_rate) 
             WHERE id = $9
             RETURNING *`,
      [
        invoice_date || null,
        customer_id || null,
        due_date || null,
        invoice_note || null,
        status_id || null,
        currency_id || null,
        discount_rate || null,
        tax_rate || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json(result.rows[0]); // Return updated invoice data
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  addInvoice,
  deleteInvoice,
  updateInvoice,
};
