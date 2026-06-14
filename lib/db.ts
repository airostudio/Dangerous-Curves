import { supabase } from "./supabase";
import type { Product, ProductImage, Order, OrderItem, DiscountCode } from "./types";

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
  let query = supabase.from("products").select("*").eq("status", "published");
  if (category && category !== "All") query = query.eq("category", category);
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
    .from("products").select("*").eq("id", id).single();
  if (error) return undefined;
  return data ?? undefined;
}

export async function getProductsByCategory(category: string, excludeId?: number): Promise<Product[]> {
  let query = supabase.from("products").select("*")
    .eq("category", category).eq("status", "published");
  if (excludeId !== undefined) query = query.neq("id", excludeId);
  const { data, error } = await query.limit(3);
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products").select("*").eq("featured", 1).eq("status", "published").limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(data: Omit<Product, "id" | "created_at">): Promise<number> {
  const { data: row, error } = await supabase
    .from("products").insert(data).select("id").single();
  if (error) throw error;
  return row.id;
}

export async function updateProduct(id: number, data: Omit<Product, "id" | "created_at">): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("products").update(data).eq("id", id).select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("products").delete().eq("id", id).select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}

// --- Product images ---

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images").select("*")
    .eq("product_id", productId).order("position");
  if (error) throw error;
  return data ?? [];
}

export async function addProductImage(data: {
  product_id: number;
  path: string;
  url: string;
  position: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
}): Promise<ProductImage> {
  if (data.is_primary) {
    await supabase.from("product_images")
      .update({ is_primary: false }).eq("product_id", data.product_id);
  }
  const { data: row, error } = await supabase
    .from("product_images").insert(data).select().single();
  if (error) throw error;
  // Keep image_url mirror on product row in sync with primary
  if (data.is_primary) {
    await supabase.from("products").update({ image_url: data.url }).eq("id", data.product_id);
  }
  return row;
}

export async function deleteProductImage(id: number): Promise<{ path: string; product_id: number; is_primary: boolean } | null> {
  const { data: img } = await supabase.from("product_images").select("path, product_id, is_primary").eq("id", id).single();
  if (!img) return null;
  await supabase.from("product_images").delete().eq("id", id);
  // If deleted was primary, promote the next one
  if (img.is_primary) {
    const { data: next } = await supabase.from("product_images")
      .select("id, url").eq("product_id", img.product_id).order("position").limit(1).single();
    if (next) {
      await supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
      await supabase.from("products").update({ image_url: next.url }).eq("id", img.product_id);
    } else {
      await supabase.from("products").update({ image_url: "" }).eq("id", img.product_id);
    }
  }
  return img;
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  const { data: img } = await supabase.from("product_images")
    .update({ is_primary: true }).eq("id", imageId).select("url").single();
  if (img) await supabase.from("products").update({ image_url: img.url }).eq("id", productId);
}

export async function reorderProductImages(productId: number, orderedIds: number[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from("product_images").update({ position }).eq("id", id).eq("product_id", productId)
    )
  );
}

// --- Orders ---

export async function getAllOrders(): Promise<(Order & { items: OrderItem[] })[]> {
  const { data: orders, error: oErr } = await supabase
    .from("orders").select("*").order("id", { ascending: false });
  if (oErr) throw oErr;
  if (!orders || orders.length === 0) return [];
  const orderIds = orders.map((o) => o.id);
  const { data: items, error: iErr } = await supabase
    .from("order_items").select("*").in("order_id", orderIds);
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
  stripe_session_id?: string;
  items: { product_id: number; product_name: string; quantity: number; price: number }[];
}): Promise<number> {
  const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { data: order, error: oErr } = await supabase.from("orders").insert({
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_address: data.customer_address,
    status: "pending",
    total,
    stripe_session_id: data.stripe_session_id ?? null,
  }).select("id").single();
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

export async function getOrderByStripeSession(sessionId: string): Promise<number | null> {
  const { data } = await supabase.from("orders").select("id")
    .eq("stripe_session_id", sessionId).single();
  return data?.id ?? null;
}

export async function updateOrderStatus(id: number, status: string): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("orders").update({ status }).eq("id", id).select("id");
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
    supabase.from("products").select("*", { count: "exact", head: true }).lte("stock", 1).gt("stock", 0),
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
    .from("products").select("*").lte("stock", 2).order("stock").limit(5);
  if (error) throw error;
  return data ?? [];
}

// --- Auth ---

