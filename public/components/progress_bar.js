
async function handleProgressStream(reader, context) {
        
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
          console.log(chunk)

          if (!isNaN(AmountLeftToInsert)) {
            const percentage = Math.min(
              Math.round(((context.number_of_customers - AmountLeftToInsert) / context.number_of_customers) * 100),
              100
            );

            console.log(percentage)
            context.progressValue = percentage;
            context.progress = `${percentage}% complete (${context.number_of_customers - AmountLeftToInsert} of ${context.number_of_customers})`;
          } else {
            console.warn("Unexpected chunk:", chunk);
          }
        }
  }