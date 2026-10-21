"use client";

import { useState } from "react";
import {
  RotateCcw,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RenewalsTable } from "@/components/renewals/RenewalsTable";
import { CreateRenewalDialog } from "@/components/renewals/CreateRenewalDialog";
import { useRenewals, RenewalStatus } from "@/hooks/useRenewals";
import { motion } from "framer-motion";

export default function RenewalsPage() {
  const { renewals, loading } = useRenewals();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Dynamic Metrics
  const totalCount = renewals.length;
  const pendingCount = renewals.filter(
    (r) => r.status === "Pending Renewal"
  ).length;
  const renewedCount = renewals.filter((r) => r.status === "Renewed").length;
  const overdueCount = renewals.filter((r) => r.status === "Overdue").length;
  const totalAmountDue = renewals.reduce(
    (sum, r) => sum + (Number(r.totalAmount) || 0),
    0
  );

  // Search and Tab Filtering
  const normalizedQuery = searchQuery.toLowerCase().trim();
  const filteredRenewals = renewals.filter((r) => {
    const matchesSearch =
      !normalizedQuery ||
      r.noticeNumber?.toLowerCase().includes(normalizedQuery) ||
      r.clientName?.toLowerCase().includes(normalizedQuery) ||
      r.companyName?.toLowerCase().includes(normalizedQuery) ||
      r.serviceCycle?.toLowerCase().includes(normalizedQuery) ||
      r.items?.some(
        (i) =>
          i.title?.toLowerCase().includes(normalizedQuery) ||
          i.description?.toLowerCase().includes(normalizedQuery)
      );

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "pending") return r.status === "Pending Renewal";
    if (activeTab === "renewed") return r.status === "Renewed";
    if (activeTab === "overdue") return r.status === "Overdue";

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <RotateCcw className="mr-3 text-primary" size={28} />
            Renewal Notices
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage contract renewals, send notices, and download official renewal PDF documents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Client or Notice #..."
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Renewal
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Notices
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {totalCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pending Renewal
              </p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {pendingCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Renewed
              </p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {renewedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Amount Due
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                ₹{totalAmountDue.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All Notices ({renewals.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Pending Renewal ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("renewed")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "renewed"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Renewed ({renewedCount})
        </button>
        {overdueCount > 0 && (
          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "overdue"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Overdue ({overdueCount})
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background rounded-xl shadow-xs border border-border overflow-hidden"
      >
        <RenewalsTable renewals={filteredRenewals} loading={loading} />
      </motion.div>

      {/* Create Renewal Modal */}
      <CreateRenewalDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
