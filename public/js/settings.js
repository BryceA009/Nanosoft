document.addEventListener("alpine:init", () => {
    Alpine.data("settingsForm", () => ({
    
    show: false,    
    errors : [],
    company: {
        company_name : "",
        registration_no: "",
        vat_no: "",
        email: "",
        address: "",
        phone: "",
    },

    async init(){
      await this.fetchSettings();
      this.show = false;
      

    },

    async fetchSettings() {
      const url = "/api/settings";
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      this.company = data;
      delete this.company.__v;
      console.log(this.company);
    },



    async updateSettings(){
        console.log(this.company)
        const url = "/api/settings";
        const response = await fetch(url, {
          method: "PUT",
  
          headers: {
            "Content-Type": "application/json"},
          body: JSON.stringify(this.company) 
        });

        console.log(this.company)

        this.show = true;

        setTimeout(() => {
            this.show = false;
        }, 400);
      
    },

    async save() {

        this.validateForm()
        if (this.errors.length == 0){  
          await this.updateSettings();
         
        }
  
        else{
          this.errors.forEach(function(key){
            console.log(`${key} is missing`)
          })
        }
      },


    validateForm() {
        this.errors = []
        for (let key in this.company) {
          if (this.company[key] == "") {
            this.errors.push(key);
          }
        }
    },





    }))


})