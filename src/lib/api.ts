import { supabase, supabaseEnabled } from "./supabase";
import { MOCK_PRODUCTS } from "./mockData";
import type {
  Order, OrderStatus, Prescription, Product, Rider,
  Doctor, Consultation, ConsultationStatus,
  EquipmentRequest, EquipmentRequestStatus,
} from "@/types";

const mockOrders: Order[] = [];
const mockPrescriptions: Prescription[] = [];
const mockRiders: Rider[] = [];
type Listener<T> = (rows: T[]) => void;
const orderListeners = new Set<Listener<Order>>();

function emitOrders() {
  orderListeners.forEach((l) => l([...mockOrders]));
}

export async function fetchProducts(): Promise<Product[]> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Product[];
  }
  return MOCK_PRODUCTS;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Product) ?? null;
  }
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function createOrder(
  input: Omit<Order, "id" | "created_at" | "status"> & { status?: OrderStatus },
): Promise<Order> {
  const status: OrderStatus = input.status ?? "received";
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("orders").insert({ ...input, status }).select().single();
    if (error) throw error;
    return data as Order;
  }
  const order: Order = { ...input, status, id: `ord_${Date.now().toString(36)}`, created_at: new Date().toISOString() };
  mockOrders.unshift(order);
  emitOrders();
  return order;
}

export async function fetchOrder(id: string): Promise<Order | null> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("orders").select("*, rider:riders(*)").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Order) ?? null;
  }
  return mockOrders.find((o) => o.id === id) ?? null;
}

export async function fetchOrders(): Promise<Order[]> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("orders").select("*, rider:riders(*)").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Order[];
  }
  return [...mockOrders];
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === id);
  if (o) { o.status = status; emitOrders(); }
}

export async function assignRider(orderId: string, riderId: string | null): Promise<void> {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ rider_id: riderId }).eq("id", orderId);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === orderId);
  if (o) {
    o.rider_id = riderId;
    o.rider = riderId ? mockRiders.find((r) => r.id === riderId) ?? null : null;
    emitOrders();
  }
}

/** Called by customer on OrderTracking page when they physically receive their order. */
export async function confirmDelivery(orderId: string): Promise<void> {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === orderId);
  if (o) { o.status = "delivered"; emitOrders(); }
}

/** Called by customer after delivery — saves 1–5 star rating on the order. */
export async function submitRating(orderId: string, rating: number): Promise<void> {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ rating }).eq("id", orderId);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === orderId);
  if (o) { o.rating = rating; emitOrders(); }
}

export function subscribeOrders(cb: (orders: Order[]) => void) {
  if (supabaseEnabled && supabase) {
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async () => {
        const orders = await fetchOrders();
        cb(orders);
      })
      .subscribe();
    const client = supabase;
    fetchOrders().then(cb).catch(() => {});
    return () => { client.removeChannel(channel); };
  }
  orderListeners.add(cb);
  cb([...mockOrders]);
  return () => { orderListeners.delete(cb); };
}

export function subscribeOrder(id: string, cb: (order: Order | null) => void) {
  return subscribeOrders((orders) => { cb(orders.find((o) => o.id === id) ?? null); });
}

// ─── Storage ────────────────────────────────────────────────────────────────

export async function uploadPrescriptionFile(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("prescriptions").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("prescriptions").getPublicUrl(path);
  return data.publicUrl;
}

/** Admin: upload a doctor's headshot to the public "doctor-photos" bucket, returns the public URL to save on the doctor record. */
export async function uploadDoctorPhoto(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("doctor-photos").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("doctor-photos").getPublicUrl(path);
  return data.publicUrl;
}

// ─── Prescriptions ──────────────────────────────────────────────────────────

export async function createPrescription(input: { customer_phone: string; delivery_address: string; prescription_url: string }): Promise<Prescription> {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("prescriptions").insert({ ...input, status: "pending" });
    if (error) throw error;
    return { ...input, status: "pending", id: crypto.randomUUID(), created_at: new Date().toISOString() } as Prescription;
  }
  const p: Prescription = { ...input, id: `rx_${Date.now().toString(36)}`, status: "pending", created_at: new Date().toISOString() };
  mockPrescriptions.unshift(p);
  return p;
}

export async function fetchPrescriptions(): Promise<Prescription[]> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("prescriptions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Prescription[];
  }
  return [...mockPrescriptions];
}

export async function updatePrescriptionStatus(id: string, status: Prescription["status"]) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("prescriptions").update({ status }).eq("id", id);
    if (error) throw error;
    return;
  }
  const p = mockPrescriptions.find((x) => x.id === id);
  if (p) p.status = status;
}

// ─── Products (admin) ────────────────────────────────────────────────────────

export async function toggleProductStock(id: string, in_stock: boolean) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("products").update({ in_stock }).eq("id", id);
    if (error) throw error;
    return;
  }
  const p = MOCK_PRODUCTS.find((x) => x.id === id);
  if (p) p.in_stock = in_stock;
}

export async function addProduct(input: Omit<Product, "id" | "created_at">) {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("products").insert(input).select().single();
    if (error) throw error;
    return data as Product;
  }
  const p: Product = { ...input, id: `prod_${Date.now().toString(36)}`, created_at: new Date().toISOString() };
  MOCK_PRODUCTS.unshift(p);
  return p;
}

export async function deleteProduct(id: string): Promise<void> {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const idx = MOCK_PRODUCTS.findIndex((x) => x.id === id);
  if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
}

