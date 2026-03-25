import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllOrders } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import OrderStatusButton from "./OrderStatusButton";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const orders = getAllOrders();

  const statusVariant = (status: string) => {
    switch (status) {
      case "pending": return "gold" as const;
      case "shipped": return "teal" as const;
      case "delivered": return "secondary" as const;
      case "cancelled": return "default" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="p-8">
      <h1 className="font-rockabilly text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-charcoal/60">{orders.length} total orders</p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-xl border-2 border-warm-gray bg-white p-12 text-center shadow-sm">
          <p className="font-rockabilly text-2xl text-charcoal/40">No orders yet</p>
          <p className="mt-2 text-sm text-charcoal/40">Orders will appear here when customers check out.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border-2 border-warm-gray bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-warm-gray bg-cream text-left">
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Order</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Customer</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Items</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Total</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Status</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Date</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-gray-light">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-cream/50">
                  <td className="px-4 py-3 font-bold">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{order.customer_name}</p>
                    <p className="text-xs text-charcoal/50">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-bold text-cherry">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(order.status)}>{order.status}</Badge></td>
                  <td className="px-4 py-3 text-charcoal/50">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><OrderStatusButton orderId={order.id} currentStatus={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
