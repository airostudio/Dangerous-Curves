import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "data", "store.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initDb(_db);
  }
  return _db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      size TEXT NOT NULL DEFAULT '',
      era TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_address TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      total INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id)
    );
  `);

  // Seed admin user if none exists
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admin_users").get() as { count: number };
  if (adminCount.count === 0) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run("admin", hash);
  }

  // Seed products if none exist
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    seedProducts(db);
  }
}

function seedProducts(db: Database.Database) {
  const products = [
    {
      name: "Cherry Bomb Leather Jacket",
      description: "Classic cherry-red leather moto jacket with silver hardware and quilted lining. The kind of jacket that walks into a room before you do.",
      price: 18900,
      category: "Outerwear",
      size: "M",
      era: "80s",
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      stock: 1,
      featured: 1,
    },
    {
      name: "Polka Dot Swing Dress",
      description: "Black and white polka dot swing dress with sweetheart neckline and full circle skirt. Perfect for jiving or just turning heads.",
      price: 14200,
      category: "Dresses",
      size: "S",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
      stock: 1,
      featured: 1,
    },
    {
      name: "Thunderbird Denim Jacket",
      description: "Faded indigo denim jacket with custom Thunderbird embroidery on the back. Worn-in perfection that tells a story.",
      price: 16500,
      category: "Outerwear",
      size: "L",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
      stock: 2,
      featured: 1,
    },
    {
      name: "Pin-Up Rose Pencil Skirt",
      description: "High-waisted black pencil skirt with red rose embroidery along the hem. Curves ahead — you've been warned.",
      price: 7800,
      category: "Bottoms",
      size: "M",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0afe0?auto=format&fit=crop&w=800&q=80",
      stock: 3,
      featured: 0,
    },
    {
      name: "Hot Rod Red Stilettos",
      description: "Patent leather stilettos in hot rod red with pointed toe and chrome heel detail. Dangerous from every angle.",
      price: 9500,
      category: "Shoes",
      size: "7",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      stock: 1,
      featured: 1,
    },
    {
      name: "Leopard Cat-Eye Sunglasses",
      description: "Vintage leopard print cat-eye frames with dark lenses. The accessory that says you're not here to play nice.",
      price: 4500,
      category: "Accessories",
      size: "One Size",
      era: "60s",
      image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      stock: 5,
      featured: 0,
    },
    {
      name: "Rebel Without a Cause Tee",
      description: "Vintage-wash black tee with distressed rebel graphic. Soft cotton, lived-in feel, zero apologies.",
      price: 5500,
      category: "Tops",
      size: "M",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
      stock: 4,
      featured: 0,
    },
    {
      name: "Velvet Elvis Bowling Shirt",
      description: "Two-tone bowling shirt in black and teal with contrast stitching and retro collar. Rockabilly royalty status.",
      price: 8800,
      category: "Tops",
      size: "L",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      stock: 2,
      featured: 1,
    },
    {
      name: "Checkered Flag Mini Skirt",
      description: "Black and white checkered mini skirt with high waist and back zip. Race-day energy, every day.",
      price: 6800,
      category: "Bottoms",
      size: "S",
      era: "60s",
      image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0afe0?auto=format&fit=crop&w=800&q=80",
      stock: 2,
      featured: 0,
    },
    {
      name: "Greaser Cuffed Jeans",
      description: "Dark selvedge denim with a straight leg and cuffed hem. The jeans James Dean would've worn on a Saturday night.",
      price: 9600,
      category: "Denim",
      size: "32",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
      stock: 3,
      featured: 0,
    },
    {
      name: "Flame Detail Western Boots",
      description: "Black leather western boots with flame stitching and stacked heel. Walk into trouble with style.",
      price: 15500,
      category: "Shoes",
      size: "9",
      era: "80s",
      image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
      stock: 1,
      featured: 1,
    },
    {
      name: "Chrome Heart Belt Buckle",
      description: "Oversized chrome belt buckle with heart and crossbones motif. The finishing touch every outfit needs.",
      price: 6200,
      category: "Accessories",
      size: "One Size",
      era: "50s",
      image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      stock: 4,
      featured: 0,
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, category, size, era, image_url, stock, featured)
    VALUES (@name, @description, @price, @category, @size, @era, @image_url, @stock, @featured)
  `);

  for (const product of products) {
    stmt.run(product);
  }
}
