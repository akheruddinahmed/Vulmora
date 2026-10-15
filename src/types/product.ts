export interface ProductImage {
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  brand?: string;
  size?: string; // e.g. "1 L", "50 g", "100 g"
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  images: ProductImage[];
  specifications: ProductSpecification[];
  featured: boolean;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  status: 'active' | 'inactive';
  productCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProductFilterOptions {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}