// ─── Riders (admin) ──────────────────────────────────────────────────────────

export async function fetchRiders(): Promise<Rider[]> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("riders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Rider[];
  }
  return [...mockRiders];
}

export async function addRider(input: { name: string; phone: string }): Promise<Rider> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("riders").insert(input).select().single();
    if (error) throw error;
    return data as Rider;
  }
  const r: Rider = { ...input, id: `rider_${Date.now().toString(36)}`, created_at: new Date().toISOString() };
  mockRiders.unshift(r);
  return r;
}

export async function deleteRider(id: string): Promise<void> {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("riders").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const idx = mockRiders.findIndex((x) => x.id === id);
  if (idx !== -1) mockRiders.splice(idx, 1);
}

// ─── Doctors ──────────────────────────────────────────────────────────────
// Supabase-only for now — no mock fallback, since consultations only make
// sense against a real backend. Requires Supabase to be configured.

function requireSupabase() {
  if (!supabaseEnabled || !supabase) throw new Error("Supabase not configured");
  return supabase;
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const db = requireSupabase();
  const { data, error } = await db.from("doctors").select("*").eq("is_available", true).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Doctor[];
}

/** Admin: fetch all doctors regardless of availability. */
export async function fetchAllDoctors(): Promise<Doctor[]> {
  const db = requireSupabase();
  const { data, error } = await db.from("doctors").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Doctor[];
}

export async function fetchDoctor(id: string): Promise<Doctor | null> {
  const db = requireSupabase();
  const { data, error } = await db.from("doctors").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Doctor) ?? null;
}

export async function addDoctor(input: Omit<Doctor, "id" | "created_at">): Promise<Doctor> {
  const db = requireSupabase();
  const { data, error } = await db.from("doctors").insert(input).select().single();
  if (error) throw error;
  return data as Doctor;
}

export async function toggleDoctorAvailability(id: string, is_available: boolean): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("doctors").update({ is_available }).eq("id", id);
  if (error) throw error;
}

export async function deleteDoctor(id: string): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("doctors").delete().eq("id", id);
  if (error) throw error;
}

// ─── Consultations ──────────────────────────────────────────────────────────

/**
 * Creates a consultation booking. Called after the customer confirms the
 * M-Pesa STK push, same pattern as createOrder() — so it's created already paid.
 */
export async function createConsultation(
  input: Omit<Consultation, "id" | "created_at" | "status" | "payment_status" | "doctor">,
): Promise<Consultation> {
  const db = requireSupabase();
  const record = { ...input, status: "paid" as ConsultationStatus, payment_status: "paid" as const };
  const { data, error } = await db.from("consultations").insert(record).select().single();
  if (error) throw error;
  return data as Consultation;
}

export async function fetchConsultation(id: string): Promise<Consultation | null> {
  const db = requireSupabase();
  const { data, error } = await db.from("consultations").select("*, doctor:doctors(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Consultation) ?? null;
}

/** Admin: list all consultations, most recent first. */
export async function fetchConsultations(): Promise<Consultation[]> {
  const db = requireSupabase();
  const { data, error } = await db.from("consultations").select("*, doctor:doctors(*)").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Consultation[];
}

export async function updateConsultationStatus(id: string, status: ConsultationStatus): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("consultations").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Admin: attach the doctor's summary/advice once a consultation wraps up. */
export async function addConsultationNotes(id: string, notes_from_doctor: string): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("consultations").update({ notes_from_doctor }).eq("id", id);
  if (error) throw error;
}

// ─── Equipment requests ─────────────────────────────────────────────────────

export async function createEquipmentRequest(
  input: Omit<EquipmentRequest, "id" | "created_at" | "status" | "quoted_price" | "quote_notes" | "quoted_at">,
): Promise<EquipmentRequest> {
  const db = requireSupabase();
  const record = { ...input, status: "pending" as EquipmentRequestStatus, quoted_price: null, quote_notes: null, quoted_at: null };
  const { data, error } = await db.from("equipment_requests").insert(record).select().single();
  if (error) throw error;
  return data as EquipmentRequest;
}

export async function fetchEquipmentRequest(id: string): Promise<EquipmentRequest | null> {
  const db = requireSupabase();
  const { data, error } = await db.from("equipment_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as EquipmentRequest) ?? null;
}

/** Admin: list all equipment requests, most recent first. */
export async function fetchEquipmentRequests(): Promise<EquipmentRequest[]> {
  const db = requireSupabase();
  const { data, error } = await db.from("equipment_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EquipmentRequest[];
}

/** Admin: price a request and move it to "quoted". */
export async function quoteEquipmentRequest(id: string, quoted_price: number, quote_notes: string | null): Promise<void> {
  const db = requireSupabase();
  const patch = { status: "quoted" as EquipmentRequestStatus, quoted_price, quote_notes, quoted_at: new Date().toISOString() };
  const { error } = await db.from("equipment_requests").update(patch).eq("id", id);
  if (error) throw error;
}

/** Customer: accept a quote (called after M-Pesa STK confirmation) or reject it. */
export async function updateEquipmentRequestStatus(id: string, status: EquipmentRequestStatus): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("equipment_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Admin: mark an accepted request as delivered/fulfilled. */
export async function fulfillEquipmentRequest(id: string): Promise<void> {
  return updateEquipmentRequestStatus(id, "fulfilled");
}