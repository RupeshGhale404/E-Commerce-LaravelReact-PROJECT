import api from './axios';
import { AxiosResponse } from 'axios';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  products_count?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock_quantity: number;
  in_stock: boolean;
  image_path?: string | null;
  is_active: boolean;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shipping_address: Record<string, string>;
  notes?: string;
  items?: OrderItem[];
  items_count?: number;
  user?: { id: number; name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  to: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ProductListParams {
  category_id?: number | string;
  category_slug?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'name' | 'created_at';
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

interface OrdersListParams {
  page?: number;
  per_page?: number;
}

export const productsApi = {
  getAll: (params: ProductListParams = {}): Promise<AxiosResponse<{ data: Product[]; meta: PaginationMeta }>> =>
    api.get('/products', { params }),
  getOne: (slugOrId: string | number): Promise<AxiosResponse<{ success: boolean; data: Product }>> =>
    api.get(`/products/${slugOrId}`),
  getCategories: (): Promise<AxiosResponse<{ success: boolean; data: Category[] }>> =>
    api.get('/categories'),
};

export const ordersApi = {
  place: (data: {
    items: Array<{ product_id: number; quantity: number }>;
    shipping_address: Record<string, string>;
    notes?: string;
  }): Promise<AxiosResponse<{ success: boolean; message: string; data: Order }>> =>
    api.post('/orders', data),
  getHistory: (page: number = 1): Promise<AxiosResponse<{ data: Order[]; meta: PaginationMeta }>> =>
    api.get('/orders', { params: { page } }),
  getOne: (id: number): Promise<AxiosResponse<{ success: boolean; data: Order }>> =>
    api.get(`/orders/${id}`),
};