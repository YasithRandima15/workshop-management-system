import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, withTimeout } from '@/lib/firebase/config';
import { Machine, CreateMachineInput, MachineStatus } from '@/types/machine';
import { INITIAL_MACHINES } from './mockData';

const LOCAL_STORAGE_KEY = 'workshop_machines_v1';

function getLocalMachines(): Machine[] {
  if (typeof window === 'undefined') return INITIAL_MACHINES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MACHINES));
      return INITIAL_MACHINES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MACHINES;
  }
}

function saveLocalMachines(machines: Machine[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(machines));
  } catch (err) {
    console.error('Failed to save local machines', err);
  }
}

export class MachinesService {
  static async listMachines(): Promise<Machine[]> {
    if (!isFirebaseConfigured()) {
      return getLocalMachines();
    }

    try {
      const snap = await withTimeout(getDocs(collection(db, 'machines')));
      const machines: Machine[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Machine));
      if (machines.length === 0) {
        return getLocalMachines();
      }
      return machines;
    } catch (err) {
      console.warn('Firestore listMachines error:', err);
      return getLocalMachines();
    }
  }

  static async updateMachineStatus(
    id: string,
    status: MachineStatus,
    currentJobId?: string | null,
    currentJobTitle?: string | null
  ): Promise<Machine> {
    const all = await this.listMachines();
    const target = all.find((m) => m.id === id);
    if (!target) throw new Error('Machine not found');

    const now = new Date().toISOString();
    const updatedPayload = {
      status,
      currentJobId: currentJobId !== undefined ? currentJobId : target.currentJobId,
      currentJobTitle: currentJobTitle !== undefined ? currentJobTitle : target.currentJobTitle,
      updatedAt: now,
    };

    const updated: Machine = {
      ...target,
      ...updatedPayload,
    };

    if (isFirebaseConfigured()) {
      try {
        await withTimeout(updateDoc(doc(db, 'machines', id), updatedPayload));
      } catch (err) {
        console.error('Firestore updateMachineStatus error:', err);
      }
    }

    const local = getLocalMachines();
    const idx = local.findIndex((m) => m.id === id);
    if (idx !== -1) {
      local[idx] = updated;
      saveLocalMachines(local);
    }

    return updated;
  }

  static async createMachine(input: CreateMachineInput): Promise<Machine> {
    const now = new Date().toISOString();
    const data: Omit<Machine, 'id'> = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await withTimeout(addDoc(collection(db, 'machines'), data));
        return { id: docRef.id, ...data };
      } catch (err) {
        console.error('Firestore createMachine error:', err);
      }
    }

    const created: Machine = { id: `mach-${Date.now()}`, ...data };
    saveLocalMachines([...getLocalMachines(), created]);
    return created;
  }

  static async deleteMachine(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        await withTimeout(deleteDoc(doc(db, 'machines', id)));
      } catch (err) {
        console.error('Firestore deleteMachine error:', err);
      }
    }
    const local = getLocalMachines().filter((m) => m.id !== id);
    saveLocalMachines(local);
  }
}
