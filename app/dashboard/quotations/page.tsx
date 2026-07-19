"use client";

import { useQuotations } from "@/hooks/useQuotations";
import { useEnquiries } from "@/hooks/useEnquiries";
import { QuotationsTable } from "@/components/dashboard/QuotationsTable";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function QuotationsPage() {
  const { quotations, loading, deleteQuotation, updateQuotation } = useQuotations();
  const { updateEnquiry } = useEnquiries();

  const handleDelete = async (quotationId: string, enquiryId: string) => {
    try {
      await deleteQuotation(quotationId);
      await updateEnquiry(enquiryId, { status: "pending" });
    } catch (error) {
      console.error("Failed to delete quotation:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <FileText className="mr-3 text-primary" size={28} />
            Quotations
          </h1>
          <p className="text-muted-foreground mt-2">View and manage all generated quotations.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <QuotationsTable 
          data={quotations} 
          loading={loading} 
          onDelete={handleDelete} 
          onStatusChange={(id, status) => updateQuotation(id, { status })}
        />
      </motion.div>
    </div>
  );
}
