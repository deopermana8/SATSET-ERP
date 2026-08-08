import { CUSTOMER_ROUTES } from "../routes/customer.routes.js";

// Metadata route map for integrations that need customer endpoint discovery.
export const CustomerApi = {
	basePath: "/api/customer",
	routes: CUSTOMER_ROUTES
};
