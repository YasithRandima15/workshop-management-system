import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, withTimeout } from '@/lib/firebase/config';
import { Payment, CreatePaymentInput } from '@/types/payment';
import { INITIAL_PAYMENTS } from './mockData';
import { JobsService } from './jobs.service';

const LOCAL_STORAGE_KEY = 'workshop_payments_v1';

function getLocalPayments(): Payment[] {
  if (typeof window === 'undefined') return INITIAL_PAYMENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
}

function saveLocalPayments(payments: Payment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payments));
  } catch (err) {
    console.error('Failed to save local payments', err);
  }
}

export class PaymentsService {
  static async listPayments(): Promise<Payment[]> {
    if (!isFirebaseConfigured()) {
      return getLocalPayments();
    }

    try {
      const snap = await withTimeout(getDocs(collection(db, 'payments')));
      const payments: Payment[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
      if (payments.length === 0) {
        return getLocalPayments();
      }
      return payments;
    } catch (err) {
      console.warn('Firestore listPayments error:', err);
      return getLocalPayments();
    }
  }

  static async getPaymentsForJob(jobId: string): Promise<Payment[]> {
    const all = await this.listPayments();
    return all.filter((p) => p.jobId === jobId);
  }

  static async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const job = await JobsService.getJobById(input.jobId);
    if (!job) throw new Error('Target job not found');

    const amount = Math.round(input.amountLKR);
    if (amount <= 0) throw new Error('Payment amount must be greater than 0');
    if (amount > job.balanceLKR) {
      throw new Error(`Payment amount (Rs. ${amount}) exceeds remaining job balance (Rs. ${job.balanceLKR})`);
    }

    const existing = await this.listPayments();
    const nextSeq = existing.length + 1004;
    const now = new Date().toISOString();

    const newPaymentData: Omit<Payment, 'id'> = {
      ...input,
      paymentNumber: `PAY-${nextSeq}`,
      amountLKR: amount,
      jobTitle: job.jobNumber + ' (' + job.title + ')',
      recordedAt: input.recordedAt || now,
      createdAt: now,
    };

    // 1. Transactionally update the target Job balance
    await JobsService.updateJobPayment(input.jobId, amount);

    if (isFirebaseConfigured()) {
      try {
        const docRef = await withTimeout(addDoc(collection(db, 'payments'), newPaymentData));
        return { id: docRef.id, ...newPaymentData };
      } catch (err) {
        console.error('Firestore createPayment error:', err);
      }
    }

    const created: Payment = { id: `pay-${Date.now()}`, ...newPaymentData };
    saveLocalPayments([created, ...getLocalPayments()]);
    return created;
  }

  static async deletePayment(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        await withTimeout(deleteDoc(doc(db, 'payments', id)));
      } catch (err) {
        console.error('Firestore deletePayment error:', err);
      }
    }
    const local = getLocalPayments().filter((p) => p.id !== id);
    saveLocalPayments(local);
  }
}
