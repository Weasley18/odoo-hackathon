// API service for EcoFinds
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  eco_rating?: number;
  eco_details?: string;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
  image_urls: string[];
  seller_name: string;
}

export interface ProductListResponse {
  products: Product[];
  next_cursor?: string;
  has_more: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  added_at: string;
  product_name: string;
  product_price: number;
  product_image_url: string;
  total_price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  product_name: string;
  product_image_url: string;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  created_at: string;
  items: OrderItem[];
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  eco_rating?: number;
  eco_details?: string;
  image_urls: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: string;
  eco_rating?: number;
  eco_details?: string;
  image_urls?: string[];
}

export interface AddToCartData {
  product_id: number;
  quantity: number;
}

export interface CheckoutData {
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Products API
  async getProducts(params?: {
    category?: string;
    q?: string;
    cursor?: string;
    limit?: number;
  }): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.q) searchParams.append('q', params.q);
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/products?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  }

  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  }

  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }

  async getCategories(): Promise<{ categories: string[] }> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }

  // Cart API
  async getCart(): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    return response.json();
  }

  async addToCart(data: AddToCartData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
  }

  async removeFromCart(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to remove from cart');
    }
  }

  // Orders API
  async createOrder(data: CheckoutData): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    return response.json();
  }

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  }

  // Auth API (placeholder - would be implemented in auth feature)
  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Failed to login');
    }
    return response.json();
  }

  async signup(userData: { email: string; password: string; name: string }): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to signup');
    }
    return response.json();
  }
}

export const apiService = new ApiService();
