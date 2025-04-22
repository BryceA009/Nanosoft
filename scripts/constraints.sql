-- invoices → currency
ALTER TABLE invoices
ADD CONSTRAINT invoices_currency_id_fkey
FOREIGN KEY (currency_id) REFERENCES currency(id);

-- invoices → customers
ALTER TABLE invoices
ADD CONSTRAINT invoices_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- invoices → status
ALTER TABLE invoices
ADD CONSTRAINT invoices_status_id_fkey
FOREIGN KEY (status_id) REFERENCES status(id);

-- invoice_details → invoices
ALTER TABLE invoice_details
ADD CONSTRAINT invoice_details_invoice_id_fkey
FOREIGN KEY (invoice_id) REFERENCES invoices(id);

