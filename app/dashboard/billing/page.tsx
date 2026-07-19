"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmedQuotationsTable } from "@/components/billing/ConfirmedQuotationsTable";
import { InvoicesTable } from "@/components/billing/InvoicesTable";
import { BlankInvoiceDialog } from "@/components/billing/BlankInvoiceDialog";
import { useQuotations } from "@/hooks/useQuotations";
import { useInvoices } from "@/hooks/useInvoices";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"confirmed" | "advance" | "gst">("confirmed");
  const [isBlankInvoiceOpen, setIsBlankInvoiceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { quotations, loading: quotationsLoading, updateQuotation } = useQuotations();
  const { invoices, loading: invoicesLoading } = useInvoices();

  const confirmedQuotations = quotations.filter(q => q.status === "Confirmed");
  const advanceReceipts = invoices.filter(i => i.type === "Advance Receipt");
  const gstInvoices = invoices.filter(i => i.type === "GST Invoice");

  const normalizedQuery = searchQuery.toLowerCase();

  const filteredQuotations = confirmedQuotations.filter(q => 
    q.serialNumber.toLowerCase().includes(normalizedQuery) || 
    q.customerName.toLowerCase().includes(normalizedQuery)
  );

  const filterInvoice = (i: any) => {
    const quotation = quotations.find(q => q.id === i.quotationId);
    return (
      i.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
      (i.customerName && i.customerName.toLowerCase().includes(normalizedQuery)) ||
      (quotation && quotation.serialNumber.toLowerCase().includes(normalizedQuery))
    );
  };

  const filteredAdvanceReceipts = advanceReceipts.filter(filterInvoice);
  const filteredGstInvoices = gstInvoices.filter(filterInvoice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & GST Invoices</h1>
          <p className="text-muted-foreground mt-1">
            {invoices.length} total invoice{invoices.length !== 1 ? 's' : ''} • {advanceReceipts.length} receipt{advanceReceipts.length !== 1 ? 's' : ''} • {confirmedQuotations.length} confirmed package{confirmedQuotations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ID or Customer..."
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsBlankInvoiceOpen(true)} variant="outline" className="gap-2 bg-background">
            <Plus className="w-4 h-4" />
            Blank invoice
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("confirmed")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "confirmed" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Confirmed quotations ({filteredQuotations.length})
        </button>
        <button
          onClick={() => setActiveTab("advance")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "advance" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Advance Receipts ({filteredAdvanceReceipts.length})
        </button>
        <button
          onClick={() => setActiveTab("gst")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "gst" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          GST Invoices ({filteredGstInvoices.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-background rounded-xl shadow-sm border border-border">
        {activeTab === "confirmed" && (
          <ConfirmedQuotationsTable quotations={filteredQuotations} loading={quotationsLoading} onUpdateQuotation={updateQuotation} />
        )}
        
        {activeTab === "advance" && (
          <InvoicesTable invoices={filteredAdvanceReceipts} quotations={quotations} loading={invoicesLoading} type="Advance Receipt" />
        )}
        
        {activeTab === "gst" && (
          <InvoicesTable invoices={filteredGstInvoices} quotations={quotations} loading={invoicesLoading} type="GST Invoice" />
        )}
      </div>

      <BlankInvoiceDialog open={isBlankInvoiceOpen} onOpenChange={setIsBlankInvoiceOpen} />
    </div>
  );
}
