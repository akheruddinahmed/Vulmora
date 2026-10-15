import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { Product, ProductFilterOptions } from '@/types/product';
import { slugify } from '@/utils/formatters';

const PRODUCTS_COLLECTION = 'products';
const INVENTORY_LOGS_COLLECTION = 'inventoryLogs';

export async function getActiveProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    let q = query(productsRef, where('status', '==', 'active'));

    if (options.category) {
      q = query(q, where('categoryId', '==', options.category));
    }

    const snapshot = await getDocs(q);
    let products: Product[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Product[];

    // In-memory filtering and sorting to support flexible combinations without needing 20+ composite indexes
    if (options.search) {
      const searchLower = options.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.shortDescription?.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower)
      );
    }

    if (options.minPrice !== undefined) {
      products = products.filter((p) => p.price >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= options.maxPrice!);
    }

    if (options.inStockOnly) {
      products = products.filter((p) => p.stock > 0);
    }

    // Sorting
    switch (options.sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        products.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        break;
    }

    return products;
  } catch (err: any) {
    console.error('Error fetching active products:', err);
    throw err;
  }
}

export async function getFeaturedProducts(maxCount: number = 8): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('status', '==', 'active'),
      where('featured', '==', true),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Product[];

    // Fallback if no featured products configured yet: return latest active
    if (products.length === 0) {
      return getActiveProducts({ sortBy: 'newest' }).then((res) => res.slice(0, maxCount));
    }
    return products;
  } catch (err) {
    console.warn('Error fetching featured products, falling back to latest:', err);
    return getActiveProducts({ sortBy: 'newest' }).then((res) => res.slice(0, maxCount));
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } catch (err) {
    console.error(`Error fetching product by slug ${slug}:`, err);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
  } catch (err) {
    console.error(`Error fetching product by id ${id}:`, err);
    return null;
  }
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    const products = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Product[];
    return products.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error fetching admin products:', err);
    throw err;
  }
}

export async function createProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const cleanSlug = slugify(productData.slug || productData.name);
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    slug: cleanSlug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(
  id: string,
  productData: Partial<Product>
): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const payload: any = {
    ...productData,
    updatedAt: serverTimestamp(),
  };
  if (productData.name && !productData.slug) {
    payload.slug = slugify(productData.name);
  }
  await updateDoc(docRef, payload);
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function adjustInventoryStock(
  productId: string,
  newStock: number,
  reason: 'MANUAL_RESTOCK' | 'MANUAL_CORRECTION' | 'DAMAGE_WRITE_OFF',
  actorUid: string,
  actorEmail?: string,
  notes?: string
): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  const logsRef = collection(db, INVENTORY_LOGS_COLLECTION);

  await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) {
      throw new Error('Product does not exist.');
    }

    const currentData = productSnap.data() as Product;
    const oldStock = currentData.stock || 0;
    const change = newStock - oldStock;

    transaction.update(productRef, {
      stock: newStock,
      updatedAt: serverTimestamp(),
    });

    const newLogDoc = doc(logsRef);
    transaction.set(newLogDoc, {
      productId,
      productName: currentData.name,
      sku: currentData.sku,
      quantityBefore: oldStock,
      quantityAfter: newStock,
      quantityChange: change,
      reason,
      actorUid,
      actorEmail: actorEmail || '',
      notes: notes || '',
      createdAt: serverTimestamp(),
    });
  });
}
