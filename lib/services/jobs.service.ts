import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, withTimeout } from '@/lib/firebase/config';
import { Job, CreateJobInput, JobStatus, JobStatusHistory } from '@/types/job';
import { INITIAL_JOBS } from './mockData';
import { PricingService } from './pricing.service';
import { CustomersService } from './customers.service';

const LOCAL_STORAGE_KEY = 'workshop_jobs_v1';
const HISTORY_STORAGE_KEY = 'workshop_job_history_v1';

function getLocalJobs(): Job[] {
  if (typeof window === 'undefined') return INITIAL_JOBS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_JOBS;
  }
}

function saveLocalJobs(jobs: Job[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save jobs locally', err);
  }
}

export class JobsService {
  static async listJobs(includeArchived = false): Promise<Job[]> {
    if (!isFirebaseConfigured()) {
      const all = getLocalJobs();
      return includeArchived ? all : all.filter((j) => !j.archivedAt);
    }

    try {
      const jobsRef = collection(db, 'jobs');
      const snap = await withTimeout(getDocs(jobsRef));
      const jobs: Job[] = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Job));

      if (jobs.length === 0) {
        // Fallback to local default if collection is empty
        return getLocalJobs().filter((j) => includeArchived || !j.archivedAt);
      }

      return includeArchived ? jobs : jobs.filter((j) => !j.archivedAt);
    } catch (err) {
      console.warn('Firestore listJobs error, falling back to local state:', err);
      const all = getLocalJobs();
      return includeArchived ? all : all.filter((j) => !j.archivedAt);
    }
  }

  static async getJobById(id: string): Promise<Job | null> {
    if (!isFirebaseConfigured()) {
      const all = getLocalJobs();
      return all.find((j) => j.id === id) || null;
    }

    try {
      const docRef = doc(db, 'jobs', id);
      const snap = await withTimeout(getDoc(docRef));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Job;
      }
      // Check local cache
      const local = getLocalJobs().find((j) => j.id === id);
      return local || null;
    } catch (err) {
      console.warn('Firestore getJobById error:', err);
      const all = getLocalJobs();
      return all.find((j) => j.id === id) || null;
    }
  }

  static async searchJobs(queryText: string): Promise<Job[]> {
    const all = await this.listJobs();
    if (!queryText.trim()) return all;
    const q = queryText.toLowerCase().trim();
    return all.filter(
      (j) =>
        j.jobNumber.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q)
    );
  }

  static async createJob(input: CreateJobInput): Promise<Job> {
    const existing = await this.listJobs(true);
    const nextSeq = existing.length + 1001;
    const year = new Date().getFullYear();
    const jobNumber = `JOB-${year}-${String(nextSeq).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const pricing = PricingService.calculateJobPricing({
      parts: input.parts,
      discountLKR: input.discountLKR,
      taxPercentage: input.taxLKR > 0 ? (input.taxLKR / input.subtotalLKR) * 100 : 0,
      deliveryFeeLKR: input.deliveryFeeLKR,
      paidAmountLKR: 0,
    });

    const newJobData: Omit<Job, 'id'> = {
      ...input,
      jobNumber,
      subtotalLKR: pricing.partsSubtotalLKR,
      discountLKR: pricing.discountLKR,
      taxLKR: pricing.taxLKR,
      deliveryFeeLKR: pricing.deliveryFeeLKR,
      totalLKR: pricing.totalLKR,
      paidAmountLKR: 0,
      balanceLKR: pricing.totalLKR,
      paymentStatus: 'UNPAID',
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await withTimeout(addDoc(collection(db, 'jobs'), newJobData));
        const createdJob: Job = { id: docRef.id, ...newJobData };

        await this.recordStatusTransition(createdJob.id, 'QUOTATION', createdJob.status, 'Job Created');
        if (createdJob.customerId) {
          await CustomersService.updateCustomerStats(createdJob.customerId, createdJob.totalLKR);
        }

        return createdJob;
      } catch (err) {
        console.error('Firestore createJob failed, fallback to local', err);
      }
    }

    const createdJob: Job = { id: `job-${Date.now()}`, ...newJobData };
    saveLocalJobs([createdJob, ...getLocalJobs()]);
    await this.recordStatusTransition(createdJob.id, 'QUOTATION', createdJob.status, 'Job Created');
    if (createdJob.customerId) {
      await CustomersService.updateCustomerStats(createdJob.customerId, createdJob.totalLKR);
    }

    return createdJob;
  }

  static async updateJobStatus(jobId: string, newStatus: JobStatus, note?: string): Promise<Job> {
    const job = await this.getJobById(jobId);
    if (!job) throw new Error('Job not found');

    const oldStatus = job.status;
    if (oldStatus === newStatus) return job;

    const now = new Date().toISOString();
    const updated: Job = {
      ...job,
      status: newStatus,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          status: newStatus,
          updatedAt: now,
        });
      } catch (err) {
        console.error('Firestore updateJobStatus error:', err);
      }
    }

    // Update local cache
    const local = getLocalJobs();
    const idx = local.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      local[idx] = updated;
      saveLocalJobs(local);
    }

    await this.recordStatusTransition(jobId, oldStatus, newStatus, note || `Status updated to ${newStatus}`);
    return updated;
  }

  static async updateJobPayment(jobId: string, addedPaymentLKR: number): Promise<Job> {
    const job = await this.getJobById(jobId);
    if (!job) throw new Error('Job not found');

    const newPaid = Math.round(job.paidAmountLKR + addedPaymentLKR);
    const newBalance = Math.max(0, job.totalLKR - newPaid);

    let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'UNPAID';
    if (newPaid >= job.totalLKR) {
      paymentStatus = 'PAID';
    } else if (newPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const now = new Date().toISOString();
    const updated: Job = {
      ...job,
      paidAmountLKR: newPaid,
      balanceLKR: newBalance,
      paymentStatus,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          paidAmountLKR: newPaid,
          balanceLKR: newBalance,
          paymentStatus,
          updatedAt: now,
        });
      } catch (err) {
        console.error('Firestore updateJobPayment error:', err);
      }
    }

    const local = getLocalJobs();
    const idx = local.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      local[idx] = updated;
      saveLocalJobs(local);
    }

    return updated;
  }

  static async archiveJob(id: string): Promise<void> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'jobs', id), { archivedAt: now });
      } catch (err) {
        console.error('Firestore archiveJob error:', err);
      }
    }
    const local = getLocalJobs();
    const idx = local.findIndex((j) => j.id === id);
    if (idx !== -1) {
      local[idx].archivedAt = now;
      saveLocalJobs(local);
    }
  }

  static async getJobHistory(jobId: string): Promise<JobStatusHistory[]> {
    if (isFirebaseConfigured()) {
      try {
        const histRef = collection(db, 'jobs', jobId, 'history');
        const snap = await getDocs(histRef);
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobStatusHistory));
        }
      } catch (err) {
        console.warn('Firestore getJobHistory error:', err);
      }
    }

    return [
      {
        id: `hist-init-${jobId}`,
        jobId,
        previousStatus: 'QUOTATION',
        newStatus: 'ORDER_CONFIRMED',
        changedBy: 'usr-1',
        changedByName: 'Operator',
        note: 'Order confirmed',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  private static async recordStatusTransition(jobId: string, prev: JobStatus, next: JobStatus, note: string) {
    const entry: Omit<JobStatusHistory, 'id'> = {
      jobId,
      previousStatus: prev,
      newStatus: next,
      changedBy: 'usr-1',
      changedByName: 'Admin Operator',
      note,
      timestamp: new Date().toISOString(),
    };

    if (isFirebaseConfigured()) {
      try {
        await addDoc(collection(db, 'jobs', jobId, 'history'), entry);
      } catch (err) {
        console.error('Firestore recordStatusTransition error:', err);
      }
    }
  }
}
