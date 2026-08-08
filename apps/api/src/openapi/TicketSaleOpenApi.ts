export const TicketSaleOpenAPI = {
  openapi: "3.0.0",
  info: {
    title: "TicketSale API",
    version: "1.0.0"
  },
  paths: {
    "/ticket-sale": {
      get: {
        summary: "List TicketSale",
        responses: {
          "200": {
            description: "OK"
          }
        }
      },
      post: {
        summary: "Create TicketSale",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateTicketSaleRequest"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Created"
          }
        }
      }
    },
    "/ticket-sale/{id}": {
      get: {
        summary: "Get TicketSale by id",
        responses: {
          "200": {
            description: "OK"
          }
        }
      },
      put: {
        summary: "Update TicketSale",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateTicketSaleRequest"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Updated"
          }
        }
      },
      delete: {
        summary: "Delete TicketSale",
        responses: {
          "204": {
            description: "No Content"
          }
        }
      }
    },
    "/ticket-sale/{id}/pay": {
      post: {
        summary: "Pay TicketSale",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  paymentMethod: { type: "string", enum: ["CASH", "QRIS", "TRANSFER"] },
                  paidAmount: { type: "number" }
                },
                required: ["paymentMethod", "paidAmount"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Paid"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      CreateTicketSaleRequest: {
        type: "object",
        properties: {}
      },
      UpdateTicketSaleRequest: {
        type: "object",
        properties: {}
      },
      TicketSaleResponse: {
        type: "object",
        properties: {
          id: {
            type: "string"
          }
        }
      }
    }
  }
};
