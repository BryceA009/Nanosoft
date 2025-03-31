document.addEventListener("alpine:init", () => {
    Alpine.data("customerList", () => ({

        customerList : [],

        init(){
            this.fetchCustomers();
          },

        async fetchCustomers() {
            const url = "/api/customers"
            const response = await fetch(url, {method: "GET"});
            const data = await response.json();
            this.customerList = data;
            console.log(this.customerList)
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

    }))

})