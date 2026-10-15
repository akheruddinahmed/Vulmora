import { DeliveryAddress } from './order';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: 'customer' | 'admin';
  savedAddress?: DeliveryAddress;
  createdAt?: any;
  updatedAt?: any;
}

export interface AdminRoleRecord {
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  promotedAt: any;
  promotedBy?: string;
}
