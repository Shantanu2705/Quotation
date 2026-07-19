"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { RecentEnquiriesTable } from "@/components/dashboard/RecentEnquiriesTable";
import { useEnquiries } from "@/hooks/useEnquiries";
import { useQuotations } from "@/hooks/useQuotations";
import { Inbox, FileText, CheckCircle2, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { enquiries, loading: loadingEnquiries, isFirebaseEnabled } = useEnquiries();
  const { quotations, loading: loadingQuotations } = useQuotations();
  const loading = loadingEnquiries || loadingQuotations;
  
  const recentEnquiries = enquiries?.slice(0, 5) || [];

  // Dynamic Calculations
  const totalEnquiry = enquiries.length;
  const totalQuotations = quotations.length;
  const confirmedBookings = quotations.filter(q => 
    q.paymentStatus === 'Payment Confirmed' || q.paymentStatus === 'Advance Payment Confirmed'
  ).length;
  const totalClients = new Set(enquiries.map(e => e.mobileNumber?.trim().toLowerCase() || e.customerName?.trim().toLowerCase())).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Real-time overview of your IT operations.</p>
        </div>
      </div>

      {!isFirebaseEnabled && (
        <Alert variant="default" className="bg-primary/10 text-primary border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Running in Local Mock Mode</AlertTitle>
          <AlertDescription>
            Firebase configuration is missing in your .env file. The data below is mocked locally. 
            Add a new enquiry from the Enquiries page to see the real-time updates!
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Enquiry" 
          value={totalEnquiry.toString()} 
          icon={<Inbox size={20} />} 
          delay={0.1}
        />
        <StatCard 
          title="Total Quotations" 
          value={totalQuotations.toString()} 
          icon={<FileText size={20} />} 
          delay={0.2}
        />
        <StatCard 
          title="Confirmed Bookings" 
          value={confirmedBookings.toString()} 
          icon={<CheckCircle2 size={20} />} 
          delay={0.3}
        />
        <StatCard 
          title="Total Clients" 
          value={totalClients.toString()} 
          icon={<Users size={20} />} 
          delay={0.4}
        />
      </div>

      {/* Tables & Deep Data */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid gap-6 grid-cols-1"
      >
        <RecentEnquiriesTable data={recentEnquiries} loading={loading} />
      </motion.div>
    </div>
  );
}
