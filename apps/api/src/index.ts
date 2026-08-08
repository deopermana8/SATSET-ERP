import { createServer, type IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";
import { handleCustomerPortalRoute } from "./customerPortal.js";
import { ActivityBookingController, type ActivityBookingRequest, type ActivityBookingResponse } from "./controllers/ActivityBookingController.js";
import { ActivityController, type ActivityRequest, type ActivityResponse } from "./controllers/ActivityController.js";
import { ActivityScheduleController, type ActivityScheduleRequest, type ActivityScheduleResponse } from "./controllers/ActivityScheduleController.js";
import { CafeOrderController, type CafeOrderRequest, type CafeOrderResponse } from "./controllers/CafeOrderController.js";
import { CashierShiftController, type CashierShiftRequest, type CashierShiftResponse } from "./controllers/CashierShiftController.js";
import { CustomerController, type CustomerRequest, type CustomerResponse } from "./controllers/CustomerController.js";
import { InventoryController } from "./controllers/InventoryController.js";
import { MenuCategoryController, type MenuCategoryRequest, type MenuCategoryResponse } from "./controllers/MenuCategoryController.js";
import { MenuItemController, type MenuItemRequest, type MenuItemResponse } from "./controllers/MenuItemController.js";
import { PurchaseOrderController } from "./controllers/PurchaseOrderController.js";
import { RecipeController } from "./controllers/RecipeController.js";
import { ReservationController, type ReservationRequest, type ReservationResponse } from "./controllers/ReservationController.js";
import { StockMovementController } from "./controllers/StockMovementController.js";
import { SupplierController } from "./controllers/SupplierController.js";
import { TicketController, type TicketRequest, type TicketResponse } from "./controllers/TicketController.js";
import { TicketSaleController, type TicketSaleRequest, type TicketSaleResponse } from "./controllers/TicketSaleController.js";
import { ActivityBookingRepository } from "./repositories/ActivityBookingRepository.js";
import { ActivityRepository } from "./repositories/ActivityRepository.js";
import { ActivityScheduleRepository } from "./repositories/ActivityScheduleRepository.js";
import { CafeOrderRepository } from "./repositories/CafeOrderRepository.js";
import { CashierShiftRepository } from "./repositories/CashierShiftRepository.js";
import { CustomerRepository } from "./repositories/CustomerRepository.js";
import { InventoryRepository } from "./repositories/InventoryRepository.js";
import { MenuCategoryRepository } from "./repositories/MenuCategoryRepository.js";
import { MenuItemRepository } from "./repositories/MenuItemRepository.js";
import { PurchaseOrderRepository } from "./repositories/PurchaseOrderRepository.js";
import { RecipeRepository } from "./repositories/RecipeRepository.js";
import { ReservationRepository } from "./repositories/ReservationRepository.js";
import { StockMovementRepository } from "./repositories/StockMovementRepository.js";
import { SupplierRepository } from "./repositories/SupplierRepository.js";
import { TicketRepository } from "./repositories/TicketRepository.js";
import { TicketSaleRepository } from "./repositories/TicketSaleRepository.js";
import { ACTIVITY_BOOKING_ROUTES } from "./routes/activity-booking.routes.js";
import { ACTIVITY_ROUTES } from "./routes/activity.routes.js";
import { ACTIVITY_SCHEDULE_ROUTES } from "./routes/activity-schedule.routes.js";
import { CAFE_ORDER_ROUTES } from "./routes/cafe-order.routes.js";
import { CASHIER_SHIFT_ROUTES } from "./routes/cashier-shift.routes.js";
import { CUSTOMER_ROUTES } from "./routes/customer.routes.js";
import { inventoryRoutes } from "./routes/inventoryRoutes.js";
import { MENU_CATEGORY_ROUTES } from "./routes/menu-category.routes.js";
import { MENU_ITEM_ROUTES } from "./routes/menu-item.routes.js";
import { purchaseOrderRoutes } from "./routes/purchaseOrderRoutes.js";
import { recipeRoutes } from "./routes/recipeRoutes.js";
import { RESERVATION_ROUTES } from "./routes/reservation.routes.js";
import { stockMovementRoutes } from "./routes/stockMovementRoutes.js";
import { supplierRoutes } from "./routes/supplierRoutes.js";
import { TICKET_ROUTES } from "./routes/ticket.routes.js";
import { TICKET_SALE_ROUTES } from "./routes/ticket-sale.routes.js";
import { ActivityBookingService } from "./services/ActivityBookingService.js";
import { ActivityService } from "./services/ActivityService.js";
import { ActivityScheduleService } from "./services/ActivityScheduleService.js";
import { CafeOrderService } from "./services/CafeOrderService.js";
import { CashierShiftService } from "./services/CashierShiftService.js";
import { CustomerService } from "./services/CustomerService.js";
import { InventoryReportService } from "./services/InventoryReportService.js";
import { InventoryService } from "./services/InventoryService.js";
import { MenuCategoryService } from "./services/MenuCategoryService.js";
import { MenuItemService } from "./services/MenuItemService.js";
import { PurchaseOrderService } from "./services/PurchaseOrderService.js";
import { RecipeService } from "./services/RecipeService.js";
import { ReservationService } from "./services/ReservationService.js";
import { StockMovementService } from "./services/StockMovementService.js";
import { SupplierService } from "./services/SupplierService.js";
import { TicketService } from "./services/TicketService.js";
import { TicketSaleService } from "./services/TicketSaleService.js";
import { CustomerValidator } from "./validators/CustomerValidator.js";
import { TicketValidator } from "./validators/TicketValidator.js";
import { TicketSaleValidator } from "./validators/TicketSaleValidator.js";

type RecordItem = { id: string; name: string; status: string };

const port = Number(process.env.API_PORT ?? 3001);
const records: RecordItem[] = [{ id: "001", name: "Destinasi Utama", status: "active" }];

// ERP Wisata in-memory store — replace with DB persistence via Prisma in production
const erpWisataStores: Record<string, RecordItem[]> = {
  destinasi: [{ id: "d001", name: "Wisata Alam Raya", status: "aktif" }],
  "paket-wisata": [],
  hotel: [],
  kendaraan: [],
  guide: [],
  customer: [],
  vendor: [],
  supplier: [],
  barang: [],
  gudang: [],
  karyawan: [],
  jabatan: [],
  departemen: [],
  bank: [],
  pajak: [],
  satuan: [],
  brand: [],
  kategori: [],
  reservasi: [],
  ticketing: [],
  pembayaran: [],
  kas: [],
  jurnal: []
};

const MAX_BODY_BYTES = 1_048_576; // 1 MB
const customerController = new CustomerController(
  new CustomerService(
    new CustomerRepository(),
    new CustomerValidator()
  )
);
const ticketRepository = new TicketRepository();
const ticketSaleRepository = new TicketSaleRepository();
const cashierShiftRepository = new CashierShiftRepository();
const reservationRepository = new ReservationRepository();
const activityRepository = new ActivityRepository();
const activityScheduleRepository = new ActivityScheduleRepository();
const activityBookingRepository = new ActivityBookingRepository();
const menuCategoryRepository = new MenuCategoryRepository();
const menuItemRepository = new MenuItemRepository();
const cafeOrderRepository = new CafeOrderRepository();
const supplierRepository = new SupplierRepository();
const inventoryRepository = new InventoryRepository();
const purchaseOrderRepository = new PurchaseOrderRepository();
const stockMovementRepository = new StockMovementRepository();
const recipeRepository = new RecipeRepository();
const stockMovementService = new StockMovementService(stockMovementRepository);
const inventoryService = new InventoryService(inventoryRepository, stockMovementService);
const inventoryReportService = new InventoryReportService(
  inventoryService,
  purchaseOrderRepository,
  stockMovementRepository
);
const ticketController = new TicketController(
  new TicketService(
    ticketRepository,
    new TicketValidator()
  )
);
const ticketSaleController = new TicketSaleController(
  new TicketSaleService(
    ticketSaleRepository,
    ticketRepository,
    cashierShiftRepository,
    new TicketSaleValidator()
  )
);
const cashierShiftController = new CashierShiftController(
  new CashierShiftService(
    cashierShiftRepository,
    ticketSaleRepository
  )
);
const reservationController = new ReservationController(
  new ReservationService(
    reservationRepository,
    ticketRepository,
    ticketSaleRepository,
    cashierShiftRepository
  )
);
const activityService = new ActivityService(activityRepository);
const activityScheduleService = new ActivityScheduleService(
  activityScheduleRepository,
  activityRepository
);
const activityController = new ActivityController(activityService);
const activityScheduleController = new ActivityScheduleController(activityScheduleService);
const activityBookingController = new ActivityBookingController(
  new ActivityBookingService(
    activityBookingRepository,
    activityRepository,
    activityScheduleRepository,
    activityScheduleService,
    reservationRepository
  )
);
const menuCategoryController = new MenuCategoryController(
  new MenuCategoryService(menuCategoryRepository)
);
const menuItemController = new MenuItemController(
  new MenuItemService(
    menuItemRepository,
    menuCategoryRepository
  )
);
const cafeOrderController = new CafeOrderController(
  new CafeOrderService(
    cafeOrderRepository,
    menuItemRepository,
    menuCategoryRepository,
    cashierShiftRepository,
    recipeRepository,
    inventoryRepository,
    inventoryService
  )
);
const supplierController = new SupplierController(
  new SupplierService(supplierRepository)
);
const inventoryController = new InventoryController(
  inventoryService,
  inventoryReportService
);
const purchaseOrderController = new PurchaseOrderController(
  new PurchaseOrderService(
    purchaseOrderRepository,
    supplierRepository,
    inventoryRepository,
    inventoryService
  )
);
const recipeController = new RecipeController(
  new RecipeService(recipeRepository, inventoryRepository)
);
const stockMovementController = new StockMovementController(stockMovementService);

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { reject(new Error("Payload too large")); return; }
      chunks.push(Buffer.from(chunk));
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function safeParseBody(raw: string): Record<string, any> | null {
  if (raw.length === 0) return {};
  try { return JSON.parse(raw) as Record<string, any>; }
  catch { return null; }
}

const REPORT_PERMISSION_CODE = "wisata.laporan";
const WORKSPACE_REPORT_TOKEN = "workspace-token";

function hasReportPermission(request: IncomingMessage): boolean {
  const authHeader = request.headers.authorization;
  if (!authHeader) return false;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return false;
  return token === WORKSPACE_REPORT_TOKEN;
}

function ensureReportPermission(request: IncomingMessage, response: import("node:http").ServerResponse): boolean {
  if (hasReportPermission(request)) {
    return true;
  }
  response.writeHead(403, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: `Forbidden: tidak punya izin '${REPORT_PERMISSION_CODE}'` }));
  return false;
}

