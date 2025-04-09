document.addEventListener("alpine:init", () => {
  Alpine.data("MaintenanceForm", () => ({
    show: false,
    errors: [],
    number_of_customers: 0,
    number_of_invoices: 0,
    total_customers: 0,
    total_invoices: 0,
    progress: "Waiting...",
    progressValue: 0,

    init() {
      this.totalCustomers();
      this.totalInvoices();
    },

    async addCustomers() {
      this.progress = "Starting...";
      this.progressValue = 0;
    
      const url = `/api/customers/test?number_of_customers=${this.number_of_customers}`;
    
      try {
        const response = await fetch(url, { method: "POST" });
        const reader = response.body.getReader();
        await handleProgressStream(reader, this, "customers")

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
    
        alert(
          `${this.number_of_customers.toLocaleString(
            "fr-FR")} customers have been added`);

        this.number_of_customers = 0;
        this.totalCustomers();

      } 
      
      catch (err) {
        console.error("Error adding customers:", err);
        this.progress = "Error occurred";
        this.progressValue = 0;
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
          alert(
            `${this.total_customers.toLocaleString(
              "fr-FR"
            )} customer data has been successfully deleted.`
          );
          this.totalCustomers();
          console.log("Deleted all customers");
        } catch (err) {
          alert("Error deleting");
          console.error("Error deleting customers:", err);
        }
      }
    },

    async totalCustomers() {
      const url = `/api/customers/count`;

      const response = await fetch(url, {
        method: "GET",
      });

      const data = await response.json();
      this.total_customers = Number(data.total_customers);
    },

    async addInvoices() {
      this.progress = "Starting...";
      this.progressValue = 0;
    
      const url = `/api/invoices/test?number_of_invoices=${this.number_of_invoices}`;
    
      try {
        const response = await fetch(url, { method: "POST" });
        const reader = response.body.getReader();
        await handleProgressStream(reader, this, "invoices")

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
    
        alert(
          `${this.number_of_invoices.toLocaleString(
            "fr-FR")} invoices have been added`);

        this.number_of_invoices = 0;
        this.totalInvoices();

      } 
      
      catch (err) {
        console.error("Error adding invoices:", err);
        this.progress = "Error occurred";
        this.progressValue = 0;
      }
    },

    async clearInvoices() {
      const url = `/api/invoices/clear`;

      if (confirm("Are you sure you want to clear invoice data?")) {
        try {
          const response = await fetch(url, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          this.number_of_invoices = 0;
          alert(
            `${this.total_invoices.toLocaleString(
              "fr-FR"
            )} invoice data has been successfully deleted.`
          );
          this.totalInvoices();
          console.log("Deleted all invoices");
        } catch (err) {
          alert("Error deleting");
          console.error("Error deleting invoices:", err);
        }
      }
    },

    async totalInvoices() {
      const url = `/api/invoices/count`;

      const response = await fetch(url, {
        method: "GET",
      });

      const data = await response.json();
      this.total_invoices = Number(data.total_invoices);
    },
  }));
});
