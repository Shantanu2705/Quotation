"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Enquiry, useEnquiries } from "@/hooks/useEnquiries";
import { useQuotations } from "@/hooks/useQuotations";

import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

export function GenerateQuoteDialog({ enquiry }: { enquiry: Enquiry }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addQuotation } = useQuotations();
  const { updateEnquiry } = useEnquiries();
  const router = useRouter();

  const handleGenerate = async () => {
    setIsSubmitting(true);
    
    // Generate Serial Number: DD-YYYY-XXXX (where XXXX is random 1000-9999)
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const serialNumber = `DD-${year}-${randomNum}`;
    
    try {
      // 1. Create the Quotation with price 0
      const quoteId = await addQuotation({
        serialNumber,
        enquiryId: enquiry.id,
        customerName: enquiry.customerName,
        serviceType: enquiry.serviceType,
        price: 0,
        status: 'Draft',
      });
      
      // 2. Update Enquiry Status to 'quotation_sent'
      await updateEnquiry(enquiry.id, {
        status: 'quotation_sent'
      });
      
      // 3. Redirect to Quotations Edit page
      router.push(`/dashboard/quotations/${quoteId}`);
    } catch (error) {
      console.error("Failed to generate quote", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 gap-1 ml-2 text-primary border-primary/20 hover:bg-primary/10"
      onClick={handleGenerate}
      disabled={isSubmitting}
    >
      {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
      <span>{isSubmitting ? "Generating..." : "Quote"}</span>
    </Button>
  );
}
