"use client";

import { useState, useEffect, useRef } from "react";
import { Quotation, useQuotations } from "@/hooks/useQuotations";
import { useInvoices } from "@/hooks/useInvoices";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AdvanceReceiptDialogProps {
  quotation: Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvanceReceiptDialog({ quotation, open, onOpenChange }: AdvanceReceiptDialogProps) {
  const [percentage, setPercentage] = useState<string>("50");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addInvoice } = useInvoices();
  const { updateQuotation } = useQuotations();
  const printRef = useRef<HTMLDivElement>(null);

  // Reset percentage and generate invoice number when dialog opens
  useEffect(() => {
    if (open) {
      setPercentage("50");
      setInvoiceNumber(`AR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [open]);

  if (!quotation) return null;

  const numPercentage = Number(percentage) || 0;
  const calculatedAmount = Math.round(quotation.price * (numPercentage / 100));

  const handleGenerate = async () => {
    if (numPercentage <= 0 || numPercentage > 100) {
      toast.error("Please enter a valid percentage between 1 and 100.");
      return;
    }

    if (!printRef.current) return;

    setIsSubmitting(true);
    try {
      // 1. Create the Advance Receipt invoice record

      
      await addInvoice({
        quotationId: quotation.id,
        invoiceNumber,
        type: 'Advance Receipt',
        amount: calculatedAmount,
        percentage: numPercentage,
        status: 'Paid',
        customerName: quotation.customerName
      });

      // 2. Update the quotation's payment status
      await updateQuotation(quotation.id, {
        paymentStatus: 'Advance Payment Confirmed'
      });

      // 3. Generate and download PDF
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

      toast.success("Advance Receipt generated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Advance Receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Advance Receipt</DialogTitle>
            <DialogDescription>
              Create an advance receipt for {quotation.customerName}'s confirmed quotation ({quotation.serialNumber}).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
          <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg border">
            <span className="text-sm font-medium text-muted-foreground">Total Quoted Price</span>
            <span className="font-bold text-lg">₹{quotation.price.toLocaleString("en-IN")}</span>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Advance Payment Percentage (%)</label>
            <div className="flex gap-4 items-center">
              <Input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                min={1}
                max={100}
                className="w-24 text-center font-medium"
              />
              <span className="text-muted-foreground">=</span>
              <div className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-right">
                ₹{calculatedAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100">
            <span className="text-sm font-bold text-red-800">Balance Left to Pay</span>
            <span className="font-black text-xl text-red-900">₹{(quotation.price - calculatedAmount).toLocaleString("en-IN")}</span>
          </div>
        </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden A4 Template for PDF Generation */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div 
          className="p-12"
          style={{ width: "210mm", minHeight: "297mm", padding: "20mm", backgroundColor: "#ffffff", color: "#000000", fontFamily: "sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6" style={{ borderBottom: "2px solid #3b82f6" }}>
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
          <div className="flex justify-between items-center mb-8 font-bold text-sm" style={{ color: "#0369a1" }}>
            <div>
              <p className="mb-1">INVOICE NO : {invoiceNumber}</p>
              <p>QUOTATION ID : {quotation.serialNumber}</p>
            </div>
            <span>Date : {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          </div>
          
          {/* Customer */}
          <div className="mb-12">
            <h3 className="text-sm mb-1 uppercase tracking-wider" style={{ color: "#1e293b" }}>RECEIVED FROM :</h3>
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
                <td className="py-4 px-4" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>Total Quoted Price for {quotation.serviceType}</td>
                <td className="py-4 px-4 text-right font-medium" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>
                  ₹{quotation.price.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>Advance Payment ({numPercentage}%)</td>
                <td className="py-4 px-4 text-right font-medium" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>
                  - ₹{calculatedAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="flex justify-end mb-16 gap-6">
            <div className="w-1/2 p-6 rounded-lg" style={{ backgroundColor: "#fef2f2" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold" style={{ color: "#991b1b" }}>Balance Left to Pay</span>
                <span className="text-lg font-black" style={{ color: "#7f1d1d" }}>
                  ₹{(quotation.price - calculatedAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            
            <div className="w-1/2 p-6 rounded-lg" style={{ backgroundColor: "#ecfdf5" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold" style={{ color: "#065f46" }}>Total Received</span>
                <span className="text-2xl font-black" style={{ color: "#064e3b" }}>
                  ₹{calculatedAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Spacer to push footer down */}
          <div style={{ flexGrow: 1 }}></div>

          {/* Footer content - Amount and Sign */}
          <div className="flex justify-between items-end mt-12 mb-8 pt-8" style={{ borderTop: "1px solid #e2e8f0" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: "#000000" }}>Total Amount:</span>
              <span className="text-2xl font-black" style={{ color: "#000000" }}>₹ {calculatedAmount.toLocaleString("en-IN")}/-</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm m-0" style={{ color: "#000000" }}>For Digital Dictionary</p>
              <p className="text-xs m-0" style={{ color: "#000000" }}>with date & stamp</p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="text-center text-xs mt-auto pt-4" style={{ color: "#3b82f6", borderTop: "1px solid #bfdbfe" }}>
            📍 Neelkamal Shopping Plaza, D.L.Roy Sarani, Ward 6, Siliguri, West Bengal, Pin: 734001
          </div>
        </div>
      </div>
    </>
  );
}
