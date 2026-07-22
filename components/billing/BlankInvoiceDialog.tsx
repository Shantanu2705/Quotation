"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface BlankInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlankInvoiceDialog({ open, onOpenChange }: BlankInvoiceDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    serviceDescription: "",
    amount: "",
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    
    setIsGenerating(true);
    try {
      const element = printRef.current;
      // Temporarily make it visible for rendering if it was hidden
      element.style.display = "block";
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
      });
      
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
      pdf.save(`${formData.invoiceNumber}.pdf`);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Blank Invoice</DialogTitle>
            <DialogDescription>
              Fill out the details below to generate a standalone PDF invoice. This will not be saved to the database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="serviceDescription">Service Description</Label>
              <Input
                id="serviceDescription"
                name="serviceDescription"
                value={formData.serviceDescription}
                onChange={handleChange}
                placeholder="Consulting Services"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="5000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleDownload} disabled={isGenerating || !formData.customerName || !formData.amount} className="gap-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
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
              <img src="/logo.png?v=3" alt="Digital Dictionary Logo" style={{ maxHeight: "80px", objectFit: "contain" }} />
            </div>
            <div className="text-right text-sm" style={{ color: "#334155" }}>
              <p className="font-bold mb-1" style={{ fontSize: "16px", color: "#1e293b", letterSpacing: "2px" }}>📱 9233556555</p>
              <p className="mb-1">📧 info@digitaldictionary.com</p>
              <p>🌐 www.digitaldictionary.com</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex justify-between items-center mb-8 font-bold text-sm" style={{ color: "#DAA520" }}>
            <span>INVOICE ID : {formData.invoiceNumber}</span>
            <span>Date : {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          </div>
          
          {/* Customer */}
          <div className="mb-12">
            <h3 className="text-sm mb-1 uppercase tracking-wider" style={{ color: "#1e293b" }}>BILL TO :</h3>
            <p className="text-lg font-bold uppercase m-0" style={{ color: "#d97706" }}>{formData.customerName || "Customer Name"}</p>
            {formData.address && <p className="m-0 uppercase mt-1" style={{ color: "#1e293b" }}>{formData.address}</p>}
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
                <td className="py-4 px-4" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>{formData.serviceDescription || "Service"}</td>
                <td className="py-4 px-4 text-right font-medium" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>
                  ₹{Number(formData.amount || 0).toLocaleString("en-IN")}
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
              <span className="text-2xl font-black" style={{ color: "#000000" }}>₹ {Number(formData.amount || 0).toLocaleString("en-IN")}/-</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm m-0" style={{ color: "#000000" }}>For Digital Dictionary</p>
              <p className="text-xs m-0" style={{ color: "#000000" }}>with date & stamp</p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="text-center text-xs mt-auto pt-4" style={{ color: "#DAA520", borderTop: "1px solid #fce7f3", borderColor: "#fde68a" }}>
            📍 Digital Dictionary HQ, Tech Park, Siliguri. Pin: 734001
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
