import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, logFirestoreError } from '../firebase';

/**
 * Save or update a record in any Firestore collection/table
 */
export async function saveRecord(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    logFirestoreError('saveRecord', `${collectionName}/${docId}`, error);
    throw error;
  }
}

/**
 * Retrieve a specific record from any Firestore collection/table
 */
export async function getRecord<T = unknown>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
  } catch (error) {
    logFirestoreError('getRecord', `${collectionName}/${docId}`, error);
    throw error;
  }
}

/**
 * Retrieve all records from any Firestore collection/table
 */
export async function getAllRecords<T = unknown>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const results: T[] = [];
    snap.forEach((d) => {
      results.push({ id: d.id, ...d.data() } as T);
    });
    return results;
  } catch (error) {
    logFirestoreError('getAllRecords', collectionName, error);
    throw error;
  }
}

/**
 * Delete a record from any Firestore collection/table
 */
export async function deleteRecord(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    logFirestoreError('deleteRecord', `${collectionName}/${docId}`, error);
    throw error;
  }
}

/**
 * Real-time listener for any Firestore collection/table
 */
export function subscribeToCollection<T = unknown>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: T[] = [];
      snapshot.forEach((d) => {
        records.push({ id: d.id, ...d.data() } as T);
      });
      onUpdate(records);
    },
    (error) => {
      logFirestoreError('subscribeToCollection', collectionName, error);
      if (onError) onError(error);
    }
  );
}
