"use client";

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export interface ServiceTemplate {
  id: string; // Service Type name (e.g., 'SEO', 'Website Development')
  servicePackage: string;
  projectDeliverables: string;
  importantNote: string;
  scheduleTimeFrame: string;
  projectPaymentTerms: string;
  sampleOrCaseStudies: string;
  termsAndConditions: string;
}

const defaultTemplates: ServiceTemplate[] = [
  {
    id: "Website Development",
    servicePackage: "HOME PAGE, ABOUT US, DESTINATION, TOUR PACKAGES, CLIENT TESTIMONIAL, TERMS AND CONDITIONS, ONLINE ENQUIRY, CONTACT US.\nCHAT INTEGRATION: WHATSAPP.\nINTEGRATED BACK-END SOFTWARE FOR: ADD, EDIT, DELETE TOUR PACKAGE, DESTINATION, CLIENT TESTIMONIAL, ONLINE ENQUIRY, CONTACT US.\n20 - 25 NOS. BASIC PAGES INCLUDE.",
    projectDeliverables: "INCLUDE SOCIAL MEDIA INTEGRATION:\nLINK WITH FACEBOOK PAGE.\nLINK WITH YOUTUBE CHANNEL.\nLINK WITH INSTAGRAM PAGE.",
    importantNote: "TECHNOLOGY USED CLIENTSIDE SCRIPTING : HTML, CSS\nTECHNOLOGY USED SERVER-SIDE SCRIPTING: PHP / NODEJS\nDATABASE SYSTEM USED IN PROJECT: MySQL / PostgreSQL",
    scheduleTimeFrame: "2 Week for concept development.",
    projectPaymentTerms: "PROJECT START WITH 50% ADVANCE & REST 50% PAYMENT ON DAY OF PROJECT LIVE.\nDOMAIN / HOSTING / SSL RENEWAL WITH 1 YEAR MAINTENANCE INCLUDING.",
    sampleOrCaseStudies: "",
    termsAndConditions: "THE INFORMATION PROVIDED AND MAY BE INAPPROPRIATE IF ADDITIONAL INFORMATION IS FORTHCOMING, OR SPECIFICATIONS CHANGE.\nDIGITAL DICTIONARY DOES NOT REMOVE THEIR CREATIVE DESIGN TAG FROM BOTTOM OF THE WEBSITE.\nIF CUSTOMERS HAND OVER THEIR CPANEL THEN WE ARE NOT RESPONSIBLE FOR THAT PARTICULAR PROJECT.\nAFTER HANDOVER CPANEL WE REQUEST TO TRANSFER THE WEBSITE TO THE CLIENTS OWN SERVER."
  },
  {
    id: "SEO",
    servicePackage: "KEYWORD RESEARCH – BEST 5 KEYWORDS FROM YOUR BUSINESS LOCATION\nOPTIMIZE THE TARGET PAGES WITH URL, TITLE, DESCRIPTION, IMAGE ETC.\nBUSINESS LISTINGS OPTIMIZATION FOR LOCAL LISTING.\nCREATE SITEMAP INTEGRATION AND ROBOTS.TXT FOR GOOGLE CRAWLING.\nONPAGE & OFF-PAGE OPTIMIZATION\nSEO AUDIT REPORT FOR THE WEBSITE\nSOCIAL SHARING WITH FACEBOOK, INSTAGRAM, YOUTUBE, X.",
    projectDeliverables: "MONTHLY GOOGLE MY BUSINESS POSTING: 2 NOS.\n1 REEL OR MICRO VIDEO PER MONTH.\nNOTE: SOCIAL MEDIA POST TOTAL: 6 NOS.",
    importantNote: "",
    scheduleTimeFrame: "12 Months for concept development.",
    projectPaymentTerms: "TOTAL PROJECT DURATION FOR GOOGLE FIRST PAGE RANK: 12 MONTHS.\nMINIMUM DURATION FOR KEYWORD VISIBILITY ON GOOGLE: 6 MONTHS.\nSEO PAYMENT ADVANCE PER MONTH.",
    sampleOrCaseStudies: "",
    termsAndConditions: "ADMINISTRATIVE/BACKEND ACCESS TO THE WEBSITE FOR ANALYSIS OF CONTENT AND STRUCTURE.\nUNLIMITED ACCESS TO EXISTING WEBSITE TRAFFIC STATISTICS FOR ANALYSIS AND TRACKING PURPOSES.\nALL FEES ARE NON-REFUNDABLE.\nALL FEES, SERVICES, DOCUMENTS, RECOMMENDATIONS, AND REPORTS ARE CONFIDENTIAL.\nDUE TO THE COMPETITIVENESS OF SOME KEYWORDS/PHRASES, ONGOING CHANGES IN SEARCH ENGINE RANKING ALGORITHMS, AND OTHER COMPETITIVE FACTORS, DIGITAL DICTIONARY DOES NOT GUARANTEE #1 POSITIONS."
  },
  {
    id: "Google Ads / Meta Ads",
    servicePackage: "ESTIMATED 1400-1500 CLICKS\nDELIVER IN 15 LOCATIONS.\nKEYWORD STRENGTH 30 NOS.\nINCREASE WEBSITE CLICKS.\nINCREASE BRAND IMPRESSIONS.\nINCREASE WEBSITE ENQUIRIES.\nINCREASE ADMISSION-RELATED QUERIES ON THE PHONE.\nTHIS ADVERTISEMENT ONLY RUNS ON GOOGLE AND THEIR PARTNER PLATFORM.",
    projectDeliverables: "GOOGLE MY BUSINESS PAGE MANAGEMENT.\nCONVERSION TREKKING CODE INSTALLED\nADS TOPICS ON GOOGLE: BUSINESS-RELATED ADS ONLY.\nMONTHLY ADVERTISEMENT REPORT SEND VIA MAIL (PDF FORMAT)",
    importantNote: "DELIVER ONLY 15 LOCATIONS (AS PRE-DISCUSSED).",
    scheduleTimeFrame: "1 Month for concept development and execution.",
    projectPaymentTerms: "GOOGLE AD PAYMENT ADVANCE PER MONTH.",
    sampleOrCaseStudies: "",
    termsAndConditions: "THE INFORMATION PROVIDED MAY BE INAPPROPRIATE IF ADDITIONAL INFORMATION IS FORTHCOMING, OR SPECIFICATIONS CHANGE.\nAUTHORISATION TO USE CLIENT PICTURES, LOGOS, TRADEMARKS, WEBSITE IMAGES, PAMPHLETS, CONTENT, ETC.\nADVERTISEMENT CAMPAIGN OR STRATEGY WILL NOT BE HANDED OVER TO THE CLIENTS.\nALL FEES ARE NON-REFUNDABLE.\nWE ARE NOT WORK ON 3RD SATURDAY AND SUNDAYS.\nALL FEES, SERVICES, DOCUMENTS, RECOMMENDATIONS, AND REPORTS ARE CONFIDENTIAL.\nDIGITAL DICTIONARY DOES NOT REMOVE THEIR DESIGN TAG FROM CREATIVE."
  },
  {
    id: "AI Leads",
    servicePackage: "AI LEAD GENERATION CAMPAIGN SETUP\nCUSTOMIZED TARGETING PARAMETERS",
    projectDeliverables: "WEEKLY LEAD REPORTS",
    importantNote: "LEADS QUALITY DEPENDS ON MARKET CONDITIONS",
    scheduleTimeFrame: "1 Month",
    projectPaymentTerms: "MONTHLY SUBSCRIPTION",
    sampleOrCaseStudies: "",
    termsAndConditions: "FEES ARE NON-REFUNDABLE"
  },
  {
    id: "Software Solutions",
    servicePackage: "CUSTOM SOFTWARE DEVELOPMENT\nREQUIREMENT GATHERING & ANALYSIS\nUI/UX DESIGN",
    projectDeliverables: "SOURCE CODE\nDEPLOYMENT MANUAL\nUSER TRAINING",
    importantNote: "HOSTING COST EXTRA",
    scheduleTimeFrame: "3-6 Months depending on complexity",
    projectPaymentTerms: "30% ADVANCE, 40% ON UAT, 30% ON DEPLOYMENT",
    sampleOrCaseStudies: "",
    termsAndConditions: "SOURCE CODE HANDOVER AFTER FINAL PAYMENT"
  },
  {
    id: "Digital Marketing",
    servicePackage: "COMPREHENSIVE DIGITAL MARKETING STRATEGY\nSOCIAL MEDIA MANAGEMENT\nEMAIL MARKETING CAMPAIGNS",
    projectDeliverables: "MONTHLY PERFORMANCE REPORTS",
    importantNote: "AD SPEND NOT INCLUDED IN AGENCY FEE",
    scheduleTimeFrame: "Minimum 3 Months commitment",
    projectPaymentTerms: "MONTHLY IN ADVANCE",
    sampleOrCaseStudies: "",
    termsAndConditions: "STRATEGY REMAINS DIGITAL DICTIONARY PROPERTY UNTIL PAYMENT COMPLETED"
  }
];

