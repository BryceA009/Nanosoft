document.addEventListener("alpine:init", () => {
    Alpine.data("sideBar", () => ({

        showCustomerTab: false,
        showInvoiceTab: false,
        showSettingsTab: false,
        showMaintenanceTab: false,

        invoice_tabs:["invoice_list.html" , "invoice_create.html"],
        customer_tabs:["customer_list.html", "customer_create.html"],
        

        init(){
          this.highlightCurrentPage()


        },


        customerToggle(){

            if (this.showCustomerTab == false){
              this.showCustomerTab = true
            }
  
            else{
              this.showCustomerTab = false
            }
          },  
  
        invoiceToggle(){

          console.log(window.location.href)

            if (this.showInvoiceTab == false){
              this.showInvoiceTab = true
            }
  
            else{
              this.showInvoiceTab = false
            }
          },

        highlightCurrentPage(){
          this.invoice_tabs.forEach(element => {
            if (window.location.href.includes(element)){
              this.showInvoiceTab = true;
            }
          })

          this.customer_tabs.forEach(element => {
            if (window.location.href.includes(element)){
              this.showCustomerTab = true;
            }
          })

          if (window.location.href.includes("settings.html")){
            this.showSettingsTab = true;
          }

          if (window.location.href.includes("maintenance.html")){
            this.showMaintenanceTab = true;
          }

        },

        currentPageCheck(url){
          return (window.location.href.includes(url))
        }
        

    }))

})