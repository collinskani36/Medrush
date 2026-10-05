import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import MyOrders from "@/pages/MyOrders";
import Prescription from "@/pages/Prescription";
import Admin from "@/pages/admin/Admin";
import Consultation from "@/pages/Consultation";
import ConsultationBooking from "@/pages/ConsultationBooking";
import ConsultationStatus from "@/pages/ConsultationStatus";
import EquipmentRequest from "@/pages/EquipmentRequest";
import EquipmentStatus from "@/pages/EquipmentStatus";
import Services from "@/pages/Services";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/consult" element={<Consultation />} />
          <Route path="/consult/status/:id" element={<ConsultationStatus />} />
          <Route path="/consult/:doctorId" element={<ConsultationBooking />} />
          <Route path="/equipment/request" element={<EquipmentRequest />} />
          <Route path="/equipment/status/:id" element={<EquipmentStatus />} />
          <Route path="/services" element={<Services />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}