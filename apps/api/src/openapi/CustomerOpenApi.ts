export const CustomerOpenAPI = {
  openapi: "3.0.0",
  info: {
    title: "Customer API",
    version: "1.0.0"
  },
  paths: {
    "/customer": {
      get: {
        summary: "List Customer",
        responses: {
          "200": {
            description: "OK"
          }
        }
      },
      post: {
        summary: "Create Customer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateCustomerRequest"
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
    "/customer/{id}": {
      get: {
        summary: "Get Customer by id",
        responses: {
          "200": {
            description: "OK"
          }
        }
      },
      put: {
        summary: "Update Customer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateCustomerRequest"
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
        summary: "Delete Customer",
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
      CreateCustomerRequest: {
        type: "object",
        properties: {}
      },
      UpdateCustomerRequest: {
        type: "object",
        properties: {}
      },
      CustomerResponse: {
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
