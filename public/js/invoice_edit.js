document.addEventListener("alpine:init", () => {
  Alpine.data("invoiceForm", () => ({
    errors: [],
    invoiceList: [],
    invoice: {
      invoice_date: "",
      due_date: "",
      invoice_lines: [],
      tax_rate: 0,
      discount_rate: 0,
      customer_id: "",
      invoice_note: "",
      status_id: "",
      currency_id: "",
    },
    customerList: [],
    originalInvoiceDetailList: [],
    customer: {},
    statusOptions: [],
    currencyOptions: [],

    company: {
      company_name: "",
      company_phone: "",
      company_email: "",
      company_address: "",
    },

    async init() {
      try {
        const id = await this.fetchID(); // Ensure ID is fetched before using it
        await this.fetchStatus();
        await this.fetchCurrency();
        await this.getCustomerList(); // Wait for customer list
        await this.fetchInvoice(id); // Wait for invoice data
        await this.getCustomer(this.invoice.customer_id);
        await this.fetchSettings(); // Wait for settings to load
        await this.fetchInvoiceDetails();
        
      } 
      
      catch (error) {
        console.error("Error initializing:", error);
      }
    },

    async fetchInvoice(id) {
      const url = `/api/invoices/${id}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.invoice = data;

      const date = new Date(this.invoice.invoice_date);
      const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
      this.invoice.invoice_date = formattedDate;

      const due_date = new Date(this.invoice.due_date);
      const formattedDueDate = due_date.toISOString().split("T")[0]; // YYYY-MM-DD
      this.invoice.due_date = formattedDueDate;

      if (!data.updateTime) {
      }
    },

    async updateInvoice(id) {

      const invoiceDetailLines = this.invoice.invoice_lines;

      invoiceDetailLines.forEach((line) => {
        var exists = this.originalInvoiceDetailList.some(
          (item) => item.id === line.id
        );

        
        if (exists == true) {
          
          const invoice_url = `/api/invoice_detail/${line.id}`;
          const response = fetch(invoice_url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
           
            body: JSON.stringify(line),

          });
        }

        else {
          const invoice_url = `/api/invoice_detail`;
          const response = fetch(invoice_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(line),

          });

        }


      });

      this.originalInvoiceDetailList.forEach((line) => {
        var exists = invoiceDetailLines.some(
          (item) => item.id === line.id
        );

        console.log(exists)
        
        if (exists == false) {
          
          console.log(line.id)
          console.log(line)
          const invoice_url = `/api/invoice_detail/${line.id}`;
          const response = fetch(invoice_url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
           
            body: JSON.stringify(line),

          });
        }


      });

      const { invoice_lines, ...invoiceWithoutLines } = this.invoice;
      const url = `/api/invoices/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(invoiceWithoutLines),
      });

      window.location.href = "invoice_list.html";
    },

    fetchID() {
      function getQueryParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
      }

      const invoiceId = getQueryParameter("invoice_id");
      return invoiceId;
    },

    save() {
      this.validateForm();
      if (this.errors.length == 0) {
        this.updateInvoice(this.invoice.id);
      } else {
        this.errors.forEach(function (key) {
          console.log(`${key} is missing`);
        });
      }
    },

    validateForm() {
      this.errors = [];
      for (let key in this.invoice) {
        if (this.invoice[key] === "") {
          this.errors.push(key);
        }
      }
    },

    async getCustomerList() {
      const url = "/api/customers";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      this.customerList = data;
    },

    getCustomer(id) {
      this.customerList.forEach((element) => {
        if (element.id == id) {
          this.customer.name = element.first_name + " " + element.last_name;
          this.customer.address = element.address;
          this.customer.phone = element.phone;
          this.customer.email = element.email;
          this.customer.id = id;

        }
      });
    },

    async updateInvoiceTo() {
      this.getCustomer();
    },

    indexResetter() {
      const table_length = this.invoice.invoice_lines.length;
      var new_index = 1;

      this.invoice.invoice_lines.forEach(function (row) {
        row.index = new_index;
        new_index += 1;
      });
    },

    addRow() {
      var index = this.invoice.invoice_lines.length + 1;
      this.invoice.invoice_lines.push({
        index: index,
        description: "",
        qty: 0,
        price: 0,
        invoice_id: this.invoice.id
      });
    },

    deleteRow(index_number) {
      const index = this.invoice.invoice_lines.findIndex(
        (item) => item.index === index_number
      );

      if (index !== -1) {
        this.invoice.invoice_lines.splice(index, 1);
      }

      this.indexResetter();
    },

    async fetchSettings() {
      const url = "/api/settings";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.company = data;
    },

    async fetchInvoiceDetails() {
      const url = `/api/invoice_detail?invoice_id=${this.invoice.id}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      var index = 0;

      data.forEach((line) => {
        line.index = index + 1;
        index = index + 1;
      });

      this.invoice.invoice_lines = JSON.parse(JSON.stringify(data));  
      this.originalInvoiceDetailList = JSON.parse(JSON.stringify(data));  
    },

    async fetchStatus() {
      const url = "/api/status";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.statusOptions = data;

    },

    async fetchCurrency() {
      const url = "/api/currency";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.currencyOptions = data;
    },



    //Calculations

    calcAmount(line) {
      return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(line.price * line.qty)
        .replace(/\s/g, " ");
    },

    subTotal() {
      subTotal = 0;
      if (this.invoice.invoice_lines) {
        this.invoice.invoice_lines.forEach((line) => {
          subTotal += line.qty * line.price;
        });
        return subTotal.toFixed(2);
      }
    },

    discount() {
      var discount_amount =
        (this.subTotal() * this.invoice.discount_rate) / 100;
      return discount_amount.toFixed(2);
    },

    tax_calculation() {
      return (
        (this.subTotal() - this.discount()) *
        (this.invoice.tax_rate / 100)
      ).toFixed(2);
    },

    grandTotal() {
      var subTotalFloat = parseFloat(this.subTotal());
      var discountFloat = parseFloat(this.discount());
      var taxAmount = parseFloat(this.tax_calculation());

      return (subTotalFloat - discountFloat + taxAmount).toFixed(2);
    },

  }));
});
