import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Expense, CreateExpenseInput } from '@/types/expense';

const LOCAL_STORAGE_KEY = 'workshop_expenses_v1';

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    category: 'UTILITIES',
    categoryName: 'Electricity & Utilities',
    description: 'Monthly Industrial Power Bill (3-Phase CNC Load)',
    amountLKR: 45000,
    date: '2026-08-01',
    loggedBy: 'usr-1',
    loggedByName: 'Admin',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'exp-2',
    category: 'TOOLING',
    categoryName: 'CNC Tooling Bits',
    description: '6mm 2-Flute Carbide End Mills (10 Pack)',
    amountLKR: 18500,
    date: '2026-08-03',
    loggedBy: 'usr-1',
    loggedByName: 'Admin',
    createdAt: '2026-08-03T11:30:00Z',
    updatedAt: '2026-08-03T11:30:00Z',
  },
  {
    id: 'exp-3',
    category: 'RAW_MATERIAL',
    categoryName: 'Filament Stock',
    description: '5 Spools eSUN PLA Tough Filament (Black / White)',
    amountLKR: 28000,
    date: '2026-08-05',
    loggedBy: 'usr-1',
    loggedByName: 'Admin',
    createdAt: '2026-08-05T14:15:00Z',
    updatedAt: '2026-08-05T14:15:00Z',
  },
];

function getLocalExpenses(): Expense[] {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXPENSES;
  }
}

function saveLocalExpenses(expenses: Expense[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save local expenses', err);
  }
}

export class ExpensesService {
  static async listExpenses(): Promise<Expense[]> {
    if (!isFirebaseConfigured()) {
      return getLocalExpenses();
    }

    try {
      const snap = await getDocs(collection(db, 'expenses'));
      const expenses: Expense[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
      if (expenses.length === 0) return getLocalExpenses();
      return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (err) {
      console.warn('Firestore listExpenses error:', err);
      return getLocalExpenses();
    }
  }

  static async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const now = new Date().toISOString();
    const data: Omit<Expense, 'id'> = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await addDoc(collection(db, 'expenses'), data);
        return { id: docRef.id, ...data };
      } catch (err) {
        console.error('Firestore createExpense error:', err);
      }
    }

    const created: Expense = { id: `exp-${Date.now()}`, ...data };
    saveLocalExpenses([created, ...getLocalExpenses()]);
    return created;
  }

  static async deleteExpense(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (err) {
        console.error('Firestore deleteExpense error:', err);
      }
    }
    const local = getLocalExpenses().filter((e) => e.id !== id);
    saveLocalExpenses(local);
  }
}
