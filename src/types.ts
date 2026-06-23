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