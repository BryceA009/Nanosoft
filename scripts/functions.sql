CREATE OR REPLACE FUNCTION clearInvoices()
    RETURNS void AS 

    $$
    BEGIN
    ALTER TABLE invoice_details DROP CONSTRAINT invoice_details_invoice_id_fkey;
    TRUNCATE table invoice_details  RESTART IDENTITY;
    TRUNCATE table invoices  RESTART IDENTITY;
    ALTER TABLE invoice_details ADD CONSTRAINT invoice_details_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
    ALTER TABLE customers DROP COLUMN invoice_count;
    ALTER TABLE customers ADD COLUMN invoice_count INTEGER DEFAULT 0;
    END;
    $$ 

    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION decrement_invoice_count(cust_id integer)
    RETURNS void AS 

    $$
    BEGIN
      UPDATE customers
      SET invoice_count = invoice_count - 1
      WHERE id = ${cust_id}
    END;
    $$ 

    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION deleteInvoice(inv_id INTEGER)
    RETURNS VOID AS $$
    DECLARE
    cust_id INTEGER;
    BEGIN

    SELECT customer_id INTO cust_id
    FROM invoices
    WHERE id = inv_id;


    DELETE FROM invoices
    WHERE id = inv_id;

    UPDATE customers
    SET invoice_count = invoice_count - 1
    WHERE id = cust_id;

    END;
    $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION updateInvoice(
    inv_id INTEGER,
    new_invoice_date DATE,
    new_customer_id INTEGER,
    new_due_date DATE,
    new_invoice_note TEXT,
    new_status_id INTEGER,
    new_currency_id INTEGER,
    new_discount_rate NUMERIC,
    new_tax_rate NUMERIC
    )
    RETURNS VOID AS $$
    DECLARE
    original_customer_id INTEGER;
    BEGIN

    SELECT customer_id INTO original_customer_id
    FROM invoices
    WHERE id = inv_id;

    IF new_customer_id IS NOT NULL AND new_customer_id <> original_customer_id THEN
        UPDATE customers
        SET invoice_count = GREATEST(invoice_count - 1, 0)
        WHERE id = original_customer_id;

        UPDATE customers
        SET invoice_count = invoice_count + 1
        WHERE id = new_customer_id;
    END IF;

    UPDATE invoices
    SET
        invoice_date = COALESCE(new_invoice_date, invoice_date),
        customer_id = COALESCE(new_customer_id, customer_id),
        due_date = COALESCE(new_due_date, due_date),
        invoice_note = COALESCE(new_invoice_note, invoice_note),
        status_id = COALESCE(new_status_id, status_id),
        currency_id = COALESCE(new_currency_id, currency_id),
        discount_rate = COALESCE(new_discount_rate, discount_rate),
        tax_rate = COALESCE(new_tax_rate, tax_rate)
    WHERE id = inv_id;
    END;
    $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION clearInvoices()
    RETURNS VOID AS $$

    BEGIN

    ALTER TABLE invoice_details DROP CONSTRAINT invoice_details_invoice_id_fkey;
    TRUNCATE table invoice_details  RESTART IDENTITY;
    TRUNCATE table invoices  RESTART IDENTITY;
    ALTER TABLE invoice_details ADD CONSTRAINT invoice_details_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
    ALTER TABLE customers DROP COLUMN invoice_count;
    ALTER TABLE customers ADD COLUMN invoice_count INTEGER DEFAULT 0;
    END;
    $$ LANGUAGE plpgsql;



    RETURNS INTEGER AS $$
    DECLARE
    total_count INTEGER;
    BEGIN
    SELECT COUNT(*) INTO total_count FROM customers;
    RETURN total_count;
    END;
    $$ LANGUAGE plpgsql;