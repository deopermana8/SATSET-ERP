import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

type JsonObject = Record<string, unknown>;

type CustomerGender = "male" | "female" | "other";
type BookingType = "ticket" | "outbound" | "cafe";
type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "CANCELLED";

type CustomerAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  address: string;
  birthDate: string;
  gender: CustomerGender;
  emergencyContact: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

type PriceBreakdown = {
  subtotal: number;
  discount: number;
  tax: number;
  service: number;
  grandTotal: number;
  promoCode: string;
};

type BookingRecord = {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  type: BookingType;
  date: string;
  time: string;
  participants: number;
  payload: JsonObject;
  price: PriceBreakdown;
  paymentStatus: PaymentStatus;
  qrPayload: string;
  qrSvg: string;
  invoiceNumber: string;
  paymentExpiresAt: string;
  createdAt: string;
  updatedAt: string;
};

type PaymentRecord = {
  id: string;
  bookingId: string;
  customerId: string;
  gateway: "sandbox" | "midtrans" | "xendit";
  method: string;
  status: PaymentStatus;
  invoiceNumber: string;
  providerRef: string;
  expiresAt: string;
  createdAt: string;
};

type NotificationItem = {
  id: string;
  customerId: string;
  type: "booking" | "payment" | "voucher" | "promo";
  title: string;
  message: string;
  createdAt: string;
};

type PromoRule = {
  code: string;
  title: string;
  type: "percentage" | "fixed";
  value: number;
  minSubtotal: number;
  appliesTo: BookingType[];
};

type AvailabilitySlot = {
  time: string;
  remaining: number;
  isFull: boolean;
};

type SessionRecord = {
  customerId: string;
  expiresAt: number;
};

const customers: CustomerAccount[] = [];
const bookings: BookingRecord[] = [];
const payments: PaymentRecord[] = [];
const notifications: NotificationItem[] = [];
const sessions = new Map<string, SessionRecord>();
const seatLock = new Map<string, number>();

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_CUSTOMERS = 20_000;
const MAX_BOOKINGS = 100_000;
const MAX_PAYMENTS = 100_000;
const MAX_NOTIFICATIONS = 200_000;
const MAX_NAME_LENGTH = 120;
const MAX_TEXT_LENGTH = 280;
const MAX_PHONE_LENGTH = 20;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^0[0-9]{8,15}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const PAYMENT_METHODS = new Set(["virtual-account", "qris", "card"]);

const promos: PromoRule[] = [
  { code: "HEMAT10", title: "Diskon 10%", type: "percentage", value: 10, minSubtotal: 200_000, appliesTo: ["ticket", "outbound", "cafe"] },
  { code: "OUTBOUND50", title: "Diskon 50rb Outbound", type: "fixed", value: 50_000, minSubtotal: 750_000, appliesTo: ["outbound"] },
  { code: "CAFE20", title: "Diskon 20rb Cafe", type: "fixed", value: 20_000, minSubtotal: 150_000, appliesTo: ["cafe"] },
];

function nowIso(): string {
  return new Date().toISOString();
}

