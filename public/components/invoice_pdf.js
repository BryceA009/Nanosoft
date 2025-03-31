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
                          text: "Cancelled",
                          style: "status",
                          padding: [4, 8], // Add padding inside the border
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
                      return "green";
                    }, // Horizontal border color
                    vLineColor: function (i, node) {
                      return "green";
                    }, // Vertical border color
                  },
                  margin: [10, 2, 0, 0], // Adjust margin as needed
                },
              ],
            },
            {
              text: "67d02a19274a83ad9456525e",
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
                { text: "Date:", bold: true, width: "70%", alignment: "right" },
                {
                  text: "2002-07-07",
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
                  text: "2000-04-19",
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
            widths: ['*', 20, '*'], // Equal width for the two columns, and a small width for the spacer
            body: [
              [
                {
                  border: [true, true, true, true], // Border on all sides
                  stack: [
                    { text: "From:", bold: true, marginBottom: 10 },
                    { text: "Bruce", style: "details", marginBottom: 3 },
                    { text: "123 Pluto Road Plumstead", style: "details", marginBottom: 3 },
                    { text: "0685889960", style: "details", marginBottom: 3 },
                    { text: "Fuga Incididunt qui", style: "details" },
                  ],
                },
                {
                  border: [false, false, false, false], // No border for the spacer
                  text: '', // Empty text for the spacer
                },
                {
                  border: [true, true, true, true], // Border on all sides
                  stack: [
                    { text: "To:", bold: true, marginBottom: 10 },
                    { text: "Bryce Allies", style: "details" , marginBottom: 3 },
                    { text: "123 Pluto Road Plumstead", style: "details", marginBottom: 3 },
                    { text: "0685889960", style: "details", marginBottom: 3 },
                    { text: "bryce.allies@outlook.com", style: "details" },
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
              return '#f2f5f8'; // Horizontal line color
            },
            vLineColor: function (i, node) {
              return '#f2f5f8'; // Vertical line color
            },
            
            paddingLeft: function (i, node) { return 10; },  // Left padding
            paddingRight: function (i, node) { return 10; }, // Right padding
            paddingTop: function (i, node) { return 10; },  // Left padding
            paddingBottom: function (i, node) { return 10; }, // Right padding

            
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
                { text: "QTY", bold: true, alignment: "right", style: "table_header" },
                { text: "Price", bold: true, alignment: "right", style: "table_header" },
                { text: "Amount", bold: true, alignment: "right", style: "table_header" },
              ],
              // Static Rows
              [
                { text: "1", style: "table_row" },
                { text: "Soluta nulla incidid" , style: "table_row" },
                { text: "6", alignment: "right" , style: "table_row" },
                { text: "89", alignment: "right" , style: "table_row" },
                { text: "5340.00", alignment: "right" , style: "table_row" },
              ],
              [
                { text: "2" , style: "table_row" },
                { text: "Don" , style: "table_row" },
                { text: "50", alignment: "right" , style: "table_row" },
                { text: "2", alignment: "right" , style: "table_row" },
                { text: "100.00", alignment: "right" , style: "table_row" },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 ? "#fafafb" : null; // Light gray background for headers
            },
            paddingLeft: function (i, node) { return 10; },  // Left padding
            paddingRight: function (i, node) { return 8; }, // Right padding
            paddingTop: function (i, node) { return i === 0 ? 8 : 13; },  // Less padding on header row
            paddingBottom: function (i, node) { return i === 0 ? 8 : 13; }, // Less padding on header row
            vLineWidth: function (i, node) { return 0; },  // Removes vertical lines
            hLineColor: function (i, node) { return "#f2f5f8"; },
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
            { text: "106.00", alignment: "right", style: "amount" }, // Amount column
          ],
          [
            {
              text: "Discount:",
              alignment: "right",
              bold: true,
              style: "calc_label",
            },
            { text: "R", alignment: "right", style: "amount", color: "green" },
            { text: "50", alignment: "right", style: "amount", color: "green" },
          ],
          [
            {
              text: "Tax:",
              alignment: "right",
              bold: true,
              style: "calc_label",
            },
            { text: "R", alignment: "right", style: "amount" },
            { text: "150", alignment: "right", style: "amount" },
          ],
          [
            {
              text: "Grand total:",
              alignment: "right",
              bold: true,
              fontSize: 11,
            },
            { text: "R", alignment: "right", bold: true, fontSize: 11 },
            { text: "1100", alignment: "right", bold: true, fontSize: 11 },
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
          text: "It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!",
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
      fontSize: 11,
    },

    grandTotal: {
      fontSize: 11,
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
      fontSize: 11,
    },
  },
};
