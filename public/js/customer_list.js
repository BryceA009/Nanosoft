document.addEventListener("alpine:init", () => {
  Alpine.data("customerList", () => ({
    customerList: [],
    sort_category: "",
    sort_direction: "asc",
    name_search: "",
    page_number: 1,
    page_size_option: 10,
    page_size_options: [5, 10, 15, 20],
    total: 0,
    total_pages: 0,

    async init() {
      await this.fetchCustomers();
      this.total = await this.customerList[2].total_customers;
      this.totalPages();
    },

    async fetchCustomers() {
      let corrected_direction =
        this.sorted_direction === "asc" ? "desc" : "asc";

      if (this.name_search && this.sort_category) {
        const url = `/api/customers/like?` +
                    `name_search=${this.name_search}&` +
                    `page_size=${this.page_size_option}&` +
                    `page_number=${this.page_number}&` +
                    `order_by=${this.sort_category}&` +
                    `sort=${corrected_direction}`;

        const response = await fetch(url, { method: "GET" });
        const data = await response.json();
        this.customerList = await data;
      }

      if (!this.name_search && this.sort_category) {
        console.log("There")
        const url = `/api/customers/like?` + 
                    `page_size=${this.page_size_option}&`+
                    `page_number=${this.page_number}&`+
                    `order_by=${this.sort_category}&`+
                    `sort=${corrected_direction}`;

        const response = await fetch(url, { method: "GET" });
        const data = await response.json();
        this.customerList = await data;
      } 
      
      if (!this.name_search && !this.sort_category){
        const url = `/api/customers?&page_size=${this.page_size_option}&page_number=${this.page_number}`;
        const response = await fetch(url, { method: "GET" });
        const data = await response.json();
        this.customerList = data;
      }
    },

    async deleteCustomer(id) {
      if (confirm("Are you sure you want to delete?")) {
        const url = `/api/customers/${id}`;
        await fetch(url, {
          method: "DELETE",
        });
        this.fetchCustomers();
      }
    },

    async sortCustomer(category) {
      // Check if sorting by the same category
      if (this.sort_category === category) {
        var url = `api/customers/like?order_by=${category}&sort=${this.sort_direction}&name_search=${this.name_search}&page_size=${this.page_size_option}`;
        this.sort_direction = this.sort_direction === "desc" ? "asc" : "desc";
      }

      if (this.sort_category != category) {
        var url = `api/customers/like?order_by=${category}&sort=asc&name_search=${this.name_search}&page_size=${this.page_size_option}`;
        this.sort_direction = "desc";
      }

      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      this.customerList = data;
      this.sort_category = category;
      this.page_number = 1;
    },

    async searchFilter() {
      const url = `/api/customers/like?name_search=${this.name_search}&page_size=${this.page_size_option}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      this.customerList = await data;

      if (this.customerList.length > 0) {
        this.total = await this.customerList[0].total_customers;
      } else {
        this.total = 0;
      }

      await this.totalPages();
      this.page_number = 1;
    },

    async changePageSize() {
      const selectEl = document.getElementById("pageSize");
      const selectedValue = selectEl.value;
      this.page_size_option = selectedValue;
      await this.fetchCustomers();
      await this.totalPages();
    },

    async totalPages() {
      let quotient = Math.floor(this.total / this.page_size_option);
      let remainder = this.total % this.page_size_option;

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
        forward: () => console.log("forward"),
        back: () => console.log("back"),
        max: () => {
          this.page_number = this.total_pages;
          this.fetchCustomers();
        },
        min: () => {
          this.page_number = 1;
          this.fetchCustomers();
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
