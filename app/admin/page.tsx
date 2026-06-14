import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStats, getLowStockProducts, getAllOrders } from "@/lib/db";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { productCount, orderCount, revenue, lowStock } = await getStats();
  const recentOrders = (await getAllOrders()).slice(0, 5);
  const lowStockProducts = await getLowStockProducts();

  const stats = [
    { label: "Products", value: productCount, icon: Package, color: "text-teal" },
    { label: "Orders", value: orderCount, icon: ShoppingCart, color: "text-cherry" },
    { label: "Revenue", value: formatPrice(revenue), icon: DollarSign, color: "text-gold" },
    { label: "Low Stock", value: lowStock, icon: TrendingUp, color: "text-cherry-light" },
  ];

  return (
    <div className="p-8">
      <h1 className="font-brand text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-charcoal/60">Welcome back, {session.username}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border-2 border-warm-gray bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal/50">{label}</p>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="mt-2 font-brand text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border-2 border-warm-gray bg-white p-5 shadow-sm">
          <h2 className="font-bold uppercase tracking-wider">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal/50">No orders yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg bg-cream p-3 text-sm">
                  <div>
                    <p className="font-bold">#{order.id} &mdash; {order.customer_name}</p>
                    <p className="text-xs text-charcoal/50">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cherry">{formatPrice(order.total)}</p>
                    <p className="text-xs capitalize text-charcoal/50">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border-2 border-warm-gray bg-white p-5 shadow-sm">
          <h2 className="font-bold uppercase tracking-wider">Low Stock Alert</h2>
          {lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal/50">All stock levels are healthy.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-cream p-3 text-sm">
                  <p className="font-bold">{p.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    p.stock === 0 ? "bg-cherry text-white" : "bg-gold text-charcoal"
                  }`}>
                    {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
