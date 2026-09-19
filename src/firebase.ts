import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyCiBJpNEOoT4EOD7doU2uL1btCeU9fGIrY',
  authDomain: 'intrest-calculator-a7e4a.firebaseapp.com',
  projectId: 'intrest-calculator-a7e4a',
  storageBucket: 'intrest-calculator-a7e4a.firebasestorage.app',
  messagingSenderId: '684680489842',
  appId: '1:684680489842:web:0ed87a0c56ecd1b5a84beb',
};

// Initialize Firebase App & Firestore Database without authentication
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

// Export standard firestore utilities for future custom table integrations
export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
};

// Error logging helper
export function logFirestoreError(operation: string, collectionPath: string, error: unknown): void {
  console.error(`[Firebase Database Error] ${operation} on ${collectionPath}:`, error);
}
