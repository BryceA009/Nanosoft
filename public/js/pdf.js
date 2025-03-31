function generatePDF (context){
    const tableBody = context.invoice.invoice_lines.map((line, index) => {
        return [
          { text: `${index + 1}`, style: "table_row" }, // Row number
          { text: line.description, style: "table_row" }, // Description from `line`
          { text: line.qty.toString(), alignment: "right", style: "table_row" }, // Quantity
          { text: line.price.toString(), alignment: "right", style: "table_row" }, // Price
          { text: (line.qty * line.price).toFixed(2), alignment: "right", style: "table_row" }, // Amount
        ];
      });

      const statusColorMap = {
        paid: "#68db51",
        unpaid: "orange",
        cancelled: "#f4b255",
      };

      const borderColor = statusColorMap[context.invoice.invoiceStatus];


      var dd = {
        content: [
          // Group 1: Invoice Details (Top Section)
          {
            columns: [
              {
                width: "50%",
                stack: [
                  {
                    columns: [
                      { text: "Nano Invoice", style: "title", width: "auto" },

                      {
                        table: {
                          widths: ["auto"],
                          body: [
                            [
                              {
                                text: context.invoice.status_id,
                                style: "status",
                                padding: [4, 8], // Add padding inside the border
                                color: borderColor
                              },
                            ],
                          ],
                        },
                        layout: {
                          hLineWidth: function (i, node) {
                            return 1;
                          }, // Horizontal border width
                          vLineWidth: function (i, node) {
                            return 1;
                          }, // Vertical border width
                          hLineColor: function (i, node) {
                            return borderColor;
                          }, // Horizontal border color
                          vLineColor: function (i, node) {
                            return borderColor;
                          }, // Vertical border color
                        },
                        margin: [10, 2, 0, 0], // Adjust margin as needed
                      },
                    ],
                  },
                  {
                    text: context.invoice.id,
                    style: "id",
                  },
                ],
              },
              {
                width: "50%",
                alignment: "right",
                stack: [
                  {
                    columns: [
                      {
                        text: "Date:",
                        bold: true,
                        width: "70%",
                        alignment: "right",
                      },
                      {
                        text: context.invoice.invoice_date,
                        width: "30%",
                        alignment: "right",
                        style: "date",
                      },
                    ],
                    margin: [0, 0, 0, 4],
                  },
                  {
                    columns: [
                      {
                        text: "Due Date:",
                        bold: true,
                        width: "70%",
                        alignment: "right",
                      },
                      {
                        text: context.invoice.due_date,
                        width: "30%",
                        alignment: "right",
                        style: "date",
                      },
                    ],
                  },
                ],
              },
            ],
            columnGap: 0,
            marginBottom: 50,
          },

          // Group 2: Address Details (From & To Section)
          {
            table: {
              widths: ["*", 20, "*"], // Equal width for the two columns, and a small width for the spacer
              body: [
                [
                  {
                    border: [true, true, true, true], // Border on all sides
                    stack: [
                      { text: "From:", bold: true, marginBottom: 10 },
                      { text: context.company.company_name, style: "details", marginBottom: 3 },
                      {
                        text: context.company.address,
                        style: "details",
                        marginBottom: 3,
                      },
                      { text: context.company.phone, style: "details", marginBottom: 3 },
                      { text: context.company.email, style: "details" },
                    ],
                  },
                  {
                    border: [false, false, false, false], // No border for the spacer
                    text: "", // Empty text for the spacer
                  },
                  {
                    border: [true, true, true, true], // Border on all sides
                    stack: [
                      { text: "To:", bold: true, marginBottom: 10 },
                      {
                        text: context.customer.first_name,
                        style: "details",
                        marginBottom: 3,
                      },
                      {
                        text: context.customer.address,
                        style: "details",
                        marginBottom: 3,
                      },
                      { text: context.customer.phone, style: "details", marginBottom: 3 },
                      { text: context.customer.email, style: "details" },
                    ],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function (i, node) {
                return 1; // Horizontal line width
              },
              vLineWidth: function (i, node) {
                return 1; // Vertical line width
              },
              hLineColor: function (i, node) {
                return "#f2f5f8"; // Horizontal line color
              },
              vLineColor: function (i, node) {
                return "#f2f5f8"; // Vertical line color
              },

              paddingLeft: function (i, node) {
                return 10;
              }, // Left padding
              paddingRight: function (i, node) {
                return 10;
              }, // Right padding
              paddingTop: function (i, node) {
                return 10;
              }, // Left padding
              paddingBottom: function (i, node) {
                return 10;
              }, // Right padding
            },
          },

          // Group 3: Table
          {
            table: {
              headerRows: 1,
              widths: ["10%", "40%", "15%", "15%", "20%"],
              body: [
                // Table Headers
                [
                  { text: "#", bold: true, style: "table_header" },
                  { text: "Description", bold: true, style: "table_header" },
                  {
                    text: "QTY",
                    bold: true,
                    alignment: "right",
                    style: "table_header",
                  },
                  {
                    text: "Price",
                    bold: true,
                    alignment: "right",
                    style: "table_header",
                  },
                  {
                    text: "Amount",
                    bold: true,
                    alignment: "right",
                    style: "table_header",
                  },
                ],

                ...tableBody,


              ],
            },
            layout: {
              fillColor: function (rowIndex) {
                return rowIndex === 0 ? "#fafafb" : null; // Light gray background for headers
              },
              paddingLeft: function (i, node) {
                return 10;
              }, // Left padding
              paddingRight: function (i, node) {
                return 8;
              }, // Right padding
              paddingTop: function (i, node) {
                return i === 0 ? 8 : 13;
              }, // Less padding on header row
              paddingBottom: function (i, node) {
                return i === 0 ? 8 : 13;
              }, // Less padding on header row
              vLineWidth: function (i, node) {
                return 0;
              }, // Removes vertical lines
              hLineColor: function (i, node) {
                return "#f2f5f8";
              },
            },
            margin: [0, 20, 0, 20], // Adds space above the table
          },

          // Group 4: Calculated
          {
            table: {
              widths: ["80%", "8%", "12%"], // Adjust column widths
              body: [
                [
                  {
                    text: "Sub total:",
                    alignment: "right",
                    bold: true,
                    style: "calc_label",
                  },
                  { text: "R", alignment: "right", style: "amount" }, // Currency column
                  { text: context.subTotal(), alignment: "right", style: "amount" }, // Amount column
                ],
                [
                  {
                    text: "Discount:",
                    alignment: "right",
                    bold: true,
                    style: "calc_label",
                  },
                  {
                    text: "R",
                    alignment: "right",
                    style: "amount",
                    color: "green",
                  },
                  {
                    text: context.discount(),
                    alignment: "right",
                    style: "amount",
                    color: "green",
                  },
                ],
                [
                  {
                    text: "Tax:",
                    alignment: "right",
                    bold: true,
                    style: "calc_label",
                  },
                  { text: "R", alignment: "right", style: "amount" },
                  { text: context.tax_calculation(), alignment: "right", style: "amount" },
                ],
                [
                  {
                    text: "Grand total:",
                    alignment: "right",
                    bold: true,
                    fontSize: 11,
                  },
                  { text: "R", alignment: "right", bold: true, fontSize: 11 },
                  {
                    text: context.grandTotal(),
                    alignment: "right",
                    bold: true,
                    fontSize: 11,
                  },
                ],
              ],
            },
            layout: {
              paddingTop: function (i, node) {
                return 8;
              }, // Less padding on header row
              paddingBottom: function (i, node) {
                return 8;
              }, // Less padding on header row
              vLineWidth: function (i, node) {
                return 0;
              }, // Removes vertical lines
              hLineWidth: function (i, node) {
                return 0;
              }, // Removes vertical lines
            },
          },

          // Group 5: Footer
          {
            columns: [
              { text: "Notes:", style: "notes", width: "auto" },
              {
                text: context.invoice.invoice_note,
                style: "footerText",
                width: "*",
              },
            ],
            margin: [0, 30, 0, 0],
          },
        ],

        styles: {
          title: {
            fontSize: 25,
            bold: true,
            marginBottom: 5,
          },
          status: {
            fontSize: 9,
            italics: true,
            color: "green",
          },
          id: {
            fontSize: 11,
            color: "gray",
            marginBottom: 10,
          },
          date: {
            color: "gray",
            fontSize: 11,
          },
          details: {
            color: "gray",
            fontSize: 11,
          },

          amount: {
            fontSize: 10,
          },

          grandTotal: {
            fontSize: 10,
            bold: true,
            color: "green",
          },

          notes: {
            fontSize: 9,
            bold: true,
            marginRight: 5,
            color: "gray",
          },

          footerText: {
            fontSize: 9,
            italics: true,
          },

          table_header: {
            fontSize: 10,
            bold: true,
          },

          table_row: {
            fontSize: 10,
          },

          calc_label: {
            color: "gray",
            fontSize: 10,
          },
        },
      };

      return dd;

}