export async function findAdminByUsername(
  username: string
): Promise<{ id: number; username: string; password_hash: string } | undefined> {
  const { data, error } = await supabase
    .from("admin_users").select("id, username, password_hash")
    .eq("username", username).single();
  if (error) return undefined;
  return data ?? undefined;
}

export async function updateAdminPassword(id: number, passwordHash: string): Promise<void> {
  await supabase.from("admin_users").update({ password_hash: passwordHash }).eq("id", id);
}

export async function createSession(sessionId: string, userId: number, expiresAt: string): Promise<void> {
  await supabase.from("sessions").delete().eq("user_id", userId);
  const { error } = await supabase
    .from("sessions").insert({ id: sessionId, user_id: userId, expires_at: expiresAt });
  if (error) throw error;
}

export async function getSessionById(
  sessionId: string
): Promise<{ user_id: number; username: string } | null> {
  const { data: session, error } = await supabase
    .from("sessions").select("user_id, expires_at")
    .eq("id", sessionId).gt("expires_at", new Date().toISOString()).single();
  if (error || !session) return null;
  const { data: user, error: uErr } = await supabase
    .from("admin_users").select("username").eq("id", session.user_id).single();
  if (uErr || !user) return null;
  return { user_id: session.user_id, username: user.username };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await supabase.from("sessions").delete().eq("id", sessionId);
}

// --- Rate limiting ---

export async function checkRateLimit(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("login_attempts").select("*", { count: "exact", head: true })
    .eq("ip", ip).gte("attempted_at", since);
  return (count ?? 0) < 5;
}

export async function recordLoginAttempt(ip: string): Promise<void> {
  await supabase.from("login_attempts").insert({ ip });
  // Prune old rows to keep the table lean
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("login_attempts").delete().lt("attempted_at", cutoff);
}

export async function clearLoginAttempts(ip: string): Promise<void> {
  await supabase.from("login_attempts").delete().eq("ip", ip);
}

// --- Site settings ---

export async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("site_settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from("site_settings").select("key, value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

export async function setSetting(key: string, value: string): Promise<void> {
  await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
}

export async function setSettings(pairs: Record<string, string>): Promise<void> {
  const rows = Object.entries(pairs).map(([key, value]) => ({ key, value }));
  await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
}

// --- Discount codes ---

export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
  const { data, error } = await supabase
    .from("discount_codes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createDiscountCode(
  data: Omit<DiscountCode, "id" | "used_count" | "created_at">
): Promise<number> {
  const { data: row, error } = await supabase
    .from("discount_codes").insert({ ...data, code: data.code.toUpperCase() }).select("id").single();
  if (error) throw error;
  return row.id;
}

export async function updateDiscountCode(
  id: number,
  data: Partial<Omit<DiscountCode, "id" | "created_at">>
): Promise<boolean> {
  const update = data.code ? { ...data, code: data.code.toUpperCase() } : data;
  const { data: rows, error } = await supabase
    .from("discount_codes").update(update).eq("id", id).select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}

export async function deleteDiscountCode(id: number): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("discount_codes").delete().eq("id", id).select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}

export async function validateDiscountCode(
  code: string,
  orderTotal: number
): Promise<{ discount: DiscountCode; discount_amount: number } | null> {
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();
  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.max_uses !== null && data.used_count >= data.max_uses) return null;
  if (orderTotal < data.min_order) return null;

  const discount_amount =
    data.type === "percentage"
      ? Math.floor((orderTotal * data.value) / 100)
      : Math.min(data.value, orderTotal);

  return { discount: data, discount_amount };
}

export async function incrementDiscountCodeUsage(id: number): Promise<void> {
  const { data } = await supabase
    .from("discount_codes").select("used_count").eq("id", id).single();
  if (data) {
    await supabase
      .from("discount_codes").update({ used_count: data.used_count + 1 }).eq("id", id);
  }
}

// --- Admin users ---

export async function getAllAdminUsers(): Promise<{ id: number; username: string }[]> {
  const { data, error } = await supabase
    .from("admin_users").select("id, username").order("id");
  if (error) throw error;
  return data ?? [];
}

export async function createAdminUser(username: string, passwordHash: string): Promise<number> {
  const { data, error } = await supabase
    .from("admin_users").insert({ username, password_hash: passwordHash }).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from("admin_users").delete().eq("id", id).select("id");
  if (error) throw error;
  return (rows?.length ?? 0) > 0;
}
