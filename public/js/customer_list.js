document.addEventListener("alpine:init", () => {
    Alpine.data("customerList", () => ({

        customerList : [],
        sort_category: "",
        sort_direction: "asc",
        name_search: "",


        init(){
            this.fetchCustomers();
          },

        async fetchCustomers() {
          
          const url = "/api/customers"
          const response = await fetch(url, {method: "GET"});
          const data = await response.json();
          this.customerList = data;


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

            const url = `/api/customers/like?name_search=${this.name_search}`;
            
            const response = await fetch(url, {method: "GET"});
            const data = await response.json();
            this.customerList = data;
            
      
          }

    }))

})