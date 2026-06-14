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
  status: string;
  created_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  path: string;
  url: string;
  position: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  status: string;
  total: number;
  stripe_session_id: string | null;
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
