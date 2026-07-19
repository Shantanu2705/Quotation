"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export type EnquiryStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'quotation_sent';
export type ServiceType = 'SEO' | 'Website Development' | 'AI Leads' | 'Software Solutions' | 'Google Ads / Meta Ads' | 'Digital Marketing';

export interface Enquiry {
  id: string;
  customerName: string;
  serviceType: ServiceType;
  status: EnquiryStatus;
  createdAt: any;
  email: string;
  mobileNumber: string;
  requirements: string;
}

// Global mock state to persist across client-side navigation
let globalMockData: Enquiry[] = [
  { id: "1", customerName: "Acme Corp", serviceType: "Website Development", status: "in_progress", email: "contact@acme.com", mobileNumber: "+1 234 567 8900", requirements: "Need a new e-commerce platform.", createdAt: new Date() },
  { id: "2", customerName: "Jane Smith", serviceType: "SEO", status: "pending", email: "jane@smith.com", mobileNumber: "+1 987 654 3210", requirements: "Improve local search rankings.", createdAt: new Date() },
  { id: "3", customerName: "TechNova Inc", serviceType: "Software Solutions", status: "pending", email: "info@technova.com", mobileNumber: "+1 555 123 4567", requirements: "Custom CRM development.", createdAt: new Date() }
];

// Simple listener system for mock data
type Listener = (data: Enquiry[]) => void;
const listeners = new Set<Listener>();
const notifyListeners = () => listeners.forEach(l => l(globalMockData));

export function useEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(globalMockData);
  const [loading, setLoading] = useState(true);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setIsFirebaseEnabled(false);
      setLoading(false);
      
      // Subscribe to mock data changes
      const listener = (data: Enquiry[]) => setEnquiries([...data]);
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    }
    
    setIsFirebaseEnabled(true);
    try {
      const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Enquiry[];
        setEnquiries(data);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching enquiries:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Failed to initialize Firebase listener:", e);
      setLoading(false);
    }
  }, []);

  const stats = {
    totalEnquiries: enquiries.length,
    pendingProposals: enquiries.filter(e => e.status === 'pending').length,
    activeProjects: enquiries.filter(e => e.status === 'in_progress').length,
    webAndSoftware: enquiries.filter(e => ['Website Development', 'Software Solutions'].includes(e.serviceType)).length,
    marketingLeads: enquiries.filter(e => ['SEO', 'Google Ads / Meta Ads', 'Digital Marketing', 'AI Leads'].includes(e.serviceType)).length,
  };

  const addEnquiry = async (data: Omit<Enquiry, 'id' | 'createdAt'>) => {
    if (isFirebaseEnabled) {
      await addDoc(collection(db, 'enquiries'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } else {
      globalMockData = [{
        id: Math.random().toString(),
        ...data,
        createdAt: new Date()
      } as Enquiry, ...globalMockData];
      notifyListeners();
    }
  };

  const updateEnquiry = async (id: string, data: Partial<Omit<Enquiry, 'id' | 'createdAt'>>) => {
    if (isFirebaseEnabled) {
      const docRef = doc(db, 'enquiries', id);
      await updateDoc(docRef, data);
    } else {
      globalMockData = globalMockData.map(e => e.id === id ? { ...e, ...data } : e);
      notifyListeners();
    }
  };
  const deleteEnquiry = async (id: string) => {
    if (isFirebaseEnabled) {
      await deleteDoc(doc(db, 'enquiries', id));
    } else {
      globalMockData = globalMockData.filter(e => e.id !== id);
      notifyListeners();
    }
  };

  return { enquiries, stats, loading, addEnquiry, updateEnquiry, deleteEnquiry, isFirebaseEnabled };
}