type ReportPeriod = {
  from: string | null;
  to: string | null;
};

function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isRealDateKey(value: string): boolean {
  if (!isDateKey(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

function parseReportPeriod(searchParams: URLSearchParams): ReportPeriod {
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const from = fromRaw && fromRaw.trim() ? fromRaw.trim() : null;
  const to = toRaw && toRaw.trim() ? toRaw.trim() : null;

  if (from && !isRealDateKey(from)) {
    throw new Error("Invalid period: from must use YYYY-MM-DD format");
  }
  if (to && !isRealDateKey(to)) {
    throw new Error("Invalid period: to must use YYYY-MM-DD format");
  }
  if (from && to && from > to) {
    throw new Error("Invalid period: from cannot be after to");
  }

  return { from, to };
}

function withinPeriod(dateIso: string, period: ReportPeriod): boolean {
  const key = dateIso.slice(0, 10);
  if (period.from && key < period.from) return false;
  if (period.to && key > period.to) return false;
  return true;
}

type ApiControllerResponse = CustomerResponse
  & TicketResponse
  & TicketSaleResponse
  & CashierShiftResponse
  & ReservationResponse
  & ActivityResponse
  & ActivityScheduleResponse
  & ActivityBookingResponse
  & MenuCategoryResponse
  & MenuItemResponse
  & CafeOrderResponse;

function createControllerResponse(response: import("node:http").ServerResponse): ApiControllerResponse {
  let statusCode = 200;

  const apiResponse: ApiControllerResponse = {
    status(code: number): ApiControllerResponse {
      statusCode = code;
      return apiResponse;
    },
    json(payload: unknown): void {
      response.writeHead(statusCode, { "content-type": "application/json" });
      response.end(JSON.stringify(payload));
    },
    sendStatus(code: number): void {
      response.writeHead(code);
      response.end();
    }
  };

  return apiResponse;
}

createServer(async (request, response) => {
  try {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
  };

  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  Object.entries(corsHeaders).forEach(([key, value]) => response.setHeader(key, value));

  if (url.pathname === "/api/cashier-shift/open") {
    const controllerReq: CashierShiftRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CASHIER_SHIFT_ROUTES.postOpen.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
      await cashierShiftController.open(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/cashier-shift/close") {
    const controllerReq: CashierShiftRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CASHIER_SHIFT_ROUTES.postClose.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
      await cashierShiftController.close(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/cashier-shift/current") {
    const controllerReq: CashierShiftRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CASHIER_SHIFT_ROUTES.getCurrent.method) {
      await cashierShiftController.current(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/cashier-shift/summary") {
    const controllerReq: CashierShiftRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CASHIER_SHIFT_ROUTES.getSummary.method) {
      await cashierShiftController.summary(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/cashier-shift/history") {
    const controllerReq: CashierShiftRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CASHIER_SHIFT_ROUTES.getHistory.method) {
      await cashierShiftController.history(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const customerApiMatch = url.pathname.match(/^\/api\/customer(?:\/([^/]+))?$/);
  if (customerApiMatch) {
    const id = customerApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: CustomerRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === CUSTOMER_ROUTES.post.method || reqMethod === CUSTOMER_ROUTES.put.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === CUSTOMER_ROUTES.get.method && !id) {
      await customerController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === CUSTOMER_ROUTES.getById.method && id) {
      await customerController.getById(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === CUSTOMER_ROUTES.post.method && !id) {
      await customerController.create(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === CUSTOMER_ROUTES.put.method && id) {
      await customerController.update(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === CUSTOMER_ROUTES.delete.method && id) {
      await customerController.delete(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const ticketApiMatch = url.pathname.match(/^\/(?:api\/)?ticket(?:\/([^/]+))?$/);
  if (ticketApiMatch) {
    const id = ticketApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: TicketRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === TICKET_ROUTES.post.method || reqMethod === TICKET_ROUTES.put.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === TICKET_ROUTES.get.method && !id) {
      await ticketController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === TICKET_ROUTES.getById.method && id) {
      await ticketController.getById(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === TICKET_ROUTES.post.method && !id) {
      await ticketController.create(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === TICKET_ROUTES.put.method && id) {
      await ticketController.update(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === TICKET_ROUTES.delete.method && id) {
      await ticketController.delete(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const ticketSalePayMatch = url.pathname.match(/^\/api\/ticket-sale\/([^/]+)\/pay$/);
  if (ticketSalePayMatch) {
    const id = ticketSalePayMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: TicketSaleRequest = {
      params: { id }
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === TICKET_SALE_ROUTES.postPay.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
      await ticketSaleController.pay(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const ticketSalePrintMatch = url.pathname.match(/^\/api\/ticket-sale\/([^/]+)\/print$/);
  if (ticketSalePrintMatch) {
    const id = ticketSalePrintMatch[1];
    const controllerReq: TicketSaleRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === TICKET_SALE_ROUTES.postPrint.method) {
      await ticketSaleController.print(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const ticketSaleQrMatch = url.pathname.match(/^\/api\/ticket-sale\/([^/]+)\/qr$/);
  if (ticketSaleQrMatch) {
    const id = ticketSaleQrMatch[1];
    const controllerReq: TicketSaleRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === TICKET_SALE_ROUTES.getQr.method) {
      await ticketSaleController.getQr(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const ticketSaleVoidMatch = url.pathname.match(/^\/api\/ticket-sale\/([^/]+)\/void$/);
  if (ticketSaleVoidMatch) {
    const id = ticketSaleVoidMatch[1];
    const controllerReq: TicketSaleRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === TICKET_SALE_ROUTES.postVoid.method) {
      await ticketSaleController.voidTicket(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const ticketSaleTicketMatch = url.pathname.match(/^\/api\/ticket-sale\/([^/]+)\/ticket$/);
  if (ticketSaleTicketMatch) {
    const id = ticketSaleTicketMatch[1];
    const controllerReq: TicketSaleRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === TICKET_SALE_ROUTES.getTicket.method) {
      await ticketSaleController.getTicket(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/ticket-sale/checkin") {
    const controllerReq: TicketSaleRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === TICKET_SALE_ROUTES.postCheckIn.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
      await ticketSaleController.checkIn(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/ticket-sale/summary") {
    const controllerReq: TicketSaleRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === TICKET_SALE_ROUTES.getSummary.method) {
      await ticketSaleController.getSummary(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/ticket-sale/report") {
    const controllerReq: TicketSaleRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === TICKET_SALE_ROUTES.getReport.method) {
      if (!ensureReportPermission(request, response)) {
        return;
      }
      await ticketSaleController.getReport(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/cafe-order/report") {
    const controllerReq: CafeOrderRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CAFE_ORDER_ROUTES.getReport.method) {
      if (!ensureReportPermission(request, response)) {
        return;
      }
      await cafeOrderController.report(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/cafe-order/summary") {
    const controllerReq: CafeOrderRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CAFE_ORDER_ROUTES.getSummary.method) {
      await cafeOrderController.summary(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const cafeOrderPayMatch = url.pathname.match(/^\/api\/cafe-order\/([^/]+)\/pay$/);
  if (cafeOrderPayMatch) {
    const id = cafeOrderPayMatch[1];
    const controllerReq: CafeOrderRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CAFE_ORDER_ROUTES.postPay.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
      await cafeOrderController.pay(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const cafeOrderPrintMatch = url.pathname.match(/^\/api\/cafe-order\/([^/]+)\/print$/);
  if (cafeOrderPrintMatch) {
    const id = cafeOrderPrintMatch[1];
    const controllerReq: CafeOrderRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CAFE_ORDER_ROUTES.postPrint.method) {
      await cafeOrderController.print(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const cafeOrderVoidMatch = url.pathname.match(/^\/api\/cafe-order\/([^/]+)\/void$/);
  if (cafeOrderVoidMatch) {
    const id = cafeOrderVoidMatch[1];
    const controllerReq: CafeOrderRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === CAFE_ORDER_ROUTES.postVoid.method) {
      await cafeOrderController.void(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const cafeOrderApiMatch = url.pathname.match(/^\/api\/cafe-order(?:\/([^/]+))?$/);
  if (cafeOrderApiMatch) {
    const id = cafeOrderApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: CafeOrderRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === CAFE_ORDER_ROUTES.post.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === CAFE_ORDER_ROUTES.get.method && !id) {
      await cafeOrderController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === CAFE_ORDER_ROUTES.getById.method && id) {
      await cafeOrderController.getById(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === CAFE_ORDER_ROUTES.post.method && !id) {
      await cafeOrderController.create(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const menuItemApiMatch = url.pathname.match(/^\/api\/menu-item(?:\/([^/]+))?$/);
  if (menuItemApiMatch) {
    const id = menuItemApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: MenuItemRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === MENU_ITEM_ROUTES.post.method || reqMethod === MENU_ITEM_ROUTES.put.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === MENU_ITEM_ROUTES.get.method && !id) {
      await menuItemController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === MENU_ITEM_ROUTES.post.method && !id) {
      await menuItemController.create(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === MENU_ITEM_ROUTES.put.method && id) {
      await menuItemController.update(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === MENU_ITEM_ROUTES.delete.method && id) {
      await menuItemController.delete(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const menuCategoryApiMatch = url.pathname.match(/^\/api\/menu-category(?:\/([^/]+))?$/);
  if (menuCategoryApiMatch) {
    const id = menuCategoryApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: MenuCategoryRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === MENU_CATEGORY_ROUTES.post.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === MENU_CATEGORY_ROUTES.get.method && !id) {
      await menuCategoryController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === MENU_CATEGORY_ROUTES.post.method && !id) {
      await menuCategoryController.create(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/activity-booking/report") {
    const controllerReq: ActivityBookingRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === ACTIVITY_BOOKING_ROUTES.getReport.method) {
      if (!ensureReportPermission(request, response)) {
        return;
      }
      await activityBookingController.report(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const activityBookingPayMatch = url.pathname.match(/^\/api\/activity-booking\/([^/]+)\/pay$/);
  if (activityBookingPayMatch) {
    const id = activityBookingPayMatch[1];
    const controllerReq: ActivityBookingRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === ACTIVITY_BOOKING_ROUTES.postPay.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
      await activityBookingController.pay(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const activityBookingCheckInMatch = url.pathname.match(/^\/api\/activity-booking\/([^/]+)\/checkin$/);
  if (activityBookingCheckInMatch) {
    const id = activityBookingCheckInMatch[1];
    const controllerReq: ActivityBookingRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === ACTIVITY_BOOKING_ROUTES.postCheckIn.method) {
      await activityBookingController.checkIn(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const activityBookingCancelMatch = url.pathname.match(/^\/api\/activity-booking\/([^/]+)\/cancel$/);
  if (activityBookingCancelMatch) {
    const id = activityBookingCancelMatch[1];
    const controllerReq: ActivityBookingRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === ACTIVITY_BOOKING_ROUTES.postCancel.method) {
      await activityBookingController.cancel(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const activityBookingQrMatch = url.pathname.match(/^\/api\/activity-booking\/([^/]+)\/qr$/);
  if (activityBookingQrMatch) {
    const id = activityBookingQrMatch[1];
    const controllerReq: ActivityBookingRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === ACTIVITY_BOOKING_ROUTES.getQr.method) {
      await activityBookingController.qr(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const activityBookingApiMatch = url.pathname.match(/^\/api\/activity-booking(?:\/([^/]+))?$/);
  if (activityBookingApiMatch) {
    const id = activityBookingApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: ActivityBookingRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === ACTIVITY_BOOKING_ROUTES.post.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === ACTIVITY_BOOKING_ROUTES.get.method && !id) {
      await activityBookingController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === ACTIVITY_BOOKING_ROUTES.post.method && !id) {
      await activityBookingController.create(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const activityScheduleApiMatch = url.pathname.match(/^\/api\/activity-schedule(?:\/([^/]+))?$/);
  if (activityScheduleApiMatch) {
    const id = activityScheduleApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: ActivityScheduleRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === ACTIVITY_SCHEDULE_ROUTES.post.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === ACTIVITY_SCHEDULE_ROUTES.get.method && !id) {
      await activityScheduleController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === ACTIVITY_SCHEDULE_ROUTES.post.method && !id) {
      await activityScheduleController.create(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const activityApiMatch = url.pathname.match(/^\/api\/activity(?:\/([^/]+))?$/);
  if (activityApiMatch) {
    const id = activityApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: ActivityRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === ACTIVITY_ROUTES.post.method || reqMethod === ACTIVITY_ROUTES.put.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === ACTIVITY_ROUTES.get.method && !id) {
      await activityController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === ACTIVITY_ROUTES.post.method && !id) {
      await activityController.create(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === ACTIVITY_ROUTES.put.method && id) {
      await activityController.update(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === ACTIVITY_ROUTES.delete.method && id) {
      await activityController.delete(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/reservation/report") {
    const controllerReq: ReservationRequest = { params: {} };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === RESERVATION_ROUTES.getReport.method) {
      if (!ensureReportPermission(request, response)) {
        return;
      }
      await reservationController.getReport(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === "/api/erp-wisata/report") {
    if ((request.method ?? "GET") === "GET") {
      if (!ensureReportPermission(request, response)) {
        return;
      }

      let period: ReportPeriod;
      try {
        period = parseReportPeriod(url.searchParams);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid period";
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: message }));
        return;
      }

      const ticketRows = (await ticketSaleRepository.findAll()).filter((item) => withinPeriod(item.soldAt, period));
      const reservationRows = (await reservationRepository.findAll()).filter((item) => withinPeriod(item.createdAt, period));
      const activityRows = (await activityBookingRepository.findAll()).filter((item) => withinPeriod(item.createdAt, period));
      const cafeRows = (await cafeOrderRepository.findAll()).filter((item) => withinPeriod(item.createdAt, period));
      const inventoryRows = (await inventoryRepository.findAll()).filter((item) => withinPeriod(item.createdAt, period));
      const movementRows = (await stockMovementRepository.findAll()).filter((item) => withinPeriod(item.createdAt, period));

      const ticketPaidStatuses = new Set(["PAID", "PRINTED", "CHECKED_IN"]);
      const activityPaidStatuses = new Set(["PAID", "CONFIRMED", "CHECKED_IN", "COMPLETED"]);

      const ticketGross = ticketRows.reduce((sum, item) => sum + item.total, 0);
      const cafeGross = cafeRows.reduce((sum, item) => sum + item.total, 0);
      const reservationGross = reservationRows.reduce((sum, item) => sum + item.totalAmount, 0);
      const activityGross = activityRows.reduce((sum, item) => sum + item.total, 0);

      const ticketPaid = ticketRows
        .filter((item) => ticketPaidStatuses.has(item.status))
        .reduce((sum, item) => sum + item.total, 0);
      const cafePaid = cafeRows
        .filter((item) => item.paymentStatus === "PAID")
        .reduce((sum, item) => sum + item.total, 0);
      const reservationPaid = reservationRows
        .filter((item) => item.paymentStatus === "PAID")
        .reduce((sum, item) => sum + item.totalAmount, 0);
      const activityPaid = activityRows
        .filter((item) => activityPaidStatuses.has(item.status))
        .reduce((sum, item) => sum + item.total, 0);

      const ticketOutstanding = ticketRows
        .filter((item) => item.status === "NEW")
        .reduce((sum, item) => sum + item.total, 0);
      const cafeOutstanding = cafeRows
        .filter((item) => item.paymentStatus === "UNPAID")
        .reduce((sum, item) => sum + item.total, 0);
      const reservationOutstanding = reservationRows
        .filter((item) => item.paymentStatus === "WAITING_PAYMENT")
        .reduce((sum, item) => sum + item.totalAmount, 0);
      const activityOutstanding = activityRows
        .filter((item) => item.status === "WAITING_PAYMENT")
        .reduce((sum, item) => sum + item.total, 0);

      const ticketCancelled = ticketRows
        .filter((item) => item.status === "VOID")
        .reduce((sum, item) => sum + item.total, 0);
      const cafeCancelled = cafeRows
        .filter((item) => item.status === "VOID")
        .reduce((sum, item) => sum + item.total, 0);
      const reservationCancelled = reservationRows
        .filter((item) => item.reservationStatus === "CANCELLED")
        .reduce((sum, item) => sum + item.totalAmount, 0);
      const activityCancelled = activityRows
        .filter((item) => item.status === "CANCELLED")
        .reduce((sum, item) => sum + item.total, 0);

      const inventoryValue = inventoryRows.reduce((sum, item) => sum + (item.currentStock * item.averageCost), 0);

      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({
        period: {
          from: period.from,
          to: period.to
        },
        operational: {
          ticketSales: {
            total: ticketRows.length,
            paid: ticketRows.filter((item) => ticketPaidStatuses.has(item.status)).length,
            checkedIn: ticketRows.filter((item) => item.status === "CHECKED_IN").length,
            void: ticketRows.filter((item) => item.status === "VOID").length,
            grossSales: ticketGross
          },
          reservations: {
            total: reservationRows.length,
            paid: reservationRows.filter((item) => item.paymentStatus === "PAID").length,
            waitingPayment: reservationRows.filter((item) => item.paymentStatus === "WAITING_PAYMENT").length,
            cancelled: reservationRows.filter((item) => item.reservationStatus === "CANCELLED").length
          },
          activityBookings: {
            total: activityRows.length,
            confirmed: activityRows.filter((item) => item.status === "CONFIRMED" || item.status === "PAID").length,
            checkedIn: activityRows.filter((item) => item.status === "CHECKED_IN").length,
            completed: activityRows.filter((item) => item.status === "COMPLETED").length,
            cancelled: activityRows.filter((item) => item.status === "CANCELLED").length
          },
          cafeOrders: {
            total: cafeRows.length,
            paid: cafeRows.filter((item) => item.paymentStatus === "PAID").length,
            completed: cafeRows.filter((item) => item.status === "COMPLETED").length,
            void: cafeRows.filter((item) => item.status === "VOID").length,
            totalSales: cafeRows
              .filter((item) => item.paymentStatus === "PAID" && item.status !== "VOID")
              .reduce((sum, item) => sum + item.total, 0)
          },
          inventory: {
            items: inventoryRows.length,
            lowStock: inventoryRows.filter((item) => item.currentStock <= item.minimumStock).length,
            inventoryValue,
            stockMovements: movementRows.length
          }
        },
        financial: {
          grossSales: ticketGross + cafeGross + reservationGross + activityGross,
          paidSales: ticketPaid + cafePaid + reservationPaid + activityPaid,
          outstanding: ticketOutstanding + cafeOutstanding + reservationOutstanding + activityOutstanding,
          cancelled: ticketCancelled + cafeCancelled + reservationCancelled + activityCancelled
        },
        reservation: {
          total: reservationRows.length,
          confirmed: reservationRows.filter((item) => item.reservationStatus === "CONFIRMED" || item.reservationStatus === "PAID").length,
          checkedIn: reservationRows.filter((item) => item.reservationStatus === "CHECKED_IN").length,
          cancelled: reservationRows.filter((item) => item.reservationStatus === "CANCELLED").length
        }
      }));
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const reservationPayMatch = url.pathname.match(/^\/api\/reservation\/([^/]+)\/pay$/);
  if (reservationPayMatch) {
    const id = reservationPayMatch[1];
    const controllerReq: ReservationRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === RESERVATION_ROUTES.postPay.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
      await reservationController.pay(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const reservationConfirmMatch = url.pathname.match(/^\/api\/reservation\/([^/]+)\/confirm$/);
  if (reservationConfirmMatch) {
    const id = reservationConfirmMatch[1];
    const controllerReq: ReservationRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === RESERVATION_ROUTES.postConfirm.method) {
      await reservationController.confirm(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const reservationCheckInMatch = url.pathname.match(/^\/api\/reservation\/([^/]+)\/checkin$/);
  if (reservationCheckInMatch) {
    const id = reservationCheckInMatch[1];
    const controllerReq: ReservationRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === RESERVATION_ROUTES.postCheckIn.method) {
      await reservationController.checkIn(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const reservationCancelMatch = url.pathname.match(/^\/api\/reservation\/([^/]+)\/cancel$/);
  if (reservationCancelMatch) {
    const id = reservationCancelMatch[1];
    const controllerReq: ReservationRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === RESERVATION_ROUTES.postCancel.method) {
      await reservationController.cancel(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const reservationQrMatch = url.pathname.match(/^\/api\/reservation\/([^/]+)\/qr$/);
  if (reservationQrMatch) {
    const id = reservationQrMatch[1];
    const controllerReq: ReservationRequest = { params: { id } };
    const controllerRes = createControllerResponse(response);
    if ((request.method ?? "GET") === RESERVATION_ROUTES.getQr.method) {
      await reservationController.getQr(controllerReq, controllerRes);
      return;
    }
    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const reservationApiMatch = url.pathname.match(/^\/api\/reservation(?:\/([^/]+))?$/);
  if (reservationApiMatch) {
    const id = reservationApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: ReservationRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === RESERVATION_ROUTES.post.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === RESERVATION_ROUTES.get.method && !id) {
      await reservationController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === RESERVATION_ROUTES.getById.method && id) {
      await reservationController.getById(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === RESERVATION_ROUTES.post.method && !id) {
      await reservationController.create(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const ticketSaleApiMatch = url.pathname.match(/^\/api\/ticket-sale(?:\/([^/]+))?$/);
  if (ticketSaleApiMatch) {
    const id = ticketSaleApiMatch[1];
    const reqMethod = request.method ?? "GET";
    const controllerReq: TicketSaleRequest = {
      params: id ? { id } : {}
    };
    const controllerRes = createControllerResponse(response);

    if (reqMethod === TICKET_SALE_ROUTES.post.method) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      controllerReq.body = parsedBody;
    }

    if (reqMethod === TICKET_SALE_ROUTES.get.method && !id) {
      await ticketSaleController.getAll(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === TICKET_SALE_ROUTES.getById.method && id) {
      await ticketSaleController.getById(controllerReq, controllerRes);
      return;
    }

    if (reqMethod === TICKET_SALE_ROUTES.post.method && !id) {
      await ticketSaleController.create(controllerReq, controllerRes);
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const supplierMatch = url.pathname.match(/^\/api\/supplier(?:\/([^/]+))?$/);
  if (supplierMatch) {
    const id = supplierMatch[1];
    const reqMethod = request.method ?? "GET";

    if (reqMethod === "GET" && !id) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await supplierController.list()));
      return;
    }

    if (reqMethod === "GET" && id) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await supplierController.get(id)));
      return;
    }

    if (reqMethod === "POST" && url.pathname === supplierRoutes.create) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      response.writeHead(201, { "content-type": "application/json" });
      response.end(JSON.stringify(await supplierController.create(parsedBody as any)));
      return;
    }

    if (reqMethod === "PUT" && id) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await supplierController.update(id, parsedBody as any)));
      return;
    }

    if (reqMethod === "DELETE" && id) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await supplierController.remove(id)));
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const inventoryMatch = url.pathname.match(/^\/api\/inventory(?:\/([^/]+))?$/);
  if (inventoryMatch) {
    const id = inventoryMatch[1];
    const reqMethod = request.method ?? "GET";

    if (reqMethod === "GET" && url.pathname === inventoryRoutes.report) {
      if (!ensureReportPermission(request, response)) {
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await inventoryController.report()));
      return;
    }

    if (reqMethod === "GET" && url.pathname === inventoryRoutes.dashboard) {
      if (!ensureReportPermission(request, response)) {
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await inventoryController.dashboard()));
      return;
    }

    if (reqMethod === "POST" && url.pathname === inventoryRoutes.stockAdjustment) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await inventoryController.adjustStock(parsedBody as any)));
      return;
    }

    if (reqMethod === "GET" && !id && url.pathname === inventoryRoutes.list) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await inventoryController.list()));
      return;
    }

    if (reqMethod === "GET" && id) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await inventoryController.get(id)));
      return;
    }

    if (reqMethod === "POST" && url.pathname === inventoryRoutes.create) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      response.writeHead(201, { "content-type": "application/json" });
      response.end(JSON.stringify(await inventoryController.create(parsedBody as any)));
      return;
    }

    if (reqMethod === "PUT" && id) {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await inventoryController.update(id, parsedBody as any)));
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (url.pathname === purchaseOrderRoutes.list) {
    const reqMethod = request.method ?? "GET";
    if (reqMethod === "GET") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(await purchaseOrderController.list()));
      return;
    }

    if (reqMethod === "POST") {
      const rawBody = await readBody(request);
      const parsedBody = safeParseBody(rawBody);
      if (!parsedBody) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
      response.writeHead(201, { "content-type": "application/json" });
      response.end(JSON.stringify(await purchaseOrderController.create(parsedBody as any)));
      return;
    }

    response.writeHead(405, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const poByIdMatch = url.pathname.match(purchaseOrderRoutes.getById);
  if (poByIdMatch) {
    if ((request.method ?? "GET") !== "GET") {
      response.writeHead(405, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    const data = await purchaseOrderController.get(poByIdMatch[1]);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(data));
    return;
  }

  const poApproveMatch = url.pathname.match(purchaseOrderRoutes.approve);
  if (poApproveMatch) {
    if ((request.method ?? "GET") !== "POST") {
      response.writeHead(405, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    const data = await purchaseOrderController.approve(poApproveMatch[1]);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(data));
    return;
  }

  const poReceiveMatch = url.pathname.match(purchaseOrderRoutes.receive);
  if (poReceiveMatch) {
    if ((request.method ?? "GET") !== "POST") {
      response.writeHead(405, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    const data = await purchaseOrderController.receive(poReceiveMatch[1]);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(data));
    return;
  }

  const poCancelMatch = url.pathname.match(purchaseOrderRoutes.cancel);
  if (poCancelMatch) {
    if ((request.method ?? "GET") !== "POST") {
      response.writeHead(405, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    const rawBody = await readBody(request);
    const parsedBody = safeParseBody(rawBody);
    if (!parsedBody) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }
    const data = await purchaseOrderController.cancel(poCancelMatch[1], parsedBody as any);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(data));
    return;
  }

  if (url.pathname === recipeRoutes.list) {
    if ((request.method ?? "GET") !== "GET") {
      response.writeHead(405, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(await recipeController.list()));
    return;
  }

  const recipeByMenuMatch = url.pathname.match(recipeRoutes.upsertByMenuId);
  if (recipeByMenuMatch) {
    if ((request.method ?? "GET") !== "POST") {
      response.writeHead(405, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    const rawBody = await readBody(request);
    const parsedBody = safeParseBody(rawBody);
    if (!parsedBody) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(await recipeController.upsert(recipeByMenuMatch[1], parsedBody as any)));
    return;
  }

  if (url.pathname === stockMovementRoutes.list) {
    if ((request.method ?? "GET") !== "GET") {
      response.writeHead(405, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    const query = {
      inventoryId: url.searchParams.get("inventoryId") ?? undefined,
      movementType: url.searchParams.get("movementType") ?? undefined,
      reference: url.searchParams.get("reference") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined
    };

    const data = await stockMovementController.listByQuery(query);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(data));
    return;
  }

  if (url.pathname.startsWith("/customer")) {
    const handled = await handleCustomerPortalRoute({ request, response, url, readBody, safeParseBody });
    if (handled) return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "api" }));
    return;
  }

  if (request.method === "GET" && url.pathname === "/records") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(records));
    return;
  }

  if (request.method === "POST" && url.pathname === "/records") {
    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) { response.writeHead(400, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Invalid JSON body" })); return; }
    const created = {
      id: randomUUID(),
      name: parsed.name ?? "Untitled Record",
      status: parsed.status ?? "active"
    };
    records.push(created);
    response.writeHead(201, { "content-type": "application/json" });
    response.end(JSON.stringify(created));
    return;
  }

  if (request.method === "POST" && url.pathname === "/auth/login") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ token: "workspace-token", user: "admin" }));
    return;
  }

  // ERP Wisata CRUD routes: /erp-wisata/{entity}
  const erpMatch = url.pathname.match(/^\/erp-wisata\/([a-z-]+)(\/([^/]+))?$/);
  if (erpMatch) {
    const entity = erpMatch[1];
    const id = erpMatch[3];
    const store = erpWisataStores[entity];
    if (!store) {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: `Entity '${entity}' not found` }));
      return;
    }
    if (request.method === "GET" && !id) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ data: store, total: store.length }));
      return;
    }
    if (request.method === "GET" && id) {
      const item = store.find(r => r.id === id);
      if (!item) { response.writeHead(404, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Not found" })); return; }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(item));
      return;
    }
    if (request.method === "POST") {
      const raw = await readBody(request);
      const parsed = safeParseBody(raw);
      if (!parsed) { response.writeHead(400, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Invalid JSON body" })); return; }
      const item = { id: randomUUID(), name: parsed.name ?? "New Item", status: parsed.status ?? "aktif" };
      store.push(item);
      response.writeHead(201, { "content-type": "application/json" });
      response.end(JSON.stringify(item));
      return;
    }
    if (request.method === "PUT" && id) {
      const idx = store.findIndex(r => r.id === id);
      if (idx === -1) { response.writeHead(404, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Not found" })); return; }
      const raw = await readBody(request);
      const parsed = safeParseBody(raw);
      if (!parsed) { response.writeHead(400, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Invalid JSON body" })); return; }
      const { id: _id, ...safe } = parsed; // prevent id overwrite
      store[idx] = { ...store[idx], ...safe };
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(store[idx]));
      return;
    }
    if (request.method === "DELETE" && id) {
      const idx = store.findIndex(r => r.id === id);
      if (idx === -1) { response.writeHead(404, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Not found" })); return; }
      store.splice(idx, 1);
      response.writeHead(204);
      response.end();
      return;
    }
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "Not Found" }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    if (!response.headersSent) {
      response.writeHead(msg === "Payload too large" ? 413 : 500, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: msg }));
    }
  }
}).listen(port, () => {
  console.log(`[api] listening on http://127.0.0.1:${port}`);
});
