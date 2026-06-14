import { supabase } from "./supabase";
import type { Product, Order, OrderItem } from "./types";

// --- Products ---

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("featured", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductsByFilter(category?: string, search?: string): Promise<Product[]> {
  let query = supabase.from("products").select("*");

  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  if (search) {
    const q = search.toLowerCase();
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,era.ilike.%${q}%,category.ilike.%${q}%`
    );
  }

  const { data, error } = await query
    .order("featured", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data ?? undefined;
}

export async function getProductsByCategory(category: string, excludeId?: number): Promise<Product[]> {
  let query = supabase.from("products").select("*").eq("category", category);
  if (excludeId !== undefined) {
    query = query.neq("id", excludeId);
  }
  const { data, error } = await query.limit(3);
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", 1)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(data: Omit<Product, "id" | "created_at">): Promise<number> {
  const { data: row, error } = await supabase
    .from("products")
    .insert(data)
    .select("id")
    .single();
  if (error) throw error;
  return row.id;
}

export async function updateProduct(id: number, data: Omit<Product, "id" | "created_at">): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}

// --- Orders ---

export async function getAllOrders(): Promise<(Order & { items: OrderItem[] })[]> {
  const { data: orders, error: oErr } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });
  if (oErr) throw oErr;
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items, error: iErr } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);
  if (iErr) throw iErr;

  return orders.map((o) => ({
    ...o,
    items: (items ?? []).filter((i) => i.order_id === o.id),
  }));
}

export async function createOrder(data: {
  customer_name: string;
  customer_email: string;
  customer_address: string;
  items: { product_id: number; product_name: string; quantity: number; price: number }[];
}): Promise<number> {
  const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_address: data.customer_address,
      status: "pending",
      total,
    })
    .select("id")
    .single();
  if (oErr) throw oErr;

  const itemRows = data.items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    price: i.price,
  }));
  const { error: iErr } = await supabase.from("order_items").insert(itemRows);
  if (iErr) throw iErr;

  return order.id;
}

export async function updateOrderStatus(id: number, status: string): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}

// --- Stats ---

export async function getStats() {
  const [
    { count: productCount },
    { count: orderCount },
    { data: orderTotals },
    { count: lowStock },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 1)
      .gt("stock", 0),
  ]);

  const revenue = (orderTotals ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);

  return {
    productCount: productCount ?? 0,
    orderCount: orderCount ?? 0,
    revenue,
    lowStock: lowStock ?? 0,
  };
}

export async function getLowStockProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .lte("stock", 2)
    .order("stock", { ascending: true })
    .limit(5);
  if (error) throw error;
  return data ?? [];
}

// --- Auth ---

export async function findAdminByUsername(
  username: string
): Promise<{ id: number; username: string; password_hash: string } | undefined> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash")
    .eq("username", username)
    .single();
  if (error) return undefined;
  return data ?? undefined;
}

export async function createSession(sessionId: string, userId: number, expiresAt: string): Promise<void> {
  // Remove existing sessions for this user before creating a new one
  await supabase.from("sessions").delete().eq("user_id", userId);
  const { error } = await supabase
    .from("sessions")
    .insert({ id: sessionId, user_id: userId, expires_at: expiresAt });
  if (error) throw error;
}

export async function getSessionById(
  sessionId: string
): Promise<{ user_id: number; username: string } | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("user_id, expires_at, admin_users(username)")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .single();
  if (error || !data) return null;
  const related = data.admin_users as { username: string }[] | null;
  const username = related?.[0]?.username;
  if (!username) return null;
  return { user_id: data.user_id, username };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await supabase.from("sessions").delete().eq("id", sessionId);
}
