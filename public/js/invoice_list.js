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
    page_number: 1,
    page_size_option: 10,
    page_size_options: [5, 10, 15, 20],
    total: 0,
    total_pages: 0,
    isLoading: false,

    async init() {
      this.customer_id = await this.fetchCustomerID();
      await this.fetchInvoices(this.status_filter);
      await this.fetchStatus();
      this.customers = await this.getCustomers();
      await this.totalPages();
    },

    async fetchInvoices(status_filter) {

      let corrected_direction = this.sorted_direction === "asc" ? "desc" : "asc";

      let sort_link = (this.sort_category && this.sort_direction) 
                      ? `order_by=${this.sort_category}&sort=${corrected_direction}` 
                      : "";


      let search_link = this.name_search ? 
      `&search_data=${this.name_search}` : ""
      

      if (this.customer_id) {
        if (status_filter == "all") {
          const url = `api/invoices?page_number=${this.page_number}&customer_id=${this.customer_id}` + sort_link;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data.invoices;
          this.getStatusAmounts(data.invoice_count)
        } else {
          const url = `api/invoices?page_number=${this.page_number}&status_id=${status_filter}&customer_id=${this.customer_id}` + sort_link;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data.invoices;
          this.getStatusAmounts(data.invoice_count)
        }
      }
  
      if (this.customer_id == null && this.multiple_customer_sql == ""){

        if (status_filter == "all") {
          const url = `api/invoices?${search_link}&page_size=${this.page_size_option}&page_number=${this.page_number}` + sort_link ;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data.invoices;
          this.getStatusAmounts(data.invoice_count);
        } 
        
        else {
          const url = `api/invoices?${search_link}&status_id=${status_filter}&page_size=${this.page_size_option}&page_number=${this.page_number}` + sort_link ;
          const response = await fetch(url, { method: "GET" });
          const data = await response.json();
          this.invoiceList = data.invoices;
          this.getStatusAmounts(data.invoice_count)
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
        this.page_number = 1
        var url = `api/invoices?order_by=${category}&sort=${this.sort_direction}&status_id=${this.status_filter}${customer_link}&search_data=${this.name_search}&page_size=${this.page_size_option}&page_number=${this.page_number}`;

        this.sort_direction = this.sort_direction === "desc" ? "asc" : "desc";
        
      }

      if (this.status_filter !== "all" && this.sort_category != category) {
        this.page_number = 1
        var url = `api/invoices?order_by=${category}&sort=asc&status_id=${this.status_filter}${customer_link}&search_data=${this.name_search}&page_size=${this.page_size_option}&page_number=${this.page_number}`;

        this.sort_direction = "desc";
      }

      if (this.status_filter == "all" && this.sort_category == category) {
        this.page_number = 1
        var url = `api/invoices?order_by=${category}&sort=${this.sort_direction}${customer_link}&search_data=${this.name_search}&page_size=${this.page_size_option}&page_number=${this.page_number}`;

        this.sort_direction = this.sort_direction === "desc" ? "asc" : "desc";
      }

      if (this.status_filter == "all" && this.sort_category != category) {
        this.page_number = 1
        var url = `api/invoices?order_by=${category}&sort=asc${customer_link}&search_data=${this.name_search}&page_size=${this.page_size_option}&page_number=${this.page_number}`;
        this.sort_direction = "desc";
      }

      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      this.invoiceList = data.invoices;
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
        this.page_number = 1
        this.status_filter = 7;
        
      }

      if (status === 8) {
        this.page_number = 1
        this.status_filter = 8;
      }

      if (status === 9) {
        this.page_number = 1
        this.status_filter = 9;
      }

      if (status === "all") {
        this.page_number = 1
        this.status_filter = "all";
      }

      await this.fetchInvoices(this.status_filter);
      await this.totalPages()
    },

    statusCount(status) {
      return this.status_amounts[status];
    },

    async getStatusAmounts(invoiceCountData) {
      var total = 0;
      invoiceCountData.forEach((status) => {
        this.status_amounts[status.status_id] = status.total;
        total = total + Number(status.total);
      });

      this.status_amounts["all"] = total;
      this.total = total
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
      console.log(customerId)
      return customerId;
    },

    async searchFilter(){
 
      this.page_number = 1
      if (this.status_filter == "all") {
        const url = `api/invoices?search_data=${this.name_search}`;
        const response = await fetch(url, { method: "GET" });
        const data = await response.json();
        this.invoiceList = data.invoices;
        await this.getStatusAmounts(data.invoice_count)
        await this.totalPages();

      }
      
      else {
        const url = `api/invoices?status_id=${this.status_filter}&search_data=${this.name_search}`;
        const response = await fetch(url, { method: "GET" });
        const data = await response.json();
        this.invoiceList = data.invoices;
        await this.getStatusAmounts(data.invoice_count)
        await this.totalPages();
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

    async changePageSize() {
      const selectEl = document.getElementById("pageSize");
      const selectedValue = selectEl.value;
      this.page_size_option = selectedValue;
      await this.fetchInvoices(this.status_filter);
      await this.totalPages();
    },

    async totalPages() {;

      let invoiceTotal = (this.status_amounts[this.status_filter])
      let quotient = Math.floor(invoiceTotal / this.page_size_option);
      let remainder = invoiceTotal % this.page_size_option;
      this.total_pages = quotient;
      if (remainder != 0) {
        this.total_pages += 1;
      }
      if (quotient == 0) {
        this.total_pages = 1;
      }
    },

    async changePageNumber(direction) {
      const actions = {
        forward: () => { 
          if (this.page_number != this.total_pages){
          this.page_number += 1;
          this.fetchInvoices(this.status_filter);
          }
        },

        back: () => {

          if (this.page_number != 1){
            this.page_number -= 1;
            this.fetchInvoices(this.status_filter);
          }

        },

        max: () => {
          this.page_number = this.total_pages;
          this.fetchInvoices(this.status_filter);
        },

        min: () => {
          this.page_number = 1;
          this.fetchInvoices(this.status_filter);
        },

      };

      if (actions[direction]) {
        actions[direction]();
      } else {
        console.warn("Invalid direction:", direction);
      }
    },

    
  }));
});
