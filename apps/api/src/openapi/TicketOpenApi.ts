export const TicketOpenAPI = {
  openapi: "3.0.0",
  info: {
    title: "Ticket API",
    version: "1.0.0"
  },
  paths: {
    "/ticket": {
      get: {
        summary: "List Ticket",
        responses: {
          "200": {
            description: "OK"
          }
        }
      },
      post: {
        summary: "Create Ticket",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateTicketRequest"
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
    "/ticket/{id}": {
      get: {
        summary: "Get Ticket by id",
        responses: {
          "200": {
            description: "OK"
          }
        }
      },
      put: {
        summary: "Update Ticket",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateTicketRequest"
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
        summary: "Delete Ticket",
        responses: {
          "204": {
            description: "No Content"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      CreateTicketRequest: {
        type: "object",
        properties: {}
      },
      UpdateTicketRequest: {
        type: "object",
        properties: {}
      },
      TicketResponse: {
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
