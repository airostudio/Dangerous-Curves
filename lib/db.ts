import bcrypt from "bcryptjs";
import type { Product, Order, OrderItem } from "./types";

// In-memory store — data resets on cold start but works on all platforms
// including Vercel serverless. For production, swap with a hosted DB.

interface Store {
  products: Product[];
  orders: (Order & { items: OrderItem[] })[];
  adminUsers: { id: number; username: string; password_hash: string }[];
  sessions: { id: string; user_id: number; expires_at: string }[];
  nextProductId: number;
  nextOrderId: number;
  nextOrderItemId: number;
}

const store: Store = {
  products: [],
  orders: [],
  adminUsers: [],
  sessions: [],
  nextProductId: 1,
  nextOrderId: 1,
  nextOrderItemId: 1,
};

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;

  // Seed admin
  store.adminUsers.push({
    id: 1,
    username: "admin",
    password_hash: bcrypt.hashSync("admin123", 10),
  });

  // Seed products
  const seedProducts: Omit<Product, "id" | "created_at">[] = [
    {
      name: "Cherry Bomb Leather Jacket",
      description: "Classic cherry-red leather moto jacket with silver hardware and quilted lining. The kind of jacket that walks into a room before you do.",
      price: 18900, category: "Outerwear", size: "M", era: "80s",
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      stock: 1, featured: 1,
    },
    {
      name: "Polka Dot Swing Dress",
      description: "Black and white polka dot swing dress with sweetheart neckline and full circle skirt. Perfect for jiving or just turning heads.",
      price: 14200, category: "Dresses", size: "S", era: "50s",
      image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
      stock: 1, featured: 1,
    },
    {
      name: "Thunderbird Denim Jacket",
      description: "Faded indigo denim jacket with custom Thunderbird embroidery on the back. Worn-in perfection that tells a story.",
      price: 16500, category: "Outerwear", size: "L", era: "50s",
      image_url: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
      stock: 2, featured: 1,
    },
    {
      name: "Pin-Up Rose Pencil Skirt",
      description: "High-waisted black pencil skirt with red rose embroidery along the hem. Curves ahead — you've been warned.",
      price: 7800, category: "Bottoms", size: "M", era: "50s",
      image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0afe0?auto=format&fit=crop&w=800&q=80",
      stock: 3, featured: 0,
    },
    {
      name: "Hot Rod Red Stilettos",
      description: "Patent leather stilettos in hot rod red with pointed toe and chrome heel detail. Dangerous from every angle.",
      price: 9500, category: "Shoes", size: "7", era: "50s",
      image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      stock: 1, featured: 1,
    },
    {
      name: "Leopard Cat-Eye Sunglasses",
      description: "Vintage leopard print cat-eye frames with dark lenses. The accessory that says you're not here to play nice.",
      price: 4500, category: "Accessories", size: "One Size", era: "60s",
      image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      stock: 5, featured: 0,
    },
    {
      name: "Rebel Without a Cause Tee",
      description: "Vintage-wash black tee with distressed rebel graphic. Soft cotton, lived-in feel, zero apologies.",
      price: 5500, category: "Tops", size: "M", era: "50s",
      image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
      stock: 4, featured: 0,
    },
    {
      name: "Velvet Elvis Bowling Shirt",
      description: "Two-tone bowling shirt in black and teal with contrast stitching and retro collar. Rockabilly royalty status.",
      price: 8800, category: "Tops", size: "L", era: "50s",
      image_url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      stock: 2, featured: 1,
    },
    {
      name: "Checkered Flag Mini Skirt",
      description: "Black and white checkered mini skirt with high waist and back zip. Race-day energy, every day.",
      price: 6800, category: "Bottoms", size: "S", era: "60s",
      image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0afe0?auto=format&fit=crop&w=800&q=80",
      stock: 2, featured: 0,
    },
    {
      name: "Greaser Cuffed Jeans",
      description: "Dark selvedge denim with a straight leg and cuffed hem. The jeans James Dean would've worn on a Saturday night.",
      price: 9600, category: "Denim", size: "32", era: "50s",
      image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
      stock: 3, featured: 0,
    },
    {
      name: "Flame Detail Western Boots",
      description: "Black leather western boots with flame stitching and stacked heel. Walk into trouble with style.",
      price: 15500, category: "Shoes", size: "9", era: "80s",
      image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
      stock: 1, featured: 1,
    },
    {
      name: "Chrome Heart Belt Buckle",
      description: "Oversized chrome belt buckle with heart and crossbones motif. The finishing touch every outfit needs.",
      price: 6200, category: "Accessories", size: "One Size", era: "50s",
      image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      stock: 4, featured: 0,
    },
  ];

  for (const p of seedProducts) {
    store.products.push({
      ...p,
      id: store.nextProductId++,
      created_at: new Date().toISOString(),
    });
  }
}

