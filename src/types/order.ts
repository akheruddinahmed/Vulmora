export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Collected' | 'Refunded';

export type PaymentMethod = 'COD';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: any;
  updatedBy?: string;
  notes?: string;
}

export interface Order {
  id: string; // Firestore document ID
  orderId: string; // Readable reference ID e.g. ORD-20261014-9418
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItemSnapshot[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: 'INR';
  paymentMethod: 'COD';
  paymentStatus: PaymentStatus;
  paymentCollectedAt?: any;
  paymentCollectedBy?: string;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  adminNotes?: string;
  inventoryRestored?: boolean;
  createdAt: any;
  updatedAt: any;
}
