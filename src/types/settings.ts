export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  announcement?: string;
  policies: {
    returnPolicy: string;
    privacyPolicy: string;
    termsAndConditions: string;
    shippingPolicy: string;
  };
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'VULMORA',
  storeTagline: 'Household Cleaning & Personal Care Essentials',
  logoUrl: '',
  contactEmail: 'care@vulmora.in',
  contactPhone: '+91 70028 31611',
  storeAddress: 'S K Research Laboratories, Gopal Kathar Path, Guwahati, Assam - 781040',
  currency: 'INR',
  currencySymbol: '₹',
  shippingFee: 49,
  freeShippingThreshold: 499,
  lowStockThreshold: 5,
  maintenanceMode: false,
  announcement: '✨ 100% Cash on Delivery (COD) available on all VULMORA household & personal care orders across India!',
  policies: {
    returnPolicy: 'We offer an easy 7-day return policy for unopened and undamaged VULMORA packs. Cash on Delivery refunds are processed directly upon doorstep courier pickup.',
    privacyPolicy: 'VULMORA respects your privacy. We only collect customer delivery address and phone details strictly necessary to dispatch and fulfill Cash on Delivery parcels.',
    termsAndConditions: 'All VULMORA orders are delivered on Cash on Delivery (COD). Please verify the parcel condition with the delivery executive and pay the exact amount upon arrival.',
    shippingPolicy: 'Dispatched directly from Guwahati. Standard delivery time is 2-4 business days for North East & Metro cities, and 4-6 business days across other regions in India.'
  }
};