// --- Product queries ---

export function getAllProducts(): Product[] {
  ensureInit();
  return [...store.products].sort((a, b) => b.featured - a.featured || b.id - a.id);
}

export function getProductsByFilter(category?: string, search?: string): Product[] {
  ensureInit();
  let results = store.products;
  if (category && category !== "All") {
    results = results.filter((p) => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.era.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  return results.sort((a, b) => b.featured - a.featured || b.id - a.id);
}

export function getProductById(id: number): Product | undefined {
  ensureInit();
  return store.products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string, excludeId?: number): Product[] {
  ensureInit();
  return store.products.filter((p) => p.category === category && p.id !== excludeId).slice(0, 3);
}

export function getFeaturedProducts(limit = 6): Product[] {
  ensureInit();
  return store.products.filter((p) => p.featured === 1).slice(0, limit);
}

export function createProduct(data: Omit<Product, "id" | "created_at">): number {
  ensureInit();
  const id = store.nextProductId++;
  store.products.push({ ...data, id, created_at: new Date().toISOString() });
  return id;
}

export function updateProduct(id: number, data: Omit<Product, "id" | "created_at">): boolean {
  ensureInit();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.products[idx] = { ...store.products[idx], ...data };
  return true;
}

export function deleteProduct(id: number): boolean {
  ensureInit();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.products.splice(idx, 1);
  return true;
}

// --- Order queries ---

export function getAllOrders() {
  ensureInit();
  return [...store.orders].sort((a, b) => b.id - a.id);
}

export function createOrder(data: {
  customer_name: string;
  customer_email: string;
  customer_address: string;
  items: { product_id: number; product_name: string; quantity: number; price: number }[];
}): number {
  ensureInit();
  const orderId = store.nextOrderId++;
  const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const items: OrderItem[] = data.items.map((i) => ({
    id: store.nextOrderItemId++,
    order_id: orderId,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    price: i.price,
  }));
  store.orders.push({
    id: orderId,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_address: data.customer_address,
    status: "pending",
    total,
    created_at: new Date().toISOString(),
    items,
  });
  return orderId;
}

export function updateOrderStatus(id: number, status: string): boolean {
  ensureInit();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return false;
  order.status = status;
  return true;
}

// --- Stats ---

export function getStats() {
  ensureInit();
  return {
    productCount: store.products.length,
    orderCount: store.orders.length,
    revenue: store.orders.reduce((sum, o) => sum + o.total, 0),
    lowStock: store.products.filter((p) => p.stock <= 1 && p.stock > 0).length,
  };
}

export function getLowStockProducts() {
  ensureInit();
  return store.products.filter((p) => p.stock <= 2).sort((a, b) => a.stock - b.stock).slice(0, 5);
}

// --- Auth ---

export function findAdminByUsername(username: string) {
  ensureInit();
  return store.adminUsers.find((u) => u.username === username);
}

export function createSession(sessionId: string, userId: number, expiresAt: string) {
  ensureInit();
  // Clean old sessions for this user
  store.sessions = store.sessions.filter((s) => s.user_id !== userId);
  store.sessions.push({ id: sessionId, user_id: userId, expires_at: expiresAt });
}

export function getSessionById(sessionId: string) {
  ensureInit();
  const session = store.sessions.find((s) => s.id === sessionId && new Date(s.expires_at) > new Date());
  if (!session) return null;
  const user = store.adminUsers.find((u) => u.id === session.user_id);
  if (!user) return null;
  return { user_id: user.id, username: user.username };
}

export function deleteSession(sessionId: string) {
  ensureInit();
  store.sessions = store.sessions.filter((s) => s.id !== sessionId);
}
