export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string;
  era: string;
  image_url: string;
  stock: number;
  featured: number;
  created_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  status: string;
  total: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminUser {
  id: number;
  username: string;
}
