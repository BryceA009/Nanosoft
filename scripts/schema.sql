CREATE TABLE IF NOT EXISTS public.customers(
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    invoice_count INTEGER
);

CREATE TABLE IF NOT EXISTS public.currency(
    id integer NOT NULL DEFAULT nextval('customers_id_seq'::regclass),
    name text COLLATE pg_catalog."default",
    symbol "char"
);

CREATE TABLE IF NOT EXISTS public.invoices(
    id integer NOT NULL DEFAULT nextval('invoices_id_seq'::regclass),
    invoice_date date,
    customer_id integer,
    due_date date,
    invoice_note text COLLATE pg_catalog."default",
    status_id integer,
    currency_id integer,
    discount_rate numeric,
    tax_rate numeric,
    invoice_total numeric,
    first_name text COLLATE pg_catalog."default",
    last_name text COLLATE pg_catalog."default",
    CONSTRAINT invoices_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.invoice_details(
    id integer NOT NULL DEFAULT nextval('invoice_details_id_seq'::regclass),
    description text COLLATE pg_catalog."default",
    qty numeric(10,2),
    price numeric(10,2),
    invoice_id integer,
    CONSTRAINT invoice_details_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.settings(
    company_name text COLLATE pg_catalog."default",
    registration_no integer,
    vat_no integer,
    email text COLLATE pg_catalog."default",
    address text COLLATE pg_catalog."default",
    id integer NOT NULL,
    phone text COLLATE pg_catalog."default",
    CONSTRAINT settings_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.status (
    name text COLLATE pg_catalog."default",
    id integer NOT NULL DEFAULT nextval('customers_id_seq'::regclass),
    CONSTRAINT status_pkey PRIMARY KEY (id)
)


-- Simple layout

-- CREATE TABLE IF NOT EXISTS customers (
--     id SERIAL PRIMARY KEY,
--     first_name TEXT,
--     last_name VARCHAR(255) NOT NULL,
--     address TEXT,
--     phone VARCHAR(20),
--     email VARCHAR(255),
--     invoice_count INTEGER
-- );

-- CREATE TABLE IF NOT EXISTS currency (
--     id SERIAL PRIMARY KEY,
--     name TEXT,
--     symbol CHAR(1)
-- );

-- CREATE TABLE IF NOT EXISTS invoices (
--     id SERIAL PRIMARY KEY,
--     invoice_date DATE,
--     customer_id INTEGER,
--     due_date DATE,
--     invoice_note TEXT,
--     status_id INTEGER,
--     currency_id INTEGER,
--     discount_rate NUMERIC,
--     tax_rate NUMERIC,
--     invoice_total NUMERIC,
--     first_name TEXT,
--     last_name TEXT
-- );

-- CREATE TABLE IF NOT EXISTS invoice_details (
--     id SERIAL PRIMARY KEY,
--     description TEXT,
--     qty NUMERIC(10,2),
--     price NUMERIC(10,2),
--     invoice_id INTEGER
-- );

-- CREATE TABLE IF NOT EXISTS settings(
--     id Serial Primary key,
--     company_name text,
--     registration_no integer,
--     vat_no integer,
--     email text,
--     address text,
--     phone text
-- )

-- CREATE TABLE IF NOT EXISTS status(
--     id SERIAL PRIMARY KEY,
--     name text   
-- )



