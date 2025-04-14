document.addEventListener("alpine:init", () => {
    Alpine.data("customerForm", () => ({

    errors : [],
    customer: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      invoice_count: 0,
    },


    async createCustomer(){

        const url = "/api/customers"
        const response = await fetch(url, {
          method: "POST",
  
          headers: {
            "Content-Type": "application/json"},
          body: JSON.stringify(this.customer) 
        });
      
    },

    async save() {
        this.validateForm()
        if (this.errors.length == 0){
          await this.createCustomer()
          window.location.href="customer_list.html";
        }
  
        else{
          this.errors.forEach(function(key){
            console.log(`${key} is missing`)
          })
        }
      },


    validateForm() {
        this.errors = []
        for (let key in this.customer) {
          if (this.customer[key] === "") {
            this.errors.push(key);
          }
        }
    },
    }))


})