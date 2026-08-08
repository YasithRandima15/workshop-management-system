import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export async function uploadFileToStorage(
  file: File,
  folder: 'receipts' | 'cad-models' | 'quotations' | 'machines'
): Promise<string> {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase Storage not configured. Creating temporary local Object URL for demo.');
    return URL.createObjectURL(file);
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `${folder}/${timestamp}_${sanitizedName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw new Error('Failed to upload file to storage. Please try again.');
  }
}
