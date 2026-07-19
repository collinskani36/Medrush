export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  requires_prescription: boolean;
  in_stock: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "received"
  | "preparing"
  | "out_for_delivery"
  | "delivered";

export interface Rider {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  prescription_url?: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: "mpesa" | "cod";
  status: OrderStatus;
  special_instructions?: string | null;
  rider_id?: string | null;
  rider?: Rider | null;
  rating?: number | null;
  created_at: string;
}

export type PrescriptionStatus = "pending" | "reviewed" | "fulfilled";

export interface Prescription {
  id: string;
  customer_phone: string;
  delivery_address: string;
  prescription_url: string;
  status: PrescriptionStatus;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio?: string | null;
  photo_url?: string | null;
  consultation_fee: number;
  is_available: boolean;
  created_at: string;
}

export type ConsultationStatus =
  | "awaiting_payment"
  | "paid"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Consultation {
  id: string;
  customer_name: string;
  customer_phone: string;
  doctor_id: string | null;
  doctor?: Doctor | null; // populated when joined, e.g. fetchConsultation()
  reason: string;
  fee: number;
  payment_method: "mpesa" | "cod";
  payment_status: PaymentStatus;
  status: ConsultationStatus;
  scheduled_time?: string | null;
  notes_from_doctor?: string | null;
  created_at: string;
}

export type EquipmentRequestStatus = "pending" | "quoted" | "accepted" | "rejected" | "fulfilled";

export interface EquipmentRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  item_description: string;
  quantity: number;
  notes?: string | null;
  status: EquipmentRequestStatus;
  quoted_price?: number | null;
  quote_notes?: string | null;
  quoted_at?: string | null;
  created_at: string;
}