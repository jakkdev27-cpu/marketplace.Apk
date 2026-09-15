export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  priceMinor: number;
  oldPriceMinor?: number;
  currency: string;
  stock: number;
  reference?: string;
  shopId: string;
  shopName: string;
  categoryId?: string;
  categoryName?: string;
  images: string[];
  status: string;
  createdAt: string;
}

export interface CartItem {
  itemId: string;
  productId: string;
  name: string;
  priceMinor: number;
  currency: string;
  quantity: number;
  stock: number;
  shopId: string;
  shopName: string;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  totalMinor: number;
  currency: string;
}

export interface OrderLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceMinor: number;
}

export interface SellerOrder {
  id: string;
  orderId: string;
  shopId: string;
  shopName: string;
  status: string;
  subtotalMinor: number;
  currency: string;
  items: OrderLine[];
}

export interface Order {
  id: string;
  status: string;
  totalMinor: number;
  currency: string;
  liveSessionId?: string;
  createdAt: string;
  sellerOrders: SellerOrder[];
}

export interface LegalDocument {
  id: string;
  type: string;
  title: string;
  version: number;
  content: string;
  status: string;
  publishedAt?: string;
  effectiveAt?: string;
  changeSummary?: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  slogan?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
}
