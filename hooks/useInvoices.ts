"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export type InvoiceType = 'Advance Receipt' | 'GST Invoice';
export type InvoiceStatus = 'Paid' | 'Pending';

export interface Invoice {
  id: string;
  quotationId: string | null; // null if blank invoice
  invoiceNumber: string;
  type: InvoiceType;
  amount: number;
  percentage: number; // 0-100
  status: InvoiceStatus;
  customerName?: string;
  createdAt: any;
}

let globalMockData: Invoice[] = [];

type Listener = (data: Invoice[]) => void;
const listeners = new Set<Listener>();
const notifyListeners = () => listeners.forEach(l => l(globalMockData));

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(globalMockData);
  const [loading, setLoading] = useState(true);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setIsFirebaseEnabled(false);
      setLoading(false);
      
      const listener = (data: Invoice[]) => setInvoices([...data]);
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    }
    
    setIsFirebaseEnabled(true);
    try {
      const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invoice[];
        setInvoices(data);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching invoices:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Failed to initialize Firebase listener:", e);
      setLoading(false);
    }
  }, []);

  const addInvoice = async (data: Omit<Invoice, 'id' | 'createdAt'>) => {
    if (isFirebaseEnabled) {
      await addDoc(collection(db, 'invoices'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } else {
      globalMockData = [{
        id: Math.random().toString(),
        ...data,
        createdAt: new Date()
      } as Invoice, ...globalMockData];
      notifyListeners();
    }
  };

  const updateInvoice = async (id: string, data: Partial<Omit<Invoice, 'id' | 'createdAt'>>) => {
    if (isFirebaseEnabled) {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, data);
    } else {
      globalMockData = globalMockData.map(i => i.id === id ? { ...i, ...data } : i);
      notifyListeners();
    }
  };

  const deleteInvoice = async (id: string) => {
    if (isFirebaseEnabled) {
      await deleteDoc(doc(db, 'invoices', id));
    } else {
      globalMockData = globalMockData.filter(i => i.id !== id);
      notifyListeners();
    }
  };

  return { invoices, loading, addInvoice, updateInvoice, deleteInvoice, isFirebaseEnabled };
}
