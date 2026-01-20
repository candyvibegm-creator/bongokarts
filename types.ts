
export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  tagline: string;
  shortDescription?: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  reviewList?: Review[]; // New: List of actual reviews
  category: string;
  brand: string;
  image: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  stock: number;
  dateAdded?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface User {
  name: string;
  email: string;
  address: string;
  bkash: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  user: User;
  date: string;
}

export interface Notification {
  id: string;
  type: 'review' | 'order' | 'system';
  message: string;
  date: string;
  read: boolean;
}

// --- CMS Types ---
export interface CMSContent {
  [key: string]: {
    type: 'text' | 'image';
    value: string;
  };
}

// --- Global Settings ---
export interface SiteSettings {
  logoText: string;
  logoImage?: string;
  // language: 'bn' | 'en'; // Removed language
  currency: string;
  shopGridCols: number;
  enableCOD: boolean;
  aiSystemInstruction: string;
}
