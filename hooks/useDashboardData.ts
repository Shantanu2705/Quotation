"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export type EnquiryStatus = 'pending' | 'confirmed' | 'cancelled';
export type ClientType = 'corporate' | 'tourist';

export interface Enquiry {
  id: string;
  customerName: string;
  clientType: ClientType;
  status: EnquiryStatus;
  createdAt: any;
  email: string;
  destination: string;
}

// Initial mock data to show the layout before the user adds any
const initialMockData: Enquiry[] = [
  { id: "1", customerName: "Acme Corp", clientType: "corporate", status: "confirmed", email: "contact@acme.com", destination: "New York", createdAt: new Date() },
  { id: "2", customerName: "Jane Smith", clientType: "tourist", status: "pending", email: "jane@smith.com", destination: "Paris", createdAt: new Date() },
  { id: "3", customerName: "TechNova Inc", clientType: "corporate", status: "pending", email: "info@technova.com", destination: "Tokyo", createdAt: new Date() }
];

export function useDashboardData() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialMockData);
  const [loading, setLoading] = useState(true);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);

  useEffect(() => {
    // Graceful fallback if Firebase variables are missing in .env
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn("Firebase config missing. Using local mock data. Please configure your .env file.");
      setIsFirebaseEnabled(false);
      setLoading(false);
      return;
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
    confirmedBookings: enquiries.filter(e => e.status === 'confirmed').length,
    pendingBookings: enquiries.filter(e => e.status === 'pending').length,
    corporateClients: enquiries.filter(e => e.clientType === 'corporate').length,
    touristClients: enquiries.filter(e => e.clientType === 'tourist').length,
  };

  const recentEnquiries = enquiries.slice(0, 5);

  const addMockEnquiry = async () => {
    const isCorporate = Math.random() > 0.5;
    const mockEnquiry = {
      customerName: isCorporate ? "Enterprise " + Math.floor(Math.random() * 1000) : "Tourist " + Math.floor(Math.random() * 1000),
      clientType: (isCorporate ? 'corporate' : 'tourist') as ClientType,
      status: (Math.random() > 0.5 ? 'pending' : 'confirmed') as EnquiryStatus,
      email: "test@example.com",
      destination: "Dubai"
    };

    if (isFirebaseEnabled) {
      await addDoc(collection(db, 'enquiries'), {
        ...mockEnquiry,
        createdAt: serverTimestamp()
      });
    } else {
      // Local fallback for UI testing without Firebase
      setEnquiries(prev => [{
        id: Math.random().toString(),
        ...mockEnquiry,
        createdAt: new Date()
      } as Enquiry, ...prev]);
    }
  };

  return { stats, recentEnquiries, loading, addMockEnquiry, isFirebaseEnabled };
}
