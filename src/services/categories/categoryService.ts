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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { Category } from '@/types/product';
import { slugify } from '@/utils/formatters';

const CATEGORIES_COLLECTION = 'categories';
const PRODUCTS_COLLECTION = 'products';

export async function getAllCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
  } catch (err) {
    console.error('Error fetching categories:', err);
    throw err;
  }
}

export async function getActiveCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(colRef, where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
  } catch (err) {
    console.error('Error fetching active categories:', err);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Category;
  } catch (err) {
    console.error('Error fetching category by id:', err);
    return null;
  }
}

export async function createCategory(
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const cleanSlug = slugify(categoryData.slug || categoryData.name);
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
    ...categoryData,
    slug: cleanSlug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(
  id: string,
  categoryData: Partial<Category>
): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  const payload: any = {
    ...categoryData,
    updatedAt: serverTimestamp(),
  };
  if (categoryData.name && !categoryData.slug) {
    payload.slug = slugify(categoryData.name);
  }
  await updateDoc(docRef, payload);
}

export async function deleteCategory(id: string): Promise<void> {
  // Check if any product is assigned to this category
  const productsQuery = query(
    collection(db, PRODUCTS_COLLECTION),
    where('categoryId', '==', id)
  );
  const assignedProductsSnap = await getDocs(productsQuery);

  if (!assignedProductsSnap.empty) {
    throw new Error(
      `Cannot delete category. There are ${assignedProductsSnap.size} product(s) currently assigned to this category. Please reassign them before deletion.`
    );
  }

  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
}
