document.addEventListener("alpine:init", () => {
  Alpine.data("invoiceList", () => ({
    invoiceList: [],
    status_filter: "all",
    customers: [],
    status: [],
    statusOptions: [],
    status_amounts: {},
    sort_category: "",
    sort_direction: "asc",
    customer_id: "",
    name_search: "",
    multiple_customer_sql: "",

    async init() {
      this.customer_id = await this.fetchCustomerID();
      await this.fetchInvoices(this.status_filter);
      await this.fetchStatus();
      await this.getStatusAmounts();
      this.customers = await this.getCustomers();
    },

    async fetchInvoices(status_filter) {


      console.log(this.multiple_customer_sql)

      if (this.customer_id) {
        if (status_filter == "all") {
          const url = `api/invoices?customer_id=${this.customer_id}`;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data;
        } else {
          const url = `api/invoices?status_id=${status_filter}&customer_id=${this.customer_id}`;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data;
        }
      }

      if (this.multiple_customer_sql && this.customer_id == null) {
        if (status_filter == "all") {
          const url = `api/invoices?${this.multiple_customer_sql}`;
          console.log(url)
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data;

        } else {
          const url = `api/invoices?status_id=${status_filter}&${this.multiple_customer_sql}`;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data;
        }

      }
      
      if (this.customer_id == null && this.multiple_customer_sql == ""){
        console.log("here")
        if (status_filter == "all") {
          const url = "api/invoices";
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data;
        } else {
          const url = `api/invoices?status_id=${status_filter}`;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data;
        }
      }

      if (this.multiple_customer_sql == "none" && this.customer_id == null){
        this.invoiceList = []
      }

      this.invoiceList.forEach((element) => {
        const date = new Date(element.invoice_date);
        const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
        element.invoice_date = formattedDate;

        const due_date = new Date(element.due_date);
        const formattedDueDate = due_date.toISOString().split("T")[0]; // YYYY-MM-DD
        element.due_date = formattedDueDate;
      });
    },

    async sortInvoice(category) {
      var customer_link = this.customer_id ? `&customer_id=${this.customer_id}`: "";

      // Check if sorting by the same category
      if (this.status_filter !== "all" && this.sort_category === category) {
        var url = `api/invoices?order_by=${category}&sort=${this.sort_direction}&status_id=${this.status_filter}${customer_link}`;

        this.sort_direction = this.sort_direction === "desc" ? "asc" : "desc";
      }

      if (this.status_filter !== "all" && this.sort_category != category) {
        var url = `api/invoices?order_by=${category}&sort=asc&status_id=${this.status_filter}${customer_link}`;

        this.sort_direction = "desc";
      }

      if (this.status_filter == "all" && this.sort_category == category) {
        var url = `api/invoices?order_by=${category}&sort=${this.sort_direction}${customer_link}`;

        this.sort_direction = this.sort_direction === "desc" ? "asc" : "desc";
      }

      if (this.status_filter == "all" && this.sort_category != category) {
        var url = `api/invoices?order_by=${category}&sort=asc${customer_link}`;

        this.sort_direction = "desc";
      }

      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      this.invoiceList = data;
      this.sort_category = category;

      this.invoiceList.forEach((element) => {
        const date = new Date(element.invoice_date);
        const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
        element.invoice_date = formattedDate;

        const due_date = new Date(element.due_date);
        const formattedDueDate = due_date.toISOString().split("T")[0]; // YYYY-MM-DD
        element.due_date = formattedDueDate;
      });
    },

    async deleteInvoice(id) {
      if (confirm("Are you sure you want to delete?")) {
        const url = `api/invoices/${id}`;
        await fetch(url, {
          method: "DELETE",
        });
        this.fetchInvoices(this.status_filter);
      }
    },

    statusFormat(status) {
      if (status === 7) {
        return "status_paid";
      }

      if (status === 8) {
        return "status_unpaid";
      }

      if (status === 9) {
        return "status_cancelled";
      }
    },

    async statusFilterFormat(status) {
      if (status === 7) {
        this.status_filter = 7;
      }

      if (status === 8) {
        this.status_filter = 8;
      }

      if (status === 9) {
        this.status_filter = 9;
      }

      if (status === "all") {
        this.status_filter = "all";
      }

      await this.fetchInvoices(this.status_filter);
    },

    statusCount(status) {
      return this.status_amounts[status];
    },

    async getStatusAmounts() {
      var total = 0;
      this.statusOptions.forEach((status) => {
        var count = 0;
        var statusId = status.id;
        this.invoiceList.forEach((invoice) => {
          if (invoice.status_id === status.id) {
            count += 1;
          }
          this.status_amounts[statusId] = count;
        });
        total = total + count;
      });

      this.status_amounts["all"] = total;
    },

    async getCustomers() {
      const url = `/api/customers`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      return data;
    },

    getCustomerName(id) {
      var name = "";

      this.customers.forEach((element) => {
        if (element.id == id) {
          name = element.first_name + " " + element.last_name;
        }
      });

      return name;
    },

    async getStatus(id) {
      const url = `api/status/${id}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      return data.name;
    },

    async fetchStatus() {
      const url = "/api/status";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.statusOptions = data;
    },

    async fetchCustomerID() {
      function getQueryParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
      }

      const customerId = getQueryParameter("customer_id");
      return customerId;
    },

    async searchFilter(){
      this.multiple_customer_sql =  "";
      let parts = this.name_search.split(" ");
      let firstName = (parts[0] || '').toUpperCase(); // Convert to uppercase
      let lastName = (parts.slice(1).join(' ') || '').toUpperCase(); // Convert to uppercase
      

      const url = `/api/customers/like?first_name=${firstName}&last_name=${lastName}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      data.forEach(customer => {

        if (this.multiple_customer_sql){
          this.multiple_customer_sql = this.multiple_customer_sql + '&' + `customer_id=${customer.id}`
        }

        else {
          this.multiple_customer_sql = this.multiple_customer_sql + `customer_id=${customer.id}`
        }
        
      })

      if (this.multiple_customer_sql == "" && (firstName !== "" || lastName !== "")){
        this.multiple_customer_sql = "none"
      }

      this.fetchInvoices(this.status_filter)

    }

    
  }));
});
