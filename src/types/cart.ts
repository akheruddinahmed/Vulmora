export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  sku: string;
  quantity: number;
  maxStock: number;
}

export interface BuyNowItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  sku: string;
  quantity: number;
  maxStock: number;
}
