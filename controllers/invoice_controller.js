const { Pool } = require("pg");
const { faker } = require("@faker-js/faker");

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
      page_size = 10,
      page_number = 1,
      order_by = "id",
      sort = "asc",
    } = req.query;
    let query = `SELECT 
                i.id, 
                status_id,
                invoice_date, 
                due_date, 
                customer_id, 
                first_name, 
                last_name,
                invoice_total
                FROM invoices i`;

    let query_total = `SELECT status_id, COUNT(*) AS total
    FROM invoices`;

    let whereClauses = [];
    let searchClauses = [];
    let first_part = "";
    let second_part = "";

    if (search_data) {
      let parts = search_data.trim().split(/\s+/); // trims + handles multiple spaces
      first_part = (parts[0] || "").toUpperCase();
      second_part = (parts[1] ? parts.slice(1).join(" ").toUpperCase() : "");
    }

    // Validate allowed columns for ordering to prevent SQL injection
    const validColumns = [
      "id",
      "due_date",
      "invoice_date",
      "status_id",
      "first_name",
      "last_name",
      "invoice_total",
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
      whereClauses.push(`status_id = ${status_id}`);
    }

    if (customer_id) {
      whereClauses.push(`customer_id = ${customer_id}`);

    }

    if (first_part) {
      searchClauses.push(`first_name iLIKE '%${first_part}%'`);
    }

    if (second_part) {
      searchClauses.push(`last_name iLIKE '%${second_part}%'`);
    }

    if (first_part && second_part) {
      query += ` WHERE (` + searchClauses.join(" AND ") + `)`;
      query_total += ` WHERE (` + searchClauses.join(" AND ") + `)`;

      if (whereClauses.length > 0) {
        query += " AND " + whereClauses.join(" AND ");
      }
    }

    if (first_part && second_part === "") {
      searchClauses.push(`CAST(invoice_date AS TEXT) LIKE '%${first_part}%'`);
      searchClauses.push(`CAST(due_date AS TEXT) LIKE '%${first_part}%'`);
      searchClauses.push(`last_name iLIKE '%${first_part}%'`);

      query += ` WHERE (` + searchClauses.join(" OR ") + `)`;
      query_total += ` WHERE (` + searchClauses.join(" OR ") + `)`;

      if (whereClauses.length > 0) {
        query += " AND " + whereClauses.join(" AND ");
      }
    }

    if (whereClauses.length > 0 && first_part == "") {
      query += " WHERE (" + whereClauses.join(" AND ") + ")";
    }

    query += ` ORDER BY ${order_by} ${sort.toUpperCase()}`;
    query += ` offset ${(page_number - 1) * page_size}`;
    query += ` limit ${page_size}`;
    query_total += ` group by status_id`

    
    // Execute query

    const result = await pool.query(query);
    const number_of_invoices = await pool.query(query_total);
    res.json({
      invoices: result.rows,
      invoice_count: number_of_invoices.rows,
    });
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
  let invoiceTotal = 0;
  const client = await pool.connect();
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
    await client.query('BEGIN');

    const customer_response = await client.query(
      `SELECT first_name,last_name FROM customers where id = ${customer_id}`
    );
  
    let cust_first_name = customer_response.rows[0]["first_name"]
    let cust_last_name = customer_response.rows[0]["last_name"]


    const result = await client.query(
      `INSERT INTO invoices (invoice_date, customer_id, due_date, invoice_note, status_id, currency_id, discount_rate, tax_rate, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10) RETURNING *`,
      [
        invoice_date,
        customer_id,
        due_date,
        invoice_note,
        status_id,
        currency_id,
        discount_rate,
        tax_rate,
        cust_first_name,
        cust_last_name
      ]
    );

    const newInvoiceId = result.rows[0].id;
    invoice_lines.forEach(async (line) => {
    await client.query(
        "INSERT INTO invoice_details (description, qty, price, invoice_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [line.description, line.qty, line.price, newInvoiceId]
      );
      let total = line.qty * line.price;
      let discount = total * (discount_rate / 100);
      let tax = (total - discount) * (tax_rate / 100);
      invoiceTotal += total - discount + tax;
    });

    await client.query(
      `UPDATE customers
      SET invoice_count = invoice_count + 1
      WHERE id = ${customer_id}`
    );

    let invoiceID = result.rows.map((row) => row.id);
    await client.query(
      `UPDATE invoices
      SET invoice_total = ${invoiceTotal}
      WHERE id = ${invoiceID[0]}`
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]); // Return the newly created invoice
  } 
  
  catch (err) {
    await client.query('ROLLBACK');
    console.error("Error inserting invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  finally {
    client.release();
  }


};

