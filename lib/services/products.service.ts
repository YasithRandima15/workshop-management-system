import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, withTimeout } from '@/lib/firebase/config';
import { Product, CreateProductInput } from '@/types/product';

const LOCAL_STORAGE_KEY = 'workshop_products_v1';

const INITIAL_PRODUCTS: Product[] = [];

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(prods: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prods));
  } catch (err) {
    console.error('Failed to save local products', err);
  }
}

export class ProductsService {
  static async listProducts(): Promise<Product[]> {
    if (!isFirebaseConfigured()) {
      return getLocalProducts();
    }

    try {
      const snap = await withTimeout(getDocs(collection(db, 'products')));
      const prods: Product[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      if (prods.length === 0) return getLocalProducts();
      return prods;
    } catch (err) {
      console.warn('Firestore listProducts error:', err);
      return getLocalProducts();
    }
  }

  static async createProduct(input: CreateProductInput): Promise<Product> {
    const existing = await this.listProducts();
    const nextSeq = existing.length + 100;
    const sku = `PRD-${input.category.substring(0, 3)}-${nextSeq}`;
    const now = new Date().toISOString();

    const data: Omit<Product, 'id'> = {
      ...input,
      sku,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await withTimeout(addDoc(collection(db, 'products'), data));
        return { id: docRef.id, ...data };
      } catch (err) {
        console.error('Firestore createProduct error:', err);
      }
    }

    const created: Product = { id: `prod-${Date.now()}`, ...data };
    saveLocalProducts([created, ...getLocalProducts()]);
    return created;
  }

  static async deleteProduct(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        await withTimeout(deleteDoc(doc(db, 'products', id)));
      } catch (err) {
        console.error('Firestore deleteProduct error:', err);
      }
    }
    const local = getLocalProducts().filter((p) => p.id !== id);
    saveLocalProducts(local);
  }
}
