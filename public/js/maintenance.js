document.addEventListener("alpine:init", () => {
  Alpine.data("settingsForm", () => ({
    show: false,
    errors: [],
    number_of_customers: 0,
    number_of_invoices: 0,
    total_customers: 0,

    init (){
      this.totalCustomers()
    },

    async addCustomers() {


      const url = `/api/customers/test?number_of_customers=${this.number_of_customers}`;

      try {
        const response = await fetch(url, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        alert(`${this.number_of_customers.toLocaleString('fr-FR')} customers have been added`);
        this.number_of_customers = 0
        this.totalCustomers()


      } 
      
        catch (err) {
        console.error("Error adding customers:", err);
        }
    },

    async clearCustomers() {
      const url = `/api/customers/clear`;

      if (confirm("Are you sure you want to clear data?")) {
        try {
          const response = await fetch(url, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          this.number_of_customers = 0;
          alert(`${this.total_customers.toLocaleString('fr-FR')} customer data has been successfully deleted.`);
          this.totalCustomers()
          console.log("Deleted all customers");

        } catch (err) {
          alert("Error deleting");
          console.error("Error deleting customers:", err);
        }
      }
    },

    async totalCustomers(){
      const url = `/api/customers/count`;

      const response = await fetch(url, {
        method: "GET",
      });

      const data = await response.json();
      this.total_customers = Number(data.total_customers)
    }



  }));
});
