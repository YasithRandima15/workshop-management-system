import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@/types/customer';
import { INITIAL_CUSTOMERS } from './mockData';

const LOCAL_STORAGE_KEY = 'workshop_customers_v1';

function getLocalCustomers(): Customer[] {
  if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

function saveLocalCustomers(customers: Customer[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customers));
  } catch (err) {
    console.error('Failed to save local customers', err);
  }
}

export class CustomersService {
  static async listCustomers(includeArchived = false): Promise<Customer[]> {
    if (!isFirebaseConfigured()) {
      const all = getLocalCustomers();
      return includeArchived ? all : all.filter((c) => !c.archivedAt);
    }

    try {
      const snap = await getDocs(collection(db, 'customers'));
      const customers: Customer[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
      if (customers.length === 0) {
        return getLocalCustomers().filter((c) => includeArchived || !c.archivedAt);
      }
      return includeArchived ? customers : customers.filter((c) => !c.archivedAt);
    } catch (err) {
      console.warn('Firestore listCustomers error:', err);
      const all = getLocalCustomers();
      return includeArchived ? all : all.filter((c) => !c.archivedAt);
    }
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    if (!isFirebaseConfigured()) {
      return getLocalCustomers().find((c) => c.id === id) || null;
    }
    try {
      const snap = await getDoc(doc(db, 'customers', id));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as Customer;
      return getLocalCustomers().find((c) => c.id === id) || null;
    } catch (err) {
      console.warn('Firestore getCustomerById error:', err);
      return getLocalCustomers().find((c) => c.id === id) || null;
    }
  }

  static async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const existing = await this.listCustomers(true);
    const nextNum = existing.length + 1001;
    const now = new Date().toISOString();

    const newCustomerData: Omit<Customer, 'id'> = {
      ...input,
      customerCode: `CUST-${nextNum}`,
      totalJobsCount: 0,
      totalSpentLKR: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await addDoc(collection(db, 'customers'), newCustomerData);
        return { id: docRef.id, ...newCustomerData };
      } catch (err) {
        console.error('Firestore createCustomer error:', err);
      }
    }

    const created: Customer = { id: `cust-${Date.now()}`, ...newCustomerData };
    saveLocalCustomers([created, ...getLocalCustomers()]);
    return created;
  }

  static async updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const current = await this.getCustomerById(id);
    if (!current) throw new Error('Customer not found');

    const now = new Date().toISOString();
    const updated: Customer = {
      ...current,
      ...input,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'customers', id), { ...input, updatedAt: now });
      } catch (err) {
        console.error('Firestore updateCustomer error:', err);
      }
    }

    const local = getLocalCustomers();
    const idx = local.findIndex((c) => c.id === id);
    if (idx !== -1) {
      local[idx] = updated;
      saveLocalCustomers(local);
    }

    return updated;
  }

  static async archiveCustomer(id: string): Promise<void> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'customers', id), { archivedAt: now });
      } catch (err) {
        console.error('Firestore archiveCustomer error:', err);
      }
    }
    const local = getLocalCustomers();
    const idx = local.findIndex((c) => c.id === id);
    if (idx !== -1) {
      local[idx].archivedAt = now;
      saveLocalCustomers(local);
    }
  }

  static async updateCustomerStats(customerId: string, addedSpentLKR: number): Promise<void> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return;

    const newCount = customer.totalJobsCount + 1;
    const newSpent = customer.totalSpentLKR + Math.round(addedSpentLKR);
    const now = new Date().toISOString();

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'customers', customerId), {
          totalJobsCount: newCount,
          totalSpentLKR: newSpent,
          updatedAt: now,
        });
      } catch (err) {
        console.error('Firestore updateCustomerStats error:', err);
      }
    }

    const local = getLocalCustomers();
    const idx = local.findIndex((c) => c.id === customerId);
    if (idx !== -1) {
      local[idx].totalJobsCount = newCount;
      local[idx].totalSpentLKR = newSpent;
      local[idx].updatedAt = now;
      saveLocalCustomers(local);
    }
  }
}
