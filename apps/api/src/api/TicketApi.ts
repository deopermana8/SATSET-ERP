import { TICKET_ROUTES } from "../routes/ticket.routes.js";

// Metadata route map for integrations that need ticket endpoint discovery.
export const TicketApi = {
	basePath: "/api/ticket",
	routes: TICKET_ROUTES
};
