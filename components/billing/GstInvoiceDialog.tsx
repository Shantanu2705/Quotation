"use client";

import { useState, useRef, useEffect } from "react";
import { Quotation, useQuotations } from "@/hooks/useQuotations";
import { useInvoices } from "@/hooks/useInvoices";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface GstInvoiceDialogProps {
  quotation: Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GstInvoiceDialog({ quotation, open, onOpenChange }: GstInvoiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const { addInvoice } = useInvoices();
  const { updateQuotation } = useQuotations();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setInvoiceNumber(`GST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [open]);

  if (!quotation) return null;

  const handleGenerate = async () => {
    if (!printRef.current) return;

    setIsSubmitting(true);
    try {
      
      await addInvoice({
        quotationId: quotation.id,
        invoiceNumber,
        type: 'GST Invoice',
        amount: quotation.price, // Full amount for GST invoice usually
        percentage: 100,
        status: 'Pending',
        customerName: quotation.customerName
      });

      // Update the quotation's payment status to indicate invoice generated if needed
      await updateQuotation(quotation.id, {
        paymentStatus: 'Payment Confirmed'
      });

      // Generate and download PDF
      const element = printRef.current;
      element.style.display = "block";
      
      // Force exact dimensions for A4 at 96dpi (794px width)
      const originalPosition = element.style.position;
      const originalLeft = element.style.left;
      const originalTop = element.style.top;
      const originalWidth = element.style.width;
      
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "0";
      element.style.width = "794px";
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        windowWidth: 794,
      });
      
      element.style.position = originalPosition;
      element.style.left = originalLeft;
      element.style.top = originalTop;
      element.style.width = originalWidth;
      element.style.display = "none";
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
      
      toast.success("GST Invoice generated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate GST Invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate GST Invoice</DialogTitle>
            <DialogDescription>
              Create a final GST Invoice for {quotation.customerName}'s confirmed quotation ({quotation.serialNumber}).
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Total Invoice Amount</p>
              <p className="text-3xl font-bold">₹{quotation.price.toLocaleString("en-IN")}</p>
            </div>
            
            <div className="w-full bg-muted/50 p-4 rounded-lg text-sm space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{quotation.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="font-medium">{quotation.paymentStatus || 'Payment Pending'}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden A4 Template for PDF Generation */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div 
          className="relative"
          style={{ width: "794px", minHeight: "1123px", padding: "40px", backgroundColor: "#ffffff", color: "#000000", fontFamily: "sans-serif", border: "15px solid #DAA520", boxSizing: "border-box" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 0, opacity: 0.1, pointerEvents: "none" }}>
            <img src="/watermark.png" alt="watermark" style={{ width: "80%", height: "auto", filter: "grayscale(100%)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6" style={{ borderBottom: "2px solid #DAA520" }}>
            <div className="flex items-center gap-4">
              <img src="/logo.png?v=3" alt="Digital Dictionary Logo" style={{ maxHeight: "120px", objectFit: "contain" }} />
            </div>
            <div className="text-right text-sm" style={{ color: "#334155" }}>
              <p className="font-black mb-1" style={{ fontSize: "24px", color: "#1e293b", letterSpacing: "1px" }}>📱 +91 6291111428</p>
              <p className="mb-1">📧 info@digitaldictionary.com</p>
              <p>🌐 www.digitaldictionary.com</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex justify-between items-center mb-8 font-bold text-sm" style={{ color: "#DAA520" }}>
            <div>
              <p className="mb-1">INVOICE NO : {invoiceNumber}</p>
              <p>QUOTATION ID : {quotation.serialNumber}</p>
            </div>
            <span>Date : {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          </div>
          
          {/* Customer */}
          <div className="mb-12">
            <h3 className="text-sm mb-1 uppercase tracking-wider" style={{ color: "#1e293b" }}>BILLED TO :</h3>
            <p className="text-lg font-bold uppercase m-0" style={{ color: "#d97706" }}>{quotation.customerName}</p>
          </div>
          
          <table className="w-full text-left border-collapse mb-12">
            <thead>
              <tr>
                <th className="py-3 px-4 font-bold w-3/4" style={{ color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Description</th>
                <th className="py-3 px-4 font-bold text-right" style={{ color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>Final Payment for {quotation.serviceType}</td>
                <td className="py-4 px-4 text-right font-medium" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>
                  ₹{quotation.price.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Spacer to push footer down */}
          <div style={{ flexGrow: 1 }}></div>

          {/* Footer content - Amount and Sign */}
          <div className="flex justify-between items-end mt-12 mb-8 pt-8" style={{ borderTop: "1px solid #e2e8f0" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: "#000000" }}>Total Amount:</span>
              <span className="text-2xl font-black" style={{ color: "#000000" }}>₹ {quotation.price.toLocaleString("en-IN")}/-</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm m-0" style={{ color: "#000000" }}>For Digital Dictionary</p>
              <p className="text-xs m-0" style={{ color: "#000000" }}>with date & stamp</p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="text-center text-xs mt-auto pt-4" style={{ color: "#DAA520", borderTop: "1px solid #fce7f3", borderColor: "#fde68a" }}>
            📍 Neelkamal Shopping Plaza, D.L.Roy Sarani, Ward 6, Siliguri, West Bengal, Pin: 734001
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
