
-- Simple layout

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    invoice_count INTEGER
);

CREATE TABLE IF NOT EXISTS currency (
    id SERIAL PRIMARY KEY,
    name TEXT,
    symbol CHAR(1)
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_date DATE,
    customer_id INTEGER,
    due_date DATE,
    invoice_note TEXT,
    status_id INTEGER,
    currency_id INTEGER,
    discount_rate NUMERIC,
    tax_rate NUMERIC,
    invoice_total NUMERIC,
    first_name TEXT,
    last_name TEXT
);

CREATE TABLE IF NOT EXISTS invoice_details (
    id SERIAL PRIMARY KEY,
    description TEXT,
    qty NUMERIC(10,2),
    price NUMERIC(10,2),
    invoice_id INTEGER
);

CREATE TABLE IF NOT EXISTS settings(
    id Serial Primary key,
    company_name text,
    registration_no integer,
    vat_no integer,
    email text,
    address text,
    phone text
)

CREATE TABLE IF NOT EXISTS status(
    id SERIAL PRIMARY KEY,
    name text   
)



