document.addEventListener("alpine:init", () => {
  Alpine.data("customerForm", () => ({
    errors : [],
    customer: {
      first_name: "",
      email: "",
      phone: "",
      address: "",
      last_name: ""
    },
 

    init(){
      const id = this.fetchID();
      this.fetchCustomer(id);
      
    },

    async fetchCustomer(id) {
      const url = `/api/customers/${id}`
      const response = await fetch(url, {method: "GET"});
      const data = await response.json();
      
      this.customer = data;
      if (!data.updateTime){
        
      }
      
      console.log(this.customer)
      
    },

    async updateCustomer(id){
      
      const url = `api/customers/${id}`
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"},

        body: JSON.stringify(this.customer) 
      });
      
      window.location.href="customer_list.html"

    },

    fetchID(){

    function getQueryParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const customerId = getQueryParameter('customer_id');
    return (customerId)

    },


    save() {
      this.validateForm()
      if (this.errors.length == 0){
        this.updateCustomer(this.customer.id)
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
        if (this.customer[key] == "") {
          this.errors.push(key);
        }
      }
    },


  }));
});
