import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { INITIAL_MATERIALS, INITIAL_MACHINES, INITIAL_CUSTOMERS, INITIAL_JOBS, INITIAL_PAYMENTS } from './mockData';

export class SeedService {
  static async seedDatabaseToFirebase(): Promise<{ success: boolean; message: string }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message: 'Firebase is not yet configured with environment variables in .env.local',
      };
    }

    try {
      // 1. Seed Materials
      for (const mat of INITIAL_MATERIALS) {
        const docRef = doc(db, 'materials', mat.id);
        await setDoc(docRef, mat);
      }

      // 2. Seed Machines
      for (const mach of INITIAL_MACHINES) {
        const docRef = doc(db, 'machines', mach.id);
        await setDoc(docRef, mach);
      }

      // 3. Seed Customers
      for (const cust of INITIAL_CUSTOMERS) {
        const docRef = doc(db, 'customers', cust.id);
        await setDoc(docRef, cust);
      }

      // 4. Seed Jobs
      for (const job of INITIAL_JOBS) {
        const docRef = doc(db, 'jobs', job.id);
        await setDoc(docRef, job);
      }

      // 5. Seed Payments
      for (const pay of INITIAL_PAYMENTS) {
        const docRef = doc(db, 'payments', pay.id);
        await setDoc(docRef, pay);
      }

      return {
        success: true,
        message: 'Successfully seeded Firestore with default manufacturing materials, CNC/3D printer machines, sample customers, and jobs!',
      };
    } catch (err: any) {
      console.error('Error seeding Firebase:', err);
      return {
        success: false,
        message: err.message || 'Failed to seed Firebase database',
      };
    }
  }

  static resetLocalStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('workshop_jobs_v1');
    localStorage.removeItem('workshop_customers_v1');
    localStorage.removeItem('workshop_materials_v1');
    localStorage.removeItem('workshop_machines_v1');
    localStorage.removeItem('workshop_payments_v1');
    localStorage.removeItem('workshop_expenses_v1');
    localStorage.removeItem('workshop_quotations_v1');
    localStorage.removeItem('workshop_products_v1');
    window.location.reload();
  }
}
