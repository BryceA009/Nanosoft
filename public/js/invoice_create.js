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
    customer: {},
    statusOptions: [],
    currencyOptions: [],

    company: {
      company_name: "",
      phone: "",
      email: "",
      address: "",
    },

    async init() {
      await this.getCustomerList(); // Wait for customer list
      await this.fetchStatus(); //fetch status data
      await this.fetchCurrency(); //Fetch Currency data
      await this.fetchSettings(); // Wait for settings to load
    },

    async createInvoice() {
      const url = "/api/invoices";
    
      // First, create the invoice
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.invoice),
      });
    
      if (!response.ok) {
        console.error("Failed to create invoice");
        return;
      }
    
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

    async save() {
      this.validateForm();
      if (this.errors.length == 0) {
        await this.createInvoice();
        window.location.href = "invoice_list.html";
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
          console.log(key)
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

        if (id == ""){
          this.customer.name = "";
          this.customer.address = "";
          this.customer.phone = "";
          this.customer.email = "";
          this.customer.id = "";

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

    async fetchSettings() {
      const url = "/api/settings";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.company = data;
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



    // Calculations

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
