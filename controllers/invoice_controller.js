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
      let parts = search_data.split(" ");
      first_part = (parts[0] || "").toUpperCase().trim();
      second_part = (parts.slice(1).join(" ") || "").toUpperCase().trim();
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
      query += ` WHERE (` + searchClauses.join(" AND ") + `)`;
      query_total += ` WHERE (` + searchClauses.join(" AND ") + `)`;

      if (whereClauses.length > 0) {
        query += " AND " + whereClauses.join(" AND ");
      }
    }

    if (first_part && second_part === "") {
      searchClauses.push(`CAST(invoice_date AS TEXT) LIKE '%${first_part}%'`);
      searchClauses.push(`CAST(due_date AS TEXT) LIKE '%${first_part}%'`);

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

  const customer_response = await pool.query(
    `SELECT first_name,last_name FROM customers where id = ${customer_id}`
  );

  let cust_first_name = customer_response.rows[0]["first_name"]
  let cust_last_name = customer_response.rows[0]["last_name"]

  try {
    const result = await pool.query(
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
      await pool.query(
        "INSERT INTO invoice_details (description, qty, price, invoice_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [line.description, line.qty, line.price, newInvoiceId]
      );
      let total = line.qty * line.price;
      let discount = total * (discount_rate / 100);
      let tax = (total - discount) * (tax_rate / 100);
      invoiceTotal += total - discount + tax;
    });

    await pool.query(
      `UPDATE customers
      SET invoice_count = invoice_count + 1
      WHERE id = ${customer_id}`
    );

    let invoiceID = result.rows.map((row) => row.id);
    await pool.query(
      `UPDATE invoices
      SET invoice_total = ${invoiceTotal}
      WHERE id = ${invoiceID[0]}`
    );

    res.status(201).json(result.rows[0]); // Return the newly created invoice
  } catch (err) {
    console.error("Error inserting invoice:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const clearInvoices = async (req, res) => {
  try {
    await pool.query(`Truncate table invoices  RESTART IDENTITY`);
    await pool.query(`Truncate table invoice_details  RESTART IDENTITY`);

    await pool.query(
      `UPDATE customers
          SET invoice_count = 0`
    );

    res.json("Invoices database cleared");
  } catch (err) {
    console.error("Error deleting invoices:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const customerID = await pool.query(
      `Select customer_id FROM invoices WHERE id = ${id};`
    );
    const result = await pool.query(`DELETE FROM invoices WHERE id = ${id};`);

    await pool.query(
      `UPDATE customers
      SET invoice_count = invoice_count - 1
      WHERE id = ${customerID.rows[0].customer_id}`
    );

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
    const originalCustomerID = await pool.query(
      `SELECT customer_id FROM invoices WHERE id = ${id}`
    );

    if (customer_id != originalCustomerID) {
      await pool.query(
        `UPDATE customers
      SET invoice_count = invoice_count - 1
      WHERE id = ${originalCustomerID.rows[0].customer_id}`
      );

      await pool.query(
        `UPDATE customers
      SET invoice_count = invoice_count + 1
      WHERE id = ${customer_id}`
      );
    }

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

const addTestInvoices = async (req, res) => {
  const statusIds = await getStatusIds();
  const currencyIds = await getCurrencyIds();
  const customerIds = await getCustomerIds();
  let insertedInvoiceIDs = [];
  let insertedCustomerIds = [];
  let updateData = [];

  const { number_of_invoices = 10 } = req.query;
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Transfer-Encoding", "chunked");

  const BATCH_SIZE = 5000;
  var total_invoices = Number(number_of_invoices);
  var num_batches = Math.ceil(total_invoices / BATCH_SIZE);
  let all_invoices = 0;

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
        currency_id:
          currencyIds[Math.floor(Math.random() * currencyIds.length)].id,
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
      const result = await pool.query(invoice_query, values);
      insertedInvoiceIDs = result.rows.map((row) => row.id);
      insertedCustomerIds = result.rows.map((row) => row.customer_id);
      const customerCountMap = {};

      await insertedCustomerIds.forEach((id) => {
        customerCountMap[id] = (customerCountMap[id] || 0) + 1;
      });

      updateData = Object.entries(customerCountMap);

      all_invoices += invoice_batch;
    } catch (err) {
      console.error("Error inserting test invoices:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    //Updating customers

    await pool.query(
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

    await pool.query(invoice_details_query, details_values);

    await pool.query(
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

  res.write("Task complete.\n");
  res.status(201).end();
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
