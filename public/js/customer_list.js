document.addEventListener("alpine:init", () => {
    Alpine.data("customerList", () => ({

        customerList : [],
        sort_category: "",
        sort_direction: "asc",
        name_search: "",
        multiple_customer_sql: "",

        init(){
            this.fetchCustomers();
          },

        async fetchCustomers() {
          
            if (this.multiple_customer_sql == ""){
              const url = "/api/customers"
              const response = await fetch(url, {method: "GET"});
              const data = await response.json();
              this.customerList = data;
            }

            else {
              const response = await fetch(this.multiple_customer_sql, {method: "GET"});
              const data = await response.json();
              this.customerList = data;

            }

        },

        async deleteCustomer(id){
            if (confirm("Are you sure you want to delete?")){
              const url = `/api/customers/${id}`;
              await fetch(url, {
                method: "DELETE",
              })
              this.fetchCustomers()
            }

          },
        
        async sortCustomer(category) {
      
            // Check if sorting by the same category
            if (this.sort_category === category) {
              var url = `api/customers?order_by=${category}&sort=${this.sort_direction}`;
      
              this.sort_direction = this.sort_direction === "desc" ? "asc" : "desc";
            }
      
            if (this.sort_category != category) {
              var url = `api/customers?order_by=${category}&sort=asc`;
      
              this.sort_direction = "desc";
            }
      
            const response = await fetch(url, { method: "GET" });
            const data = await response.json();
            this.customerList = data;
            this.sort_category = category;
      
          },
        
        async searchFilter(){
            this.multiple_customer_sql =  "";
            let parts = this.name_search.split(" ");
            let firstName = (parts[0] || '').toUpperCase(); 
            let lastName = (parts.slice(1).join(' ') || '').toUpperCase(); 
            const url = `/api/customers/like?first_name=${firstName}&last_name=${lastName}`;
            
            if (firstName == "" && lastName == "") {
              this.multiple_customer_sql = ""
            }
            else {
              this.multiple_customer_sql = url

            }
            
            this.fetchCustomers();
      
      
          }

    }))

})