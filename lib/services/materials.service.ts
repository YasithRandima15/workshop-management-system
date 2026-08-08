import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Material, CreateMaterialInput } from '@/types/material';
import { INITIAL_MATERIALS } from './mockData';

const LOCAL_STORAGE_KEY = 'workshop_materials_v1';

function getLocalMaterials(): Material[] {
  if (typeof window === 'undefined') return INITIAL_MATERIALS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MATERIALS));
      return INITIAL_MATERIALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MATERIALS;
  }
}

function saveLocalMaterials(mats: Material[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mats));
  } catch (err) {
    console.error('Failed to save local materials', err);
  }
}

export class MaterialsService {
  static async listMaterials(includeArchived = false): Promise<Material[]> {
    if (!isFirebaseConfigured()) {
      const all = getLocalMaterials();
      return includeArchived ? all : all.filter((m) => !m.archivedAt);
    }

    try {
      const snap = await getDocs(collection(db, 'materials'));
      const mats: Material[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Material));
      if (mats.length === 0) {
        return getLocalMaterials().filter((m) => includeArchived || !m.archivedAt);
      }
      return includeArchived ? mats : mats.filter((m) => !m.archivedAt);
    } catch (err) {
      console.warn('Firestore listMaterials error:', err);
      const all = getLocalMaterials();
      return includeArchived ? all : all.filter((m) => !m.archivedAt);
    }
  }

  static async getLowStockMaterials(): Promise<Material[]> {
    const all = await this.listMaterials();
    return all.filter((m) => m.currentStockQuantity <= m.minStockThreshold);
  }

  static async createMaterial(input: CreateMaterialInput): Promise<Material> {
    const now = new Date().toISOString();
    const data: Omit<Material, 'id'> = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await addDoc(collection(db, 'materials'), data);
        return { id: docRef.id, ...data };
      } catch (err) {
        console.error('Firestore createMaterial error:', err);
      }
    }

    const created: Material = { id: `mat-${Date.now()}`, ...data };
    saveLocalMaterials([created, ...getLocalMaterials()]);
    return created;
  }

  static async updateStock(id: string, deltaQuantity: number): Promise<Material> {
    const all = await this.listMaterials(true);
    const target = all.find((m) => m.id === id);
    if (!target) throw new Error('Material not found');

    const newQty = Math.max(0, target.currentStockQuantity + deltaQuantity);
    const now = new Date().toISOString();
    const updated: Material = {
      ...target,
      currentStockQuantity: newQty,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'materials', id), {
          currentStockQuantity: newQty,
          updatedAt: now,
        });
      } catch (err) {
        console.error('Firestore updateStock error:', err);
      }
    }

    const local = getLocalMaterials();
    const idx = local.findIndex((m) => m.id === id);
    if (idx !== -1) {
      local[idx] = updated;
      saveLocalMaterials(local);
    }

    return updated;
  }
}
