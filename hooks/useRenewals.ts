"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

export type RenewalStatus = "Pending Renewal" | "Renewed" | "Overdue" | "Cancelled";

export interface RenewalItem {
  id: string;
  title: string;
  description: string;
  amount: number;
}

export interface RenewalNotice {
  id: string;
  noticeNumber: string;
  noticeDate: string;
  status: RenewalStatus;

  // Account Summary
  serviceCycle: string;
  renewalDue: string;

  // Prepared For
  clientName: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  clientEmail?: string;
  clientPhone?: string;

  // Greeting & Message
  salutation: string;
  messageText: string;

  // Items & Pricing
  items: RenewalItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  // Support & Signoff
  paymentTerms: string;
  signatoryName: string;
  signatoryDesignation: string;
  footerNote: string;

  quotationId?: string;
  createdAt: any;
}

// Initial pre-seeded mock data based on the sample PDF
let globalMockRenewals: RenewalNotice[] = [
  {
    id: "sample-renewal-1",
    noticeNumber: "RN-2026-001",
    noticeDate: "Sept24, 2026",
    status: "Pending Renewal",
    serviceCycle: "2026 - 2027",
    renewalDue: "Immediate",
    clientName: "Mr. Harprit Singh",
    companyName: "Take A Trip Make Memories",
    addressLine1: "Udham Singh Sarani,",
    addressLine2: "Siliguri, West Bengal",
    clientEmail: "harprit@takeatrip.com",
    clientPhone: "+91 98320 00000",
    salutation: "Dear Mr. Harprit Singh,",
    messageText:
      "We hope your business is thriving. This is a friendly reminder that your comprehensiv Domestic (SEO),Primium (SEO) and Digital Marketing services with Digital Dictionary are up for their annual renewal. To ensure continuous growth, search rankings stability, and uninterrupted campaign management for Take A Trip Make Memories, please review the renewal breakdown summarized below.",
    items: [
      {
        id: "item-1",
        title: "Domestic (SEO),Primium(SEO) & Digital Marketing Services",
        description:
          "Renewal of annual contract including Core Keyword Optimization, SEO management, Google Business Profile enhancement, link building strategy, and monthly performance insights.",
        amount: 40000,
      },
    ],
    subtotal: 40000,
    taxAmount: 0,
    totalAmount: 40000,
    paymentTerms:
      "Please process the renewal payment to avoid any break in your ongoing advertising campaigns or organic visibility ranking efforts. If you have any modifications to request or require specific invoice formatting for your accounts, feel free to reply directly to this notice.",
    signatoryName: "Arick Biswas",
    signatoryDesignation: "Founder & CEO, Digital Dictionary",
    footerNote:
      "Thank you for choosing Digital Dictionary to scale your digital presence. We value your partnership.",
    createdAt: new Date("2026-09-24T10:00:00Z"),
  },
];

type Listener = (data: RenewalNotice[]) => void;
const listeners = new Set<Listener>();
const notifyListeners = () => listeners.forEach((l) => l(globalMockRenewals));

export function useRenewals() {
  const [renewals, setRenewals] = useState<RenewalNotice[]>(globalMockRenewals);
  const [loading, setLoading] = useState(true);
  const isFirebaseEnabled = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setLoading(false);
      const listener = (data: RenewalNotice[]) => setRenewals([...data]);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }

    try {
      const q = query(collection(db, "renewals"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty && globalMockRenewals.length > 0) {
            // If collection is empty, display the local sample
            setRenewals(globalMockRenewals);
          } else {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as RenewalNotice[];
            setRenewals(data);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching renewals:", error);
          setRenewals(globalMockRenewals);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error("Failed to initialize Firebase listener for renewals:", e);
      setRenewals(globalMockRenewals);
      setLoading(false);
    }
  }, [isFirebaseEnabled]);

  const addRenewal = async (
    data: Omit<RenewalNotice, "id" | "createdAt">
  ) => {
    if (isFirebaseEnabled) {
      const docRef = await addDoc(collection(db, "renewals"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } else {
      const newRenewal: RenewalNotice = {
        id: `renewal-${Date.now()}`,
        ...data,
        createdAt: new Date(),
      };
      globalMockRenewals = [newRenewal, ...globalMockRenewals];
      notifyListeners();
      return newRenewal.id;
    }
  };

  const updateRenewal = async (
    id: string,
    data: Partial<Omit<RenewalNotice, "id" | "createdAt">>
  ) => {
    if (isFirebaseEnabled) {
      const docRef = doc(db, "renewals", id);
      await updateDoc(docRef, data);
    } else {
      globalMockRenewals = globalMockRenewals.map((r) =>
        r.id === id ? { ...r, ...data } : r
      );
      notifyListeners();
    }
  };

  const deleteRenewal = async (id: string) => {
    if (isFirebaseEnabled) {
      await deleteDoc(doc(db, "renewals", id));
    } else {
      globalMockRenewals = globalMockRenewals.filter((r) => r.id !== id);
      notifyListeners();
    }
  };

  return {
    renewals,
    loading,
    addRenewal,
    updateRenewal,
    deleteRenewal,
    isFirebaseEnabled,
  };
}
