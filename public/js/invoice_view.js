document.addEventListener("alpine:init", () => {
  Alpine.data("viewForm", () => ({
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

    company: {
      company_name: "",
      company_phone: "",
      company_email: "",
      company_address: "",
    },

    customerList: [],
    customer: {},
    statusOptions: [],
    currencyOptions: [],

    async init() {
      const id = await this.fetchID();
      await this.fetchInvoice(id);
      await this.fetchInvoiceDetails();
      await this.fetchSettings();
      await this.fetchCurrency(); 
      await this.getCustomer(this.invoice.customer_id);
      
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
  
      
    },

    fetchID() {
      function getQueryParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
      }

      const invoiceId = getQueryParameter("invoice_id");
      return invoiceId;
    },

    calcAmount(line) {
      return (line.price * line.qty).toFixed(2);
    },

    subTotal() {

      if (this.invoice.invoice_lines){
        subTotal = 0;
        this.invoice.invoice_lines.forEach((line) => {
          subTotal += line.qty * line.price;
        });
        return subTotal.toFixed(2);
      }

    },

    discount() {
      var discount_amount = (this.subTotal() * this.invoice.discount_rate) / 100;
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

    async fetchSettings() {
      const url = "/api/settings";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.company = data;
      console.log(this.company);
    },

    async getCustomer(id) {
      const url = `/api/customers/${id}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      this.customer = data;
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

    async fetchCurrency() {
      const url = "/api/currency";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.currencyOptions = data;
    },

    statusFormat(status) {
      if (status === "paid") {
        return "status_paid";
      }

      if (status === "unpaid") {
        return "status_unpaid";
      }

      if (status === "cancelled") {
        return "status_cancelled";
      }
    },

    generateInvoicePDF() {

      var dd = generatePDF(this)

      pdfMake.createPdf(dd).open();
    },
  }));
});
