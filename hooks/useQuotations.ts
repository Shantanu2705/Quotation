"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { ServiceType } from './useEnquiries';

export type QuotationStatus = 'Draft' | 'Sent' | 'Confirmed' | 'Cancelled';
export type PaymentStatus = 'Payment Pending' | 'Advance Payment Confirmed' | 'Payment Confirmed' | 'Cancelled' | 'Refunded';

export interface Quotation {
  id: string;
  serialNumber: string;
  enquiryId: string;
  customerName: string;
  serviceType: ServiceType;
  price: number;
  status: QuotationStatus;
  paymentStatus?: PaymentStatus;
  createdAt: any;
}

// Global mock state to persist across client-side navigation
let globalMockData: Quotation[] = [
  { id: "q1", serialNumber: "DD-2026-1001", enquiryId: "2", customerName: "Jane Smith", serviceType: "SEO", price: 1500, status: "Draft", paymentStatus: "Payment Pending", createdAt: new Date() }
];

type Listener = (data: Quotation[]) => void;
const listeners = new Set<Listener>();
const notifyListeners = () => listeners.forEach(l => l(globalMockData));

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>(globalMockData);
  const [loading, setLoading] = useState(true);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setIsFirebaseEnabled(false);
      setLoading(false);
      
      const listener = (data: Quotation[]) => setQuotations([...data]);
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    }
    
    setIsFirebaseEnabled(true);
    try {
      const q = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Quotation[];
        setQuotations(data);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching quotations:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Failed to initialize Firebase listener:", e);
      setLoading(false);
    }
  }, []);

  const addQuotation = async (data: Omit<Quotation, 'id' | 'createdAt'>) => {
    if (isFirebaseEnabled) {
      await addDoc(collection(db, 'quotations'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } else {
      globalMockData = [{
        id: Math.random().toString(),
        ...data,
        createdAt: new Date()
      } as Quotation, ...globalMockData];
      notifyListeners();
    }
  };

  const updateQuotation = async (id: string, data: Partial<Omit<Quotation, 'id' | 'createdAt'>>) => {
    if (isFirebaseEnabled) {
      const docRef = doc(db, 'quotations', id);
      await updateDoc(docRef, data);
    } else {
      globalMockData = globalMockData.map(q => q.id === id ? { ...q, ...data } : q);
      notifyListeners();
    }
  };

  const deleteQuotation = async (id: string) => {
    if (isFirebaseEnabled) {
      // First, delete any associated invoices
      try {
        const invoicesQuery = query(collection(db, 'invoices'), where('quotationId', '==', id));
        const invoiceDocs = await getDocs(invoicesQuery);
        const deletePromises = invoiceDocs.docs.map(invoiceDoc => deleteDoc(doc(db, 'invoices', invoiceDoc.id)));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error("Failed to delete associated invoices:", err);
      }
      
      // Then delete the quotation itself
      await deleteDoc(doc(db, 'quotations', id));
    } else {
      globalMockData = globalMockData.filter(q => q.id !== id);
      notifyListeners();
    }
  };

  return { quotations, loading, addQuotation, updateQuotation, deleteQuotation, isFirebaseEnabled };
}
