-- INVOICE INDEXES

-- Index: due_date_index
CREATE INDEX IF NOT EXISTS due_date_index
    ON public.invoices USING btree
    (due_date ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: first_name_index
CREATE INDEX IF NOT EXISTS first_name_index
    ON public.invoices USING btree
    (first_name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: invoice_date_index
CREATE INDEX IF NOT EXISTS invoice_date_index
    ON public.invoices USING btree
    (invoice_date ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: invoice_total_index
CREATE INDEX IF NOT EXISTS invoice_total_index
    ON public.invoices USING btree
    (invoice_total ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: last_name_index
CREATE INDEX IF NOT EXISTS last_name_index
    ON public.invoices USING btree
    (last_name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: status_index
CREATE INDEX IF NOT EXISTS status_index
    ON public.invoices USING btree
    (status_id ASC NULLS LAST)
    TABLESPACE pg_default;



-- CUSTOMER INDEXES

-- Index: idx_email
CREATE INDEX IF NOT EXISTS idx_email
    ON public.customers USING btree
    (email COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: idx_first_name
CREATE INDEX IF NOT EXISTS idx_first_name
    ON public.customers USING btree
    (first_name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: idx_last_name
CREATE INDEX IF NOT EXISTS idx_last_name
    ON public.customers USING btree
    (last_name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Index: idx_phone
CREATE INDEX IF NOT EXISTS idx_phone
    ON public.customers USING btree
    (phone COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;







-- Invoices Simplified

-- CREATE INDEX if NOT EXISTS first_name_index on invoices(first_name)

-- CREATE INDEX if NOT EXISTS last_name_index
-- on invoices(last_name)

-- CREATE INDEX if NOT EXISTS invoice_date_index
-- on invoices(invoice_date)

-- CREATE INDEX IF NOT EXISTS due_date_index
-- ON invoices (due_date);

-- CREATE INDEX if NOT EXISTS invoice_total_index
-- on invoices(invoice_total)

-- CREATE INDEX if NOT EXISTS status_index
-- on invoices(status_id)


-- Customers Simplified

-- CREATE INDEX if NOT EXISTS idx_first_name
-- on customers(first_name)

-- CREATE INDEX if NOT EXISTS idx_last_name
-- on customers(last_name)

-- CREATE INDEX if NOT EXISTS idx_email
-- on customers(email)

-- CREATE INDEX if NOT EXISTS idx_phone
-- on customers(phone)