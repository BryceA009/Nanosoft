
async function handleProgressStream(reader, context, category) {
        
        const insert_value = Number(context.number_of_customers) ? category === "customers" : Number(context.number_of_invoices);
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            context.progress = "Done!";
            context.progressValue = 100;
            break;
          }
    
          const chunk = decoder.decode(value, { stream: true }).trim();
          const AmountLeftToInsert = parseInt(chunk);
          
          console.log(AmountLeftToInsert)


          if (!isNaN(AmountLeftToInsert)) {
            const percentage = Math.min(
              Math.round(((insert_value - AmountLeftToInsert) / insert_value) * 100),
              100
            );

            
            context.progressValue = percentage;
            
            context.progress = `${percentage}% complete (${value - AmountLeftToInsert} of ${insert_value})`;
          } 
          
          else {
            console.warn("Unexpected chunk:", chunk);
          }
        }
  }