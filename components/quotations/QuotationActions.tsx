"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, MessageCircle, Mail, ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import { Quotation } from "@/hooks/useQuotations";
import { Enquiry } from "@/hooks/useEnquiries";

interface QuotationActionsProps {
  quotation: Quotation;
  enquiry: Enquiry;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export function QuotationActions({ quotation, enquiry, onDownloadPdf, isGeneratingPdf }: QuotationActionsProps) {
  
  const handleWhatsApp = () => {
    const phoneNumber = "+916291111428";
    const text = encodeURIComponent(
      `Hello! I'm sending you the quotation (${quotation.serialNumber}) for the ${quotation.serviceType} services requested by ${quotation.customerName}. The total amount is ₹${quotation.price.toLocaleString("en-IN")}.`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  const handleEmail = () => {
    const email = enquiry.email || "";
    const subject = encodeURIComponent(`Quotation ${quotation.serialNumber} - ${quotation.serviceType}`);
    const body = encodeURIComponent(
      `Dear ${quotation.customerName},\n\nPlease find attached the quotation details for the ${quotation.serviceType} services.\n\nQuotation #: ${quotation.serialNumber}\nTotal Amount: ₹${quotation.price.toLocaleString("en-IN")}\n\nThank you!`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border-b border-border p-4 sticky top-0 z-10 print:hidden">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quotations">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Quotations
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 gap-2 bg-background" onClick={handleWhatsApp}>
          <MessageCircle className="h-4 w-4 text-green-500" />
          WhatsApp
        </Button>
        
        <Button variant="outline" size="sm" className="h-9 gap-2 bg-background" onClick={handleEmail}>
          <Mail className="h-4 w-4 text-blue-500" />
          Email
        </Button>
        
        <Button variant="outline" size="sm" className="h-9 gap-2 bg-background" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        
        <Button 
          className="h-9 gap-2 bg-amber-500 hover:bg-amber-600 text-white border-none" 
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
        >
          <Download className="h-4 w-4" />
          {isGeneratingPdf ? "Generating..." : "Download PDF"}
        </Button>
      </div>
    </div>
  );
}