let globalMockData = [...defaultTemplates];

type Listener = (data: ServiceTemplate[]) => void;
const listeners = new Set<Listener>();
const notifyListeners = () => listeners.forEach(l => l(globalMockData));

export function useTemplates() {
  const [templates, setTemplates] = useState<ServiceTemplate[]>(globalMockData);
  const [loading, setLoading] = useState(true);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setIsFirebaseEnabled(false);
      setLoading(false);
      const listener = (data: ServiceTemplate[]) => setTemplates([...data]);
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    }

    setIsFirebaseEnabled(true);
    try {
      const q = query(collection(db, 'serviceTemplates'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ServiceTemplate[];
        
        // Merge with defaults for missing services
        const mergedData = defaultTemplates.map(defaultTpl => {
          const found = data.find(d => d.id === defaultTpl.id);
          return found ? { ...defaultTpl, ...found } : defaultTpl;
        });
        
        // Add any custom ones
        const customData = data.filter(d => !defaultTemplates.some(dt => dt.id === d.id));
        
        setTemplates([...mergedData, ...customData]);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching templates:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Failed to initialize Firebase listener:", e);
      setLoading(false);
    }
  }, []);

  const updateTemplate = async (id: string, data: Partial<Omit<ServiceTemplate, 'id'>>) => {
    if (isFirebaseEnabled) {
      const docRef = doc(db, 'serviceTemplates', id);
      await setDoc(docRef, data, { merge: true });
    } else {
      const existing = globalMockData.find(t => t.id === id);
      if (existing) {
        globalMockData = globalMockData.map(t => t.id === id ? { ...t, ...data } : t);
      } else {
        globalMockData = [...globalMockData, { id, ...data } as ServiceTemplate];
      }
      notifyListeners();
    }
  };

  return { templates, loading, updateTemplate, isFirebaseEnabled };
}
