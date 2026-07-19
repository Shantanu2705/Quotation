"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Quotation } from "@/hooks/useQuotations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvanceReceiptDialog } from "./AdvanceReceiptDialog";
import { GstInvoiceDialog } from "./GstInvoiceDialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ConfirmedQuotationsTableProps {
  quotations: Quotation[];
  loading: boolean;
  onUpdateQuotation: (id: string, data: Partial<Quotation>) => Promise<void>;
}

export function ConfirmedQuotationsTable({ quotations, loading, onUpdateQuotation }: ConfirmedQuotationsTableProps) {
  const [advanceReceiptQuote, setAdvanceReceiptQuote] = useState<Quotation | null>(null);
  const [gstInvoiceQuote, setGstInvoiceQuote] = useState<Quotation | null>(null);

  const handleStatusChange = async (id: string, newStatus: string | null) => {
    if (!newStatus) return;
    try {
      await onUpdateQuotation(id, { paymentStatus: newStatus as any });
      toast.success("Payment status updated");
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center text-muted-foreground">
        No confirmed quotations found.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirmed Quotations</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-medium">Quotation #</TableHead>
            <TableHead className="font-medium">Customer</TableHead>
            <TableHead className="font-medium">Service Type</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Payment</TableHead>
            <TableHead className="font-medium text-right">Amount</TableHead>
            <TableHead className="font-medium text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quote) => {
            const date = quote.createdAt?.toDate ? quote.createdAt.toDate() : new Date(quote.createdAt);
            const currentStatus = quote.paymentStatus || 'Payment Pending';
            
            // Derive color based on status
            let badgeClass = "bg-muted text-muted-foreground border-transparent";
            let dotClass = "bg-muted-foreground";
            
            if (currentStatus === 'Payment Pending') {
              badgeClass = "bg-red-100 text-red-800 border-red-200";
              dotClass = "bg-red-500";
            } else if (currentStatus === 'Advance Payment Confirmed' || currentStatus === 'Payment Confirmed') {
              badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
              dotClass = "bg-amber-500";
            } else if (currentStatus === 'Cancelled' || currentStatus === 'Refunded') {
              badgeClass = "bg-slate-100 text-slate-800 border-slate-200";
              dotClass = "bg-slate-500";
            }
            
            return (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.serialNumber}</TableCell>
                <TableCell>
                  <div className="font-medium">{quote.customerName}</div>
                </TableCell>
                <TableCell>{quote.serviceType}</TableCell>
                <TableCell className="text-muted-foreground">{format(date, "d MMM yyyy")}</TableCell>
                <TableCell>
                  <Select value={currentStatus} onValueChange={(val) => handleStatusChange(quote.id, val)}>
                    <SelectTrigger className={`h-7 px-2.5 rounded-full text-xs font-medium border w-auto inline-flex gap-2 [&>svg]:hidden ${badgeClass}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Payment Pending">Payment Pending</SelectItem>
                      <SelectItem value="Advance Payment Confirmed">Advance Payment Confirmed</SelectItem>
                      <SelectItem value="Payment Confirmed">Payment Confirmed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right font-medium">₹{quote.price.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                    onClick={() => setAdvanceReceiptQuote(quote)}
                  >
                    <ReceiptText className="w-3.5 h-3.5" />
                    Advance Receipt
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                    onClick={() => setGstInvoiceQuote(quote)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    GST Invoice
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AdvanceReceiptDialog 
        quotation={advanceReceiptQuote} 
        open={!!advanceReceiptQuote} 
        onOpenChange={(open) => !open && setAdvanceReceiptQuote(null)} 
      />
      
      <GstInvoiceDialog
        quotation={gstInvoiceQuote} 
        open={!!gstInvoiceQuote} 
        onOpenChange={(open) => !open && setGstInvoiceQuote(null)} 
      />
    </>
  );
}
