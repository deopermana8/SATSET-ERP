import { TICKET_SALE_ROUTES } from "../routes/ticket-sale.routes.js";

// Metadata route map for integrations that need ticket-sale endpoint discovery.
export const TicketSaleApi = {
	basePath: "/api/ticket-sale",
	routes: TICKET_SALE_ROUTES
};
