import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { DEFAULT_STORE_SETTINGS } from '@/types/settings';

export const VULMORA_CATEGORIES = [
  {
    name: 'Laundry Care',
    slug: 'laundry-care',
    description: 'High-efficacy laundry washing powders for everyday clothes washing and stain removal.',
    imageUrl: '/images/products/vulmora-washing-powder.jpg',
    status: 'active' as const,
  },
  {
    name: 'Floor Cleaning',
    slug: 'floor-cleaning',
    description: 'White phenyl floor-cleaning solutions for routine household hygiene and lasting fragrance.',
    imageUrl: '/images/products/vulmora-white-phenyl-1l.jpg',
    status: 'active' as const,
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Pure skin softeners and hydrating care for dry skin throughout the year.',
    imageUrl: '/images/products/glycerin-ip-50g.jpg',
    status: 'active' as const,
  },
];

export const VULMORA_INITIAL_PRODUCTS = [
  {
    name: 'VULMORA Washing Powder',
    slug: 'vulmora-washing-powder',
    shortDescription: 'Advanced laundry washing powder designed for everyday clothes washing.',
    description: 'VULMORA Washing Powder is engineered for superior everyday clothes washing. Powered by an advanced active formula ("Ziddi Daag, Ek Baar Mein Saaf"), it delivers Power 3X clean, fresh, and bright wash performance while remaining gentle on fabrics.',
    categorySlug: 'laundry-care',
    brand: 'VULMORA',
    size: 'Single Wash Pack',
    price: 10,
    originalPrice: 10,
    sku: 'VLM-WP-01',
    stock: 120,
    lowStockThreshold: 15,
    featured: true,
    status: 'active' as const,
    images: [
      {
        url: '/images/products/vulmora-washing-powder.jpg',
        altText: 'VULMORA Washing Powder Pack',
        isPrimary: true,
      },
    ],
    specifications: [
      { key: 'Brand', value: 'VULMORA' },
      { key: 'Product Type', value: 'Laundry Washing Powder' },
      { key: 'Formula Action', value: 'Power 3X Clean, Fresh & Bright' },
      { key: 'Application', value: 'Bucket & Machine Wash Safe' },
      { key: 'Mfg. & Mktd. By', value: 'S K Research Laboratories, Guwahati, Assam' },
      { key: 'Customer Care', value: '+91 7002831611' },
    ],
  },
  {
    name: 'VULMORA White Phenyl Floor Cleaner',
    slug: 'vulmora-white-phenyl-floor-cleaner-1l',
    shortDescription: 'Household floor-cleaning product for routine floor care with Lavender & Floral Fresh fragrance.',
    description: 'VULMORA White Phenyl Floor Cleaner delivers pristine clean floors and brighter homes. Formulated for daily routine floor care, it effectively removes stubborn stains while leaving behind an uplifting Lavender & Floral Fresh ambiance.',
    categorySlug: 'floor-cleaning',
    brand: 'VULMORA',
    size: '1 L',
    price: 139,
    originalPrice: 160,
    sku: 'VLM-PF-1L',
    stock: 45,
    lowStockThreshold: 8,
    featured: true,
    status: 'active' as const,
    images: [
      {
        url: '/images/products/vulmora-white-phenyl-1l.jpg',
        altText: 'VULMORA White Phenyl Floor Cleaner 1L Bottle',
        isPrimary: true,
      },
    ],
    specifications: [
      { key: 'Brand', value: 'VULMORA' },
      { key: 'Net Volume', value: '1 L (1000 ml)' },
      { key: 'Fragrance', value: 'Lavender & Floral Fresh' },
      { key: 'Purpose', value: 'Routine Household Floor Care' },
      { key: 'Special Action', value: 'Removes Tough Stains & Long Lasting Freshness' },
    ],
  },
  {
    name: 'Glycerin I.P. 50 g',
    slug: 'glycerin-ip-50g',
    shortDescription: 'Natural skin softener for dry skin use throughout the year as a moisturizer.',
    description: 'Glycerin I.P. (ग्लिसरीन) is a natural skin softener formulated to soothe and replenish dry skin throughout the year. Pure pharmaceutical grade hydration in an authentic 50 g bottle.',
    categorySlug: 'personal-care',
    brand: 'Glycerin I.P.',
    size: '50 g',
    price: 80,
    originalPrice: 80,
    sku: 'GLY-IP-50G',
    stock: 50,
    lowStockThreshold: 10,
    featured: true,
    status: 'active' as const,
    images: [
      {
        url: '/images/products/glycerin-ip-50g.jpg',
        altText: 'Glycerin I.P. 50 g Bottle and Carton',
        isPrimary: true,
      },
      {
        url: '/images/products/glycerin-ip-labels.jpg',
        altText: 'Glycerin I.P. Certified Batch Packaging Label',
      },
    ],
    specifications: [
      { key: 'Product', value: 'Glycerin I.P. (ग्लिसरीन)' },
      { key: 'Net Weight', value: '50 GMS' },
      { key: 'Category', value: 'Personal Care & Skin Softener' },
      { key: 'Standard', value: 'I.P. (Indian Pharmacopoeia)' },
      { key: 'Batch No.', value: 'GL-141' },
      { key: 'Printed MRP', value: '₹ 80.00 (Inclusive of all taxes)' },
      { key: 'Repacked By', value: 'Amba Research Laboratories, Patna' },
    ],
  },
  {
    name: 'Glycerin I.P. 100 g',
    slug: 'glycerin-ip-100g',
    shortDescription: 'Natural skin softener for dry skin use throughout the year as a moisturizer (100 g economy size).',
    description: 'Pure Glycerin I.P. (ग्लिसरीन) in a 100 g size. Ideal for frequent household skin hydration, rough skin areas, and year-round moisture retention.',
    categorySlug: 'personal-care',
    brand: 'Glycerin I.P.',
    size: '100 g',
    price: 145,
    originalPrice: 145,
    sku: 'GLY-IP-100G',
    stock: 35,
    lowStockThreshold: 8,
    featured: true,
    status: 'active' as const,
    images: [
      {
        url: '/images/products/glycerin-ip-100g.jpg',
        altText: 'Glycerin I.P. 100 g Bottle and Carton Showcase',
        isPrimary: true,
      },
      {
        url: '/images/products/glycerin-ip-labels.jpg',
        altText: 'Glycerin I.P. 100 g Packaging Label',
      },
    ],
    specifications: [
      { key: 'Product', value: 'Glycerin I.P. (ग्लिसरीन)' },
      { key: 'Net Weight', value: '100 GMS' },
      { key: 'Category', value: 'Personal Care & Skin Softener' },
      { key: 'Standard', value: 'I.P. (Indian Pharmacopoeia)' },
      { key: 'Batch No.', value: 'GL-141' },
      { key: 'Printed MRP', value: '₹ 145.00 (Inclusive of all taxes)' },
      { key: 'Repacked By', value: 'Amba Research Laboratories, Patna' },
    ],
  },
];