const clearInvoices = async (req, res) => {
  const client = await pool.connect();
  try {
      await client.query("BEGIN")
      await client.query(`select clearInvoices()`)
      await client.query("COMMIT")
      res.json("Invoices database cleared");
  } 
  
  catch (err) {
    await client.query('ROLLBACK');
    console.error("Error deleting invoices:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  finally {
    client.release();
  }
};

const deleteInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN")
    const id = parseInt(req.params.id);
    await client.query(`select deleteInvoice(${id})`)
    await client.query("COMMIT")
    res.json(); 

  } 
  
  catch (err) {
    await client.query('ROLLBACK');
    console.error("Error deleting invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  finally {
    client.release();
  }
};

const updateInvoice = async (req, res) => {
  const client = await pool.connect();
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
    await client.query("BEGIN")
    await client.query(
      `SELECT updateInvoice($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        invoice_date,
        customer_id,
        due_date,
        invoice_note,
        status_id,
        currency_id,
        discount_rate,
        tax_rate
      ]
    );
    await client.query("COMMIT")
    res.status(200).json(); 
  } 
  
  catch (err) {
    await client.query("ROLLBACK")
    console.error("Error updating invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  finally {
    client.release();
  }
};

const addTestInvoices = async (req, res) => {
  const statusIds = await getStatusIds();
  const currencyIds = await getCurrencyIds();
  const customerIds = await getCustomerIds();
  const { number_of_invoices = 10 } = req.query;
  const client = await pool.connect();

  const BATCH_SIZE = 5000;
  var total_invoices = Number(number_of_invoices);
  var num_batches = Math.ceil(total_invoices / BATCH_SIZE);
  let all_invoices = 0;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Transfer-Encoding", "chunked");

  let insertedInvoiceIDs = [];
  let insertedCustomerIds = [];
  let updateData = [];

  try{
    await client.query("BEGIN")

  while (num_batches > 0) {
    let invoice_batch =
      total_invoices - BATCH_SIZE > 0 ? BATCH_SIZE : total_invoices;
    let invoices = [];
    for (let i = 0; i < invoice_batch; i++) {
      let randomCustomer = Math.floor(Math.random() * customerIds.length);
      invoices.push({
        invoice_date: faker.date.anytime(),
        due_date: faker.date.anytime(),
        tax_rate: faker.number.float({ max: 100 }),
        discount_rate: faker.number.float({ max: 100 }),
        customer_id: customerIds[randomCustomer].id,
        invoice_note: faker.word.words(5),
        status_id: statusIds[Math.floor(Math.random() * statusIds.length)].id,
        currency_id: currencyIds[Math.floor(Math.random() * currencyIds.length)].id,
        first_name: customerIds[randomCustomer].first_name,
        last_name: customerIds[randomCustomer].last_name,
      });
    }

    // Prepare SQL placeholders and values
    let values = [];
    let placeholders = invoices
      .map((invo, index) => {
        const i = index * 10;
        values.push(
          invo.invoice_date,
          invo.due_date,
          invo.invoice_note,
          invo.tax_rate,
          invo.discount_rate,
          invo.customer_id,
          invo.status_id,
          invo.currency_id,
          invo.first_name,
          invo.last_name
        );
        return `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${
          i + 6
        }, $${i + 7}, $${i + 8}, $${i + 9}, $${i + 10})`;
      })
      .join(", ");

    let invoice_query = `INSERT INTO invoices 
      (invoice_date, due_date, invoice_note, tax_rate, discount_rate, customer_id, status_id, currency_id, first_name, last_name)
      VALUES ${placeholders}
      Returning id, customer_id;`;

    // Execute query
    try {
      const result = await client.query(invoice_query, values);
      insertedInvoiceIDs = result.rows.map((row) => row.id);
      insertedCustomerIds = result.rows.map((row) => row.customer_id);
      const customerCountMap = {};

      await insertedCustomerIds.forEach((id) => {
        customerCountMap[id] = (customerCountMap[id] || 0) + 1;
      });

      updateData = Object.entries(customerCountMap);

      all_invoices += invoice_batch;
    } 
    
    catch (err) {
      await client.query("ROLLBACK")
      console.error("Error inserting test invoices:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    //Updating customers

    await client.query(
      `
        UPDATE customers AS c
        SET invoice_count = c.invoice_count + v.count
        FROM (
          VALUES ${updateData
            .map((_, i) => `($${i * 2 + 1}::int, $${i * 2 + 2}::int)`)
            .join(", ")}
        ) AS v(id, count)
        WHERE c.id = v.id;
        `,
      updateData.flat()
    );

    //Inserting invoice details
    let invoice_lines = [];
    for (let i = 0; i < insertedInvoiceIDs.length; i++) {
      const invoice_id = insertedInvoiceIDs[i];
      const numLines = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numLines; j++) {
        invoice_lines.push({
          description: faker.commerce.product(),
          qty: faker.number.int({ min: 1, max: 20 }),
          price: faker.number.float({ min: 10, max: 500, precision: 0.01 }),
          invoice_id: invoice_id,
        });
      }
    }

    let details_values = [];
    let details_placeholders = invoice_lines
      .map((line, index) => {
        const i = index * 4;
        details_values.push(
          line.description,
          line.qty,
          line.price,
          line.invoice_id
        );
        return `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`;
      })
      .join(", ");

    let invoice_details_query = `
      INSERT INTO invoice_details
      (description, qty, price, invoice_id)
      VALUES ${details_placeholders};
      `;

    await client.query(invoice_details_query, details_values);

    await client.query(
      `
        UPDATE invoices AS i
        SET invoice_total = ROUND(
          (d.subtotal - (d.subtotal * i.discount_rate / 100)) 
          + ((d.subtotal - (d.subtotal * i.discount_rate / 100)) * i.tax_rate / 100), 2
        )
        FROM (
          SELECT invoice_id, SUM(qty * price) AS subtotal
          FROM invoice_details
          WHERE invoice_id = ANY($1::int[])
          GROUP BY invoice_id
        ) AS d
        WHERE i.id = d.invoice_id;
        `,
      [insertedInvoiceIDs]
    );

    num_batches -= 1;
    total_invoices -= BATCH_SIZE;
    res.write(`${total_invoices} left to send`);
  }

  await client.query("COMMIT")
  res.write("Task complete.\n");
  res.status(201).end();

  }

  catch (err) {
    await client.query('ROLLBACK');
    console.error("Error adding invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  finally{
    client.release();
  }



 
};

const totalInvoices = async (req, res) => {
  try {
    let query = `SELECT count(*) as total_invoices
                    from invoices`;  

    // Execute query
    const result = await pool.query(query);
    res.json(result.rows[0]);     

} catch (err) {
    console.error('Error fetching total:', err);
    res.status(500).json({ error: 'Internal server error' });
}

}

async function getStatusIds() {
  const response = await pool.query("SELECT * FROM status");
  return response.rows;
}

async function getCurrencyIds() {
  const response = await pool.query("SELECT * FROM currency");
  return response.rows;
}

async function getCustomerIds() {
  const response = await pool.query(
    "SELECT id,first_name,last_name FROM customers limit (75000)"
  );
  return response.rows;
}

module.exports = {
  getInvoices,
  getInvoice,
  totalInvoices,
  addInvoice,
  clearInvoices,
  deleteInvoice,
  updateInvoice,
  addTestInvoices,
};
