"use client";

import React, { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RenewalNotice,
  RenewalStatus,
  useRenewals,
} from "@/hooks/useRenewals";
import { RenewalPdfTemplate } from "./RenewalPdfTemplate";
import { RenewalPreviewModal } from "./RenewalPreviewModal";
import { CreateRenewalDialog } from "./CreateRenewalDialog";
import { generateRenewalPdf } from "@/lib/renewalPdf";
import {
  Download,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface RenewalsTableProps {
  renewals: RenewalNotice[];
  loading: boolean;
}

export function RenewalsTable({ renewals, loading }: RenewalsTableProps) {
  const { deleteRenewal, updateRenewal } = useRenewals();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewRenewal, setPreviewRenewal] = useState<RenewalNotice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingRenewal, setEditingRenewal] = useState<RenewalNotice | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Hidden print reference for direct row downloads
  const [activeDownloadRenewal, setActiveDownloadRenewal] =
    useState<RenewalNotice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (renewal: RenewalNotice) => {
    try {
      setDownloadingId(renewal.id);
      setActiveDownloadRenewal(renewal);

      // Allow DOM state update
      setTimeout(async () => {
        if (!printRef.current) {
          toast.error("Download template could not be initialized.");
          setDownloadingId(null);
          return;
        }

        try {
          await generateRenewalPdf(printRef.current, renewal);
          toast.success(`Downloaded ${renewal.noticeNumber}.pdf`);
        } catch (err) {
          console.error(err);
          toast.error("Failed to generate PDF.");
        } finally {
          setDownloadingId(null);
          setActiveDownloadRenewal(null);
        }
      }, 150);
    } catch (e) {
      console.error(e);
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string, noticeNumber: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Renewal Notice "${noticeNumber}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteRenewal(id);
      toast.success("Renewal notice deleted successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete renewal notice.");
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: RenewalStatus
  ) => {
    try {
      await updateRenewal(id, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status.");
    }
  };

  const getStatusBadge = (status: RenewalStatus) => {
    switch (status) {
      case "Renewed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Renewed
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case "Pending Renewal":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" /> Pending Renewal
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading renewal notices...</p>
      </div>
    );
  }

  if (renewals.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold">No Renewal Notices Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Create your first renewal notice to send reminders and download official PDF notices.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Notice #</TableHead>
              <TableHead>Client & Company</TableHead>
              <TableHead>Service Cycle</TableHead>
              <TableHead>Renewal Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount Due</TableHead>
              <TableHead className="text-right w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renewals.map((renewal) => {
              const isDownloading = downloadingId === renewal.id;

              return (
                <TableRow key={renewal.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-semibold text-primary">
                    {renewal.noticeNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {renewal.clientName}
                    </div>
                    {renewal.companyName && (
                      <div className="text-xs text-muted-foreground">
                        {renewal.companyName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {renewal.serviceCycle}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{renewal.renewalDue}</span>
                    <div className="text-xs text-muted-foreground">
                      {renewal.noticeDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer focus:outline-none">
                        {getStatusBadge(renewal.status)}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(renewal.id, "Pending Renewal")
                          }
                        >
                          Mark Pending Renewal
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(renewal.id, "Renewed")
                          }
                        >
                          Mark Renewed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(renewal.id, "Overdue")
                          }
                        >
                          Mark Overdue
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(renewal.id, "Cancelled")
                          }
                        >
                          Mark Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    ₹
                    {Number(renewal.totalAmount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download PDF"
                        disabled={isDownloading}
                        onClick={() => handleDownload(renewal)}
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Preview Notice"
                        onClick={() => {
                          setPreviewRenewal(renewal);
                          setIsPreviewOpen(true);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit Notice"
                        onClick={() => {
                          setEditingRenewal(renewal);
                          setIsEditOpen(true);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete Notice"
                        onClick={() =>
                          handleDelete(renewal.id, renewal.noticeNumber)
                        }
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Hidden print element for direct PDF export */}
      {activeDownloadRenewal && (
        <div
          ref={printRef}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "794px",
            zIndex: -9999,
            pointerEvents: "none",
          }}
        >
          <RenewalPdfTemplate
            renewal={activeDownloadRenewal}
          />
        </div>
      )}

      {/* Preview Modal */}
      <RenewalPreviewModal
        renewal={previewRenewal}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />

      {/* Edit Modal */}
      <CreateRenewalDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={editingRenewal}
      />
    </>
  );
}
