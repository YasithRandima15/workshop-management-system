import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Quotation, CreateQuotationInput, QuotationStatus } from '@/types/quotation';

const LOCAL_STORAGE_KEY = 'workshop_quotations_v1';

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qt-101',
    quotationNumber: 'QT-2026-0010',
    customerId: 'cust-1',
    customerName: 'Vega Innovations',
    customerEmail: 'engineering@vega.lk',
    title: 'Custom Battery Enclosure Milling & SLA Covers',
    parts: [
      {
        id: 'part-q1',
        partName: 'Lower Housing Base',
        manufacturingMethod: 'CNC',
        quantity: 2,
        unitPriceLKR: 16375,
        totalPriceLKR: 32750,
      },
    ],
    subtotalLKR: 32750,
    discountLKR: 2750,
    taxLKR: 0,
    totalLKR: 30000,
    validUntil: '2026-08-30',
    status: 'SENT',
    notes: 'Quotation valid for 30 days. Material pricing subject to market variance.',
    createdBy: 'usr-1',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },
];

function getLocalQuotations(): Quotation[] {
  if (typeof window === 'undefined') return INITIAL_QUOTATIONS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_QUOTATIONS));
      return INITIAL_QUOTATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUOTATIONS;
  }
}

function saveLocalQuotations(quots: Quotation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quots));
  } catch (err) {
    console.error('Failed to save local quotations', err);
  }
}

export class QuotationsService {
  static async listQuotations(): Promise<Quotation[]> {
    if (!isFirebaseConfigured()) {
      return getLocalQuotations();
    }

    try {
      const snap = await getDocs(collection(db, 'quotations'));
      const quots: Quotation[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quotation));
      if (quots.length === 0) return getLocalQuotations();
      return quots;
    } catch (err) {
      console.warn('Firestore listQuotations error:', err);
      return getLocalQuotations();
    }
  }

  static async createQuotation(input: CreateQuotationInput): Promise<Quotation> {
    const existing = await this.listQuotations();
    const nextNum = existing.length + 10;
    const year = new Date().getFullYear();
    const quotationNumber = `QT-${year}-${String(nextNum).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const data: Omit<Quotation, 'id'> = {
      ...input,
      quotationNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await addDoc(collection(db, 'quotations'), data);
        return { id: docRef.id, ...data };
      } catch (err) {
        console.error('Firestore createQuotation error:', err);
      }
    }

    const created: Quotation = { id: `qt-${Date.now()}`, ...data };
    saveLocalQuotations([created, ...getLocalQuotations()]);
    return created;
  }

  static async updateQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    const all = await this.listQuotations();
    const target = all.find((q) => q.id === id);
    if (!target) throw new Error('Quotation not found');

    const now = new Date().toISOString();
    const updated: Quotation = {
      ...target,
      status,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'quotations', id), { status, updatedAt: now });
      } catch (err) {
        console.error('Firestore updateQuotationStatus error:', err);
      }
    }

    const local = getLocalQuotations();
    const idx = local.findIndex((q) => q.id === id);
    if (idx !== -1) {
      local[idx] = updated;
      saveLocalQuotations(local);
    }

    return updated;
  }
}
