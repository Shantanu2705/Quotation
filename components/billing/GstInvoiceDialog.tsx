"use client";

import { useState, useRef, useEffect } from "react";
import { Quotation, useQuotations } from "@/hooks/useQuotations";
import { useInvoices } from "@/hooks/useInvoices";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle } from "lucide-react";
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
  const { addInvoice, invoices } = useInvoices();
  const { updateQuotation } = useQuotations();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setInvoiceNumber(`GST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [open]);

  if (!quotation) return null;

  const advanceInvoices = invoices.filter(i => i.quotationId === quotation.id && i.type === 'Advance Receipt');
  const totalAdvancePaid = advanceInvoices.reduce((sum, inv) => sum + inv.amount, 0);

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

  const headingStyle = {
    color: "#C5A059",
    fontWeight: "900",
    letterSpacing: "1.5px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
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
          style={{ width: "794px", minHeight: "1123px", padding: "40px", backgroundColor: "#ffffff", color: "#1e3a8a", fontFamily: "sans-serif", border: "15px solid #DAA520", boxSizing: "border-box" }}
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
            <div className="text-right text-sm flex flex-col items-end" style={{ color: "#1e3a8a" }}>
              <div className="flex flex-col items-end mb-2">
                <p className="font-black m-0 leading-tight" style={{ fontSize: "24px", color: "#1e3a8a", letterSpacing: "1px" }}>
                  📱 +91 6291111428
                </p>
                <p className="font-bold m-0 mt-1" style={{ fontSize: "15px", color: "#1e3a8a", letterSpacing: "0.5px" }}>
                  ☎️ +91 6297868104 (Office)
                </p>
              </div>
              <p className="mb-1 font-medium">📧 admin07digitaldictionary@gmail.com</p>
              <p className="mb-1 font-medium">🌐 www.digitaldictionary.in</p>
              <p className="m-0 font-medium" style={{ color: "#1e3a8a" }}>📍 Neelkamal Shopping Plaza, D.L.Roy Sarani, Ward 6, Siliguri, WB 734001</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex justify-between items-center mb-8 font-bold text-sm" style={{ color: "#C5A059" }}>
            <div>
              <p className="mb-1">INVOICE NO : {invoiceNumber}</p>
              <p>QUOTATION ID : {quotation.serialNumber}</p>
            </div>
            <span>Date : {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          </div>
          
          {/* Customer */}
          <div className="mb-12">
            <h3 className="text-sm mb-3 uppercase tracking-wider" style={headingStyle}>
              <UserCircle size={18} /> BILLED TO
            </h3>
            <p className="text-lg font-bold uppercase m-0" style={{ color: "#d97706" }}>{quotation.customerName}</p>
          </div>
          
          <table className="w-full text-left border-collapse mb-12">
            <thead>
              <tr>
                <th className="py-3 px-4 font-bold w-3/4" style={{ color: "#1e3a8a", borderBottom: "2px solid #b8860b" }}>Description</th>
                <th className="py-3 px-4 font-bold text-right" style={{ color: "#1e3a8a", borderBottom: "2px solid #b8860b" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4" style={{ color: "#1e3a8a", borderBottom: "1px solid #b8860b" }}>Final Payment for {quotation.serviceType}</td>
                <td className="py-4 px-4 text-right font-medium" style={{ color: "#1e3a8a", borderBottom: "1px solid #b8860b" }}>
                  ₹{quotation.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              {totalAdvancePaid > 0 && (
                <tr>
                  <td className="py-4 px-4" style={{ color: "#1e3a8a", borderBottom: "1px solid #b8860b" }}>Advance Payment Received</td>
                  <td className="py-4 px-4 text-right font-medium" style={{ color: "#1e3a8a", borderBottom: "1px solid #b8860b" }}>
                    - ₹{totalAdvancePaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Spacer to push footer down */}
          <div style={{ flexGrow: 1 }}></div>

          {/* Footer content - Amount and Sign */}
          <div className="flex justify-between items-end mt-12 mb-8 pt-8" style={{ borderTop: "1px solid #b8860b" }}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: "#1e3a8a" }}>Total Amount:</span>
                  <span className="text-2xl font-black" style={{ color: "#1e3a8a" }}>₹ {quotation.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/-</span>
                </div>
                {totalAdvancePaid > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold" style={{ color: "#1e3a8a" }}>Balance Due:</span>
                    <span className="text-2xl font-black" style={{ color: "#1e3a8a" }}>₹ {(quotation.price - totalAdvancePaid).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/-</span>
                  </div>
                )}
              </div>
              <div className="text-sm p-3" style={{ color: "#1e3a8a", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <p className="font-bold mb-1" style={{ color: "#d97706" }}>Bank Details:</p>
                <p className="m-0 font-bold">Digital Dictionary</p>
                <p className="m-0">Axis Bank Bagdogra Branch</p>
                <p className="m-0">Account No: <span className="font-bold">926020029844176</span></p>
                <p className="m-0">IFSC Code: <span className="font-bold">UTIB0005857</span></p>
              </div>
            </div>
            <div className="text-center flex flex-col items-center">
              <img src="/stamp.png" crossOrigin="anonymous" alt="Digital Dictionary Stamp" style={{ width: "160px", height: "auto", transform: "rotate(4deg)" }} className="mb-2" />
              <p className="text-sm font-bold mt-1" style={{ color: "#1e3a8a", borderTop: "1px solid #1e3a8a", paddingTop: "4px" }}>Authorized Stamp and Signature</p>
            </div>
          </div>

          </div>
        </div>
      </div>
    </>
  );
}
