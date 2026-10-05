import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecentOrders } from "@/components/RecentOrders";

export default function MyOrders() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">My orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders placed on this device. Tap one to track it.
        </p>
        <RecentOrders limit={5} showEmptyState className="mt-6" />
      </section>
      <Footer />
    </div>
  );
}