function toSafeText(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

function toLowerTrim(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function normalizePhone(value: unknown): string {
  const raw = String(value ?? "").replace(/[^0-9+]/g, "").trim().slice(0, MAX_PHONE_LENGTH);
  if (raw.startsWith("+62")) return `0${raw.slice(3)}`;
  if (raw.startsWith("62")) return `0${raw.slice(2)}`;
  return raw;
}

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

function isValidDate(date: string): boolean {
  return DATE_PATTERN.test(date);
}

function isValidTime(time: string): boolean {
  return TIME_PATTERN.test(time);
}

function normalizePaymentMethod(value: unknown): string {
  const method = String(value ?? "virtual-account").trim().toLowerCase();
  return PAYMENT_METHODS.has(method) ? method : "virtual-account";
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, digest] = storedHash.split(":");
  if (!salt || !digest) return false;
  const computed = scryptSync(password, salt, 64);
  const target = Buffer.from(digest, "hex");
  if (computed.length !== target.length) return false;
  return timingSafeEqual(computed, target);
}

function issueToken(customerId: string): string {
  const token = randomUUID();
  sessions.set(token, { customerId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function trimHead<T>(list: T[], max: number): void {
  if (list.length <= max) return;
  list.splice(max);
}

function pruneInMemoryState(): void {
  trimHead(customers, MAX_CUSTOMERS);
  trimHead(bookings, MAX_BOOKINGS);
  trimHead(payments, MAX_PAYMENTS);
  trimHead(notifications, MAX_NOTIFICATIONS);
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function customerPublic(account: CustomerAccount): Omit<CustomerAccount, "passwordHash"> {
  const { passwordHash: _passwordHash, ...rest } = account;
  return rest;
}

function toNumber(value: unknown): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function createBookingNumber(type: BookingType): string {
  const prefix = type === "ticket" ? "TKT" : type === "outbound" ? "OBD" : "CAF";
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const seq = String(bookings.filter((item) => item.type === type).length + 1).padStart(4, "0");
  return `${prefix}-${date}-${seq}`;
}

function createInvoiceNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const seq = String(payments.length + 1).padStart(5, "0");
  return `INV-${date}-${seq}`;
}

function createQrPayload(booking: BookingRecord): string {
  return JSON.stringify({
    bookingNumber: booking.bookingNumber,
    customerName: booking.customerName,
    date: booking.date,
    time: booking.time,
    status: booking.paymentStatus,
    source: "satset-customer",
  });
}

function createQrSvg(payload: string): string {
  const digest = createHash("sha256").update(payload).digest("hex");
  const size = 25;
  const cell = 8;
  let bits = "";
  for (const ch of digest) {
    bits += Number.parseInt(ch, 16).toString(2).padStart(4, "0");
  }
  let rects = "";
  let idx = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const bit = bits[idx % bits.length];
      idx += 1;
      if (bit === "1") {
        rects += `<rect x='${x * cell}' y='${y * cell}' width='${cell}' height='${cell}' fill='#111827'/>`;
      }
    }
  }
  const dim = size * cell;
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${dim} ${dim}' width='${dim}' height='${dim}' role='img' aria-label='QR Ticket'>${rects}</svg>`;
}

function authCustomer(request: IncomingMessage): CustomerAccount | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return customers.find((item) => item.id === session.customerId) ?? null;
}

function json(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
}

function outboundPrice(packageCode: string): number {
  if (packageCode === "pro") return 250_000;
  if (packageCode === "camp") return 375_000;
  return 150_000;
}

function baseSubtotal(type: BookingType, payload: JsonObject): number {
  if (type === "ticket") {
    const adults = Math.max(0, toNumber(payload.adults));
    const children = Math.max(0, toNumber(payload.children));
    return adults * 85_000 + children * 45_000;
  }
  if (type === "outbound") {
    const participants = Math.max(1, toNumber(payload.participants));
    const packageCode = String(payload.packageCode ?? "basic");
    return participants * outboundPrice(packageCode);
  }
  const pax = Math.max(1, toNumber(payload.pax || payload.participants));
  const area = String(payload.area ?? "indoor");
  const areaFee = area === "outdoor" ? 10_000 : 0;
  return pax * (50_000 + areaFee);
}

function applyPromo(type: BookingType, subtotal: number, promoCodeRaw: unknown): { promoCode: string; discount: number } {
  const promoCode = String(promoCodeRaw ?? "").trim().toUpperCase();
  if (!promoCode) {
    return { promoCode: "", discount: 0 };
  }
  const promo = promos.find((item) => item.code === promoCode);
  if (!promo) {
    return { promoCode: "", discount: 0 };
  }
  if (!promo.appliesTo.includes(type) || subtotal < promo.minSubtotal) {
    return { promoCode: "", discount: 0 };
  }
  if (promo.type === "percentage") {
    return { promoCode: promo.code, discount: Math.round((subtotal * promo.value) / 100) };
  }
  return { promoCode: promo.code, discount: Math.min(subtotal, promo.value) };
}

function resolvePriceBreakdown(type: BookingType, payload: JsonObject, promoCodeRaw: unknown): PriceBreakdown {
  const subtotal = baseSubtotal(type, payload);
  const promo = applyPromo(type, subtotal, promoCodeRaw);
  const discountedBase = Math.max(0, subtotal - promo.discount);
  const tax = Math.round(discountedBase * 0.11);
  const service = Math.round(discountedBase * 0.05);
  const grandTotal = discountedBase + tax + service;
  return { subtotal, discount: promo.discount, tax, service, grandTotal, promoCode: promo.promoCode };
}

function availabilitySeed(type: BookingType, date: string): number {
  const hash = createHash("md5").update(`${type}:${date || "default"}`).digest("hex");
  return Number.parseInt(hash.slice(0, 8), 16);
}

function slotCapacity(type: BookingType): number {
  if (type === "outbound") return 25;
  if (type === "cafe") return 30;
  return 20;
}

function buildAvailability(type: BookingType, date: string): AvailabilitySlot[] {
  const seed = availabilitySeed(type, date);
  const slots = ["08:00", "09:00", "10:00", "11:00", "13:00", "15:00", "17:00"];
  const capacity = slotCapacity(type);
  return slots.map((time, index) => {
    const pseudo = (seed + (index + 1) * 97) % (capacity + 5);
    const baseRemaining = Math.max(0, capacity - pseudo);
    const lockKey = `${type}|${date}|${time}`;
    const used = seatLock.get(lockKey) ?? 0;
    const remaining = Math.max(0, baseRemaining - used);
    return { time, remaining, isFull: remaining <= 0 };
  });
}

function pushNotification(customerId: string, type: NotificationItem["type"], title: string, message: string): void {
  notifications.unshift({
    id: randomUUID(),
    customerId,
    type,
    title: toSafeText(title, MAX_NAME_LENGTH),
    message: toSafeText(message, MAX_TEXT_LENGTH),
    createdAt: nowIso(),
  });
  pruneInMemoryState();
}

function parseBookingType(input: unknown): BookingType {
  const raw = String(input ?? "ticket").trim().toLowerCase();
  if (raw === "outbound") return "outbound";
  if (raw === "cafe") return "cafe";
  return "ticket";
}

function deriveParticipants(type: BookingType, payload: JsonObject): number {
  if (type === "ticket") {
    return Math.max(1, toNumber(payload.adults) + toNumber(payload.children));
  }
  if (type === "outbound") {
    return Math.max(1, toNumber(payload.participants));
  }
  return Math.max(1, toNumber(payload.pax || payload.participants));
}

function releaseSeatLock(booking: BookingRecord): void {
  const lockKey = `${booking.type}|${booking.date}|${booking.time}`;
  const current = seatLock.get(lockKey) ?? 0;
  const next = Math.max(0, current - booking.participants);
  if (next === 0) {
    seatLock.delete(lockKey);
    return;
  }
  seatLock.set(lockKey, next);
}

function isPaymentActive(status: PaymentStatus): boolean {
  return status === "UNPAID" || status === "PENDING";
}

function toCountdownSeconds(status: PaymentStatus, expiresAt: string): number {
  if (!isPaymentActive(status)) return 0;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

function normalizeBookingPayload(type: BookingType, payload: JsonObject): JsonObject {
  const date = toSafeText(payload.date, 10);
  const time = toSafeText(payload.time, 5);
  if (type === "ticket") {
    return {
      date,
      time,
      adults: Math.max(0, toNumber(payload.adults)),
      children: Math.max(0, toNumber(payload.children)),
      promoCode: String(payload.promoCode ?? "").trim().toUpperCase(),
    };
  }
  if (type === "outbound") {
    return {
      date,
      time,
      packageCode: String(payload.packageCode ?? "basic").trim().toLowerCase() || "basic",
      participants: Math.max(1, toNumber(payload.participants)),
      note: toSafeText(payload.note, MAX_TEXT_LENGTH),
      promoCode: String(payload.promoCode ?? "").trim().toUpperCase(),
    };
  }
  return {
    date,
    time,
    area: String(payload.area ?? "indoor").trim().toLowerCase() || "indoor",
    pax: Math.max(1, toNumber(payload.pax || payload.participants)),
    note: toSafeText(payload.note, MAX_TEXT_LENGTH),
    promoCode: String(payload.promoCode ?? "").trim().toUpperCase(),
  };
}

function refreshPendingPaymentStatuses(customerId?: string): void {
  const now = Date.now();
  for (const payment of payments) {
    if (customerId && payment.customerId !== customerId) continue;
    if (payment.status === "PENDING" && new Date(payment.expiresAt).getTime() < now) {
      payment.status = "FAILED";
      const booking = bookings.find((item) => item.id === payment.bookingId);
      if (booking && booking.paymentStatus === "PENDING") {
        booking.paymentStatus = "FAILED";
        releaseSeatLock(booking);
        booking.updatedAt = nowIso();
        booking.qrPayload = createQrPayload(booking);
        booking.qrSvg = createQrSvg(booking.qrPayload);
        pushNotification(booking.customerId, "payment", "Pembayaran gagal", `Booking ${booking.bookingNumber} melewati batas waktu pembayaran.`);
      }
    }
  }
}

interface PaymentGateway {
  key: "sandbox" | "midtrans" | "xendit";
  checkout(booking: BookingRecord, method: string): { status: PaymentStatus; providerRef: string; expiresAt: string };
}

class SandboxPaymentGateway implements PaymentGateway {
  key: "sandbox" = "sandbox";

  checkout(booking: BookingRecord, method: string): { status: PaymentStatus; providerRef: string; expiresAt: string } {
    return {
      status: method === "card" ? "FAILED" : "PAID",
      providerRef: `SANDBOX-${booking.bookingNumber}-${method.toUpperCase()}`,
      expiresAt: nowIso(),
    };
  }
}

class MidtransPaymentGateway implements PaymentGateway {
  key: "midtrans" = "midtrans";

  checkout(booking: BookingRecord, method: string): { status: PaymentStatus; providerRef: string; expiresAt: string } {
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
    return { status: "PENDING", providerRef: `MID-${booking.bookingNumber}-${method.toUpperCase()}`, expiresAt };
  }
}

class XenditPaymentGateway implements PaymentGateway {
  key: "xendit" = "xendit";

  checkout(booking: BookingRecord, method: string): { status: PaymentStatus; providerRef: string; expiresAt: string } {
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
    return { status: "PENDING", providerRef: `XEN-${booking.bookingNumber}-${method.toUpperCase()}`, expiresAt };
  }
}

const paymentGateways: Record<"sandbox" | "midtrans" | "xendit", PaymentGateway> = {
  sandbox: new SandboxPaymentGateway(),
  midtrans: new MidtransPaymentGateway(),
  xendit: new XenditPaymentGateway(),
};

export async function handleCustomerPortalRoute(input: {
  request: IncomingMessage;
  response: ServerResponse;
  url: URL;
  readBody: (request: IncomingMessage) => Promise<string>;
  safeParseBody: (raw: string) => JsonObject | null;
}): Promise<boolean> {
  const { request, response, url, readBody, safeParseBody } = input;

  if (!url.pathname.startsWith("/customer")) {
    return false;
  }

  pruneInMemoryState();

  if (request.method === "GET" && url.pathname === "/customer/promos") {
    json(response, 200, { items: promos });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/customer/availability") {
    const type = parseBookingType(url.searchParams.get("type"));
    const date = String(url.searchParams.get("date") ?? "").trim();
    json(response, 200, { type, date, slots: buildAvailability(type, date) });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/customer/booking/quote") {
    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) {
      json(response, 400, { error: "Invalid JSON body" });
      return true;
    }
    const type = parseBookingType(parsed.type);
    const payload = normalizeBookingPayload(type, parsed);
    const price = resolvePriceBreakdown(type, payload, payload.promoCode);
    const avail = buildAvailability(type, String(payload.date ?? ""));
    const slot = avail.find((item) => item.time === String(payload.time ?? ""));
    json(response, 200, { type, payload, price, slot: slot ?? null });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/customer/register") {
    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) {
      json(response, 400, { error: "Invalid JSON body" });
      return true;
    }

    const name = toSafeText(parsed.name, MAX_NAME_LENGTH);
    const email = toLowerTrim(parsed.email);
    const phone = normalizePhone(parsed.phone);
    const password = String(parsed.password ?? "");

    if (!name || !email || !phone || password.length < 6 || !isValidEmail(email) || !isValidPhone(phone)) {
      json(response, 400, { error: "Nama, email, no HP, dan password minimal 6 karakter wajib diisi" });
      return true;
    }

    const duplicate = customers.find((item) => item.email === email || item.phone === phone);
    if (duplicate) {
      json(response, 409, { error: "Email atau nomor HP sudah terdaftar" });
      return true;
    }

    const now = nowIso();
    const customer: CustomerAccount = {
      id: randomUUID(),
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      address: "",
      birthDate: "",
      gender: "other",
      emergencyContact: "",
      avatarUrl: "",
      createdAt: now,
      updatedAt: now,
    };
    customers.push(customer);

    pushNotification(customer.id, "promo", "Selamat datang", "Akun customer berhasil dibuat. Gunakan kode HEMAT10 untuk booking pertama.");

    json(response, 201, { customer: customerPublic(customer) });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/customer/login") {
    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) {
      json(response, 400, { error: "Invalid JSON body" });
      return true;
    }

    const identifierRaw = toSafeText(parsed.identifier, MAX_NAME_LENGTH);
    const identifierEmail = toLowerTrim(identifierRaw);
    const identifierPhone = normalizePhone(identifierRaw);
    const password = String(parsed.password ?? "");

    const customer = customers.find((item) => item.email === identifierEmail || item.phone === identifierPhone);
    if (!customer || !verifyPassword(password, customer.passwordHash)) {
      json(response, 401, { error: "Kredensial tidak valid" });
      return true;
    }

    const token = issueToken(customer.id);
    json(response, 200, { token, customer: customerPublic(customer) });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/customer/profile") {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }
    json(response, 200, customerPublic(customer));
    return true;
  }

  if (request.method === "PUT" && url.pathname === "/customer/profile") {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) {
      json(response, 400, { error: "Invalid JSON body" });
      return true;
    }

    customer.name = toSafeText(parsed.name ?? customer.name, MAX_NAME_LENGTH) || customer.name;
    customer.phone = normalizePhone(parsed.phone) || customer.phone;
    customer.address = toSafeText(parsed.address ?? customer.address, MAX_TEXT_LENGTH);
    const nextBirthDate = toSafeText(parsed.birthDate ?? customer.birthDate, 10);
    customer.birthDate = nextBirthDate && isValidDate(nextBirthDate) ? nextBirthDate : customer.birthDate;
    const genderRaw = String(parsed.gender ?? customer.gender).trim().toLowerCase();
    customer.gender = genderRaw === "male" || genderRaw === "female" || genderRaw === "other" ? (genderRaw as CustomerGender) : customer.gender;
    customer.emergencyContact = toSafeText(parsed.emergencyContact ?? customer.emergencyContact, MAX_TEXT_LENGTH);
    customer.avatarUrl = toSafeText(parsed.avatarUrl ?? customer.avatarUrl, MAX_TEXT_LENGTH);

    const password = String(parsed.password ?? "").trim();
    if (password.length >= 6) {
      customer.passwordHash = hashPassword(password);
    }

    customer.updatedAt = nowIso();
    json(response, 200, customerPublic(customer));
    return true;
  }

  if (request.method === "POST" && (url.pathname === "/customer/booking/ticket" || url.pathname === "/customer/booking/outbound" || url.pathname === "/customer/booking/cafe")) {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) {
      json(response, 400, { error: "Invalid JSON body" });
      return true;
    }

    const type: BookingType = url.pathname.endsWith("/ticket") ? "ticket" : url.pathname.endsWith("/outbound") ? "outbound" : "cafe";
    const payload = normalizeBookingPayload(type, parsed);
    const date = String(payload.date ?? "").trim();
    const time = String(payload.time ?? "").trim();
    if (!date || !time || !isValidDate(date) || !isValidTime(time)) {
      json(response, 400, { error: "Tanggal dan jam wajib diisi" });
      return true;
    }

    const participants = deriveParticipants(type, payload);
    const availability = buildAvailability(type, date).find((slot) => slot.time === time);
    if (!availability || availability.remaining < participants) {
      json(response, 409, { error: "Kuota pada jam yang dipilih sudah penuh atau tidak mencukupi" });
      return true;
    }

    const lockKey = `${type}|${date}|${time}`;
    seatLock.set(lockKey, (seatLock.get(lockKey) ?? 0) + participants);

    const bookingNumber = createBookingNumber(type);
    const invoiceNumber = createInvoiceNumber();
    const price = resolvePriceBreakdown(type, payload, payload.promoCode);
    const now = nowIso();
    const paymentExpiresAt = new Date(Date.now() + 15 * 60_000).toISOString();

    const booking: BookingRecord = {
      id: randomUUID(),
      bookingNumber,
      customerId: customer.id,
      customerName: customer.name,
      type,
      date,
      time,
      participants,
      payload,
      price,
      paymentStatus: "UNPAID",
      qrPayload: "",
      qrSvg: "",
      invoiceNumber,
      paymentExpiresAt,
      createdAt: now,
      updatedAt: now,
    };

    booking.qrPayload = createQrPayload(booking);
    booking.qrSvg = createQrSvg(booking.qrPayload);

    bookings.unshift(booking);
    pushNotification(customer.id, "booking", "Booking berhasil", `Booking ${booking.bookingNumber} berhasil dibuat untuk ${booking.date} ${booking.time}.`);
    if (booking.price.promoCode) {
      pushNotification(customer.id, "voucher", "Voucher digunakan", `Kode ${booking.price.promoCode} berhasil diterapkan.`);
    }

    json(response, 201, { booking });
    return true;
  }

  const cancelMatch = url.pathname.match(/^\/customer\/booking\/([^/]+)\/cancel$/);
  if (request.method === "POST" && cancelMatch) {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    const bookingId = cancelMatch[1];
    const booking = bookings.find((item) => item.id === bookingId && item.customerId === customer.id);
    if (!booking) {
      json(response, 404, { error: "Booking tidak ditemukan" });
      return true;
    }
    if (booking.paymentStatus === "PAID") {
      json(response, 409, { error: "Booking sudah PAID dan tidak dapat dibatalkan" });
      return true;
    }
    if (booking.paymentStatus === "CANCELLED") {
      json(response, 200, { booking });
      return true;
    }

    releaseSeatLock(booking);
    booking.paymentStatus = "CANCELLED";
    booking.updatedAt = nowIso();
    booking.qrPayload = createQrPayload(booking);
    booking.qrSvg = createQrSvg(booking.qrPayload);

    pushNotification(customer.id, "booking", "Booking dibatalkan", `Booking ${booking.bookingNumber} telah dibatalkan.`);
    json(response, 200, { booking });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/customer/payment/checkout") {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) {
      json(response, 400, { error: "Invalid JSON body" });
      return true;
    }

    const bookingId = String(parsed.bookingId ?? "").trim();
    const method = normalizePaymentMethod(parsed.method);
    const gatewayKey = (String(parsed.gateway ?? "sandbox").trim().toLowerCase() || "sandbox") as "sandbox" | "midtrans" | "xendit";

    const booking = bookings.find((item) => item.id === bookingId && item.customerId === customer.id);
    if (!booking) {
      json(response, 404, { error: "Booking tidak ditemukan" });
      return true;
    }
    if (booking.paymentStatus !== "UNPAID" && booking.paymentStatus !== "PENDING") {
      json(response, 409, { error: `Booking berstatus ${booking.paymentStatus} dan tidak dapat diproses ulang` });
      return true;
    }

    refreshPendingPaymentStatuses(customer.id);

    const gateway = paymentGateways[gatewayKey] ?? paymentGateways.sandbox;
    const checkoutResult = gateway.checkout(booking, method);

    const payment: PaymentRecord = {
      id: randomUUID(),
      bookingId: booking.id,
      customerId: customer.id,
      gateway: gateway.key,
      method,
      status: checkoutResult.status,
      invoiceNumber: booking.invoiceNumber,
      providerRef: checkoutResult.providerRef,
      expiresAt: checkoutResult.expiresAt,
      createdAt: nowIso(),
    };

    payments.unshift(payment);
    booking.paymentStatus = payment.status;
    booking.paymentExpiresAt = payment.expiresAt;
    booking.updatedAt = nowIso();
    booking.qrPayload = createQrPayload(booking);
    booking.qrSvg = createQrSvg(booking.qrPayload);

    if (payment.status === "PAID") {
      pushNotification(customer.id, "payment", "Pembayaran diterima", `Pembayaran booking ${booking.bookingNumber} telah diterima.`);
    } else if (payment.status === "PENDING") {
      pushNotification(customer.id, "payment", "Pembayaran menunggu", `Pembayaran booking ${booking.bookingNumber} berstatus PENDING.`);
    } else if (payment.status === "FAILED") {
      releaseSeatLock(booking);
      pushNotification(customer.id, "payment", "Pembayaran gagal", `Pembayaran booking ${booking.bookingNumber} gagal diproses.`);
    }

    json(response, 200, {
      payment,
      booking,
      countdownSeconds: toCountdownSeconds(payment.status, payment.expiresAt),
    });
    return true;
  }

  const paymentStatusMatch = url.pathname.match(/^\/customer\/payment\/status\/([^/]+)$/);
  if (request.method === "GET" && paymentStatusMatch) {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    const bookingId = paymentStatusMatch[1];
    refreshPendingPaymentStatuses(customer.id);
    const booking = bookings.find((item) => item.id === bookingId && item.customerId === customer.id);
    if (!booking) {
      json(response, 404, { error: "Booking tidak ditemukan" });
      return true;
    }

    const payment = payments.find((item) => item.bookingId === booking.id && item.customerId === customer.id);
    json(response, 200, {
      status: booking.paymentStatus,
      expiresAt: booking.paymentExpiresAt,
      countdownSeconds: toCountdownSeconds(booking.paymentStatus, booking.paymentExpiresAt),
      payment: payment ?? null,
      booking,
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/customer/dashboard") {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    refreshPendingPaymentStatuses(customer.id);
    const mine = bookings.filter((item) => item.customerId === customer.id);
    const activeBookings = mine.filter((item) => isPaymentActive(item.paymentStatus)).length;
    const latestPayment = payments.find((item) => item.customerId === customer.id);
    const unreadNotifications = notifications.filter((item) => item.customerId === customer.id).length;

    json(response, 200, {
      activeBookings,
      totalBookings: mine.length,
      paymentStatus: latestPayment ? latestPayment.status : "UNPAID",
      vouchers: mine.some((item) => item.price.discount > 0) ? 1 : 0,
      bookings: mine,
      unreadNotifications,
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/customer/history") {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    refreshPendingPaymentStatuses(customer.id);

    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const type = toLowerTrim(url.searchParams.get("type"));
    const status = toLowerTrim(url.searchParams.get("status"));
    const fromTime = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? new Date(to).getTime() + 86_399_000 : Number.POSITIVE_INFINITY;

    const items = bookings
      .filter((item) => item.customerId === customer.id)
      .filter((item) => {
        const t = new Date(item.createdAt).getTime();
        return t >= fromTime && t <= toTime;
      })
      .filter((item) => (type && type !== "all" ? item.type === type : true))
      .filter((item) => (status && status !== "all" ? item.paymentStatus.toLowerCase() === status : true))
      .map((item) => ({
        id: item.id,
        type: item.type,
        invoiceNumber: item.invoiceNumber,
        bookingNumber: item.bookingNumber,
        paymentStatus: item.paymentStatus,
        date: item.date,
        time: item.time,
        participants: item.participants,
        grandTotal: item.price.grandTotal,
        createdAt: item.createdAt,
      }));

    json(response, 200, { items });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/customer/notifications") {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    const items = notifications.filter((item) => item.customerId === customer.id).slice(0, 25);
    json(response, 200, { items });
    return true;
  }

  const ticketMatch = url.pathname.match(/^\/customer\/ticket\/([^/]+)$/);
  if (request.method === "GET" && ticketMatch) {
    const customer = authCustomer(request);
    if (!customer) {
      json(response, 401, { error: "Unauthorized" });
      return true;
    }

    refreshPendingPaymentStatuses(customer.id);

    const id = ticketMatch[1];
    const ticket = bookings.find((item) => item.id === id && item.customerId === customer.id);
    if (!ticket) {
      json(response, 404, { error: "Ticket tidak ditemukan" });
      return true;
    }

    json(response, 200, ticket);
    return true;
  }

  json(response, 404, { error: "Customer endpoint not found" });
  return true;
}
