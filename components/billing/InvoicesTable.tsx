"use client";

import { format } from "date-fns";
import { Invoice, useInvoices } from "@/hooks/useInvoices";
import { Quotation } from "@/hooks/useQuotations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoicesTableProps {
  invoices: Invoice[];
  quotations: Quotation[];
  loading: boolean;
  type: string;
}

export function InvoicesTable({ invoices, quotations, loading, type }: InvoicesTableProps) {
  const { deleteInvoice } = useInvoices();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // States for hidden template rendering
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (invoice: Invoice) => {
    const quote = quotations.find(q => q.id === invoice.quotationId);
    if (!quote) {
      toast.error("Could not find original quotation details for this invoice.");
      return;
    }
    
    setDownloadingId(invoice.id);
    setSelectedInvoice(invoice);
    setSelectedQuotation(quote);
    
    // We need to wait for state to update and DOM to render the hidden template
    setTimeout(async () => {
      try {
        if (!printRef.current) return;
        
        const element = printRef.current;
        element.style.display = "block";
        
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
        pdf.save(`${invoice.invoiceNumber}.pdf`);
        toast.success("Downloaded successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to download PDF");
      } finally {
        setDownloadingId(null);
      }
    }, 100);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete this ${type.toLowerCase()}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteInvoice(id);
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${type.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center text-muted-foreground">
        No {type.toLowerCase()}s found.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{type}s</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-medium">Invoice #</TableHead>
            <TableHead className="font-medium">Customer</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Percentage</TableHead>
            <TableHead className="font-medium text-right">Amount</TableHead>
            <TableHead className="font-medium text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const date = invoice.createdAt?.toDate ? invoice.createdAt.toDate() : new Date(invoice.createdAt);
            
            return (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-primary">{invoice.invoiceNumber}</TableCell>
                <TableCell>
                  <div className="font-medium">{invoice.customerName || "Customer"}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{format(date, "d MMM yyyy")}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invoice.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invoice.percentage > 0 ? `${invoice.percentage}%` : '-'}
                </TableCell>
                <TableCell className="text-right font-medium">₹{invoice.amount.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDownload(invoice)}
                    disabled={downloadingId === invoice.id}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    {downloadingId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(invoice.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Hidden A4 Template for PDF Generation */}
      {selectedInvoice && selectedQuotation && (
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
                <p className="mb-1">INVOICE NO : {selectedInvoice.invoiceNumber}</p>
                <p>QUOTATION ID : {selectedQuotation.serialNumber}</p>
              </div>
              <span>Date : {format(selectedInvoice.createdAt?.toDate ? selectedInvoice.createdAt.toDate() : new Date(selectedInvoice.createdAt), "dd-MM-yyyy")}</span>
            </div>
            
            {/* Customer */}
            <div className="mb-12">
              <h3 className="text-sm mb-1 uppercase tracking-wider" style={{ color: "#1e293b" }}>{selectedInvoice.type === 'GST Invoice' ? 'BILLED TO :' : 'RECEIVED FROM :'}</h3>
              <p className="text-lg font-bold uppercase m-0" style={{ color: "#d97706" }}>{selectedQuotation.customerName}</p>
            </div>
            
            <table className="w-full text-left border-collapse mb-12">
              <thead>
                <tr>
                  <th className="py-3 px-4 font-bold w-3/4" style={{ color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Description</th>
                  <th className="py-3 px-4 font-bold text-right" style={{ color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.type === 'Advance Receipt' && (
                  <tr>
                    <td className="py-4 px-4" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>Total Quoted Price for {selectedQuotation.serviceType}</td>
                    <td className="py-4 px-4 text-right font-medium" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>
                      ₹{selectedQuotation.price.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-4 px-4" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>
                    {selectedInvoice.type === 'GST Invoice' ? `Final Payment for ${selectedQuotation.serviceType}` : `Advance Payment (${selectedInvoice.percentage}%)`}
                  </td>
                  <td className="py-4 px-4 text-right font-medium" style={{ color: "#1f2937", borderBottom: "1px solid #f3f4f6" }}>
                    {selectedInvoice.type === 'Advance Receipt' ? `- ` : ''}₹{selectedInvoice.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {selectedInvoice.type === 'Advance Receipt' && (
              <div className="flex justify-end mb-16 gap-6">
                <div className="w-1/2 p-6 rounded-lg" style={{ backgroundColor: "#fef2f2" }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold" style={{ color: "#991b1b" }}>Balance Left to Pay</span>
                    <span className="text-lg font-black" style={{ color: "#7f1d1d" }}>
                      ₹{(selectedQuotation.price - selectedInvoice.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                
                <div className="w-1/2 p-6 rounded-lg" style={{ backgroundColor: "#ecfdf5" }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold" style={{ color: "#065f46" }}>Total Received</span>
                    <span className="text-2xl font-black" style={{ color: "#064e3b" }}>
                      ₹{selectedInvoice.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ flexGrow: 1 }}></div>

            <div className="flex justify-between items-end mt-12 mb-8 pt-8" style={{ borderTop: "1px solid #e2e8f0" }}>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: "#000000" }}>Total Amount:</span>
                <span className="text-2xl font-black" style={{ color: "#000000" }}>₹ {selectedInvoice.amount.toLocaleString("en-IN")}/-</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm m-0" style={{ color: "#000000" }}>For Digital Dictionary</p>
                <p className="text-xs m-0" style={{ color: "#000000" }}>with date & stamp</p>
              </div>
            </div>

            <div className="text-center text-xs mt-auto pt-4" style={{ color: "#DAA520", borderTop: "1px solid #fce7f3", borderColor: "#fde68a" }}>
              📍 Neelkamal Shopping Plaza, D.L.Roy Sarani, Ward 6, Siliguri, West Bengal, Pin: 734001
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