/**
 * Seeds VULMORA brand initial categories and authentic products to Firestore
 */
export async function seedInitialFirestoreData(): Promise<{
  categoriesCount: number;
  productsCount: number;
}> {
  const batch = writeBatch(db);

  // 1. Seed store settings with VULMORA brand defaults
  const settingsRef = doc(db, 'settings', 'general');
  batch.set(
    settingsRef,
    {
      ...DEFAULT_STORE_SETTINGS,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 2. Map VULMORA categories
  const categoryIdsBySlug: Record<string, string> = {};

  for (const cat of VULMORA_CATEGORIES) {
    const catRef = doc(collection(db, 'categories'));
    categoryIdsBySlug[cat.slug] = catRef.id;
    batch.set(catRef, {
      ...cat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // 3. Create VULMORA initial products
  for (const prod of VULMORA_INITIAL_PRODUCTS) {
    const prodRef = doc(collection(db, 'products'));
    const categoryId = categoryIdsBySlug[prod.categorySlug] || '';
    const categoryName =
      VULMORA_CATEGORIES.find((c) => c.slug === prod.categorySlug)?.name || '';

    const { categorySlug, ...cleanProd } = prod;

    batch.set(prodRef, {
      ...cleanProd,
      categoryId,
      categoryName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();

  return {
    categoriesCount: VULMORA_CATEGORIES.length,
    productsCount: VULMORA_INITIAL_PRODUCTS.length,
  };
}
