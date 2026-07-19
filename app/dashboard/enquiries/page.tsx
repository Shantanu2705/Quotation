"use client";

import { useEnquiries } from "@/hooks/useEnquiries";
import { RecentEnquiriesTable } from "@/components/dashboard/RecentEnquiriesTable";
import { NewEnquiryDialog } from "@/components/enquiries/NewEnquiryDialog";
import { Inbox } from "lucide-react";
import { motion } from "framer-motion";

export default function EnquiriesPage() {
  const { enquiries, loading } = useEnquiries();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Inbox className="mr-3 text-primary" size={28} />
            Enquiries
          </h1>
          <p className="text-muted-foreground mt-2">Manage and view all incoming requests.</p>
        </div>
        <NewEnquiryDialog />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* We reuse the RecentEnquiriesTable here, but you can build a more complex one later */}
        <RecentEnquiriesTable data={enquiries} loading={loading} hideHeader={false} fullList={true} />
      </motion.div>
    </div>
  );
}
