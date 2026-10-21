"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RenewalNotice } from "@/hooks/useRenewals";
import { RenewalPdfTemplate } from "./RenewalPdfTemplate";
import { generateRenewalPdf } from "@/lib/renewalPdf";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RenewalPreviewModalProps {
  renewal: RenewalNotice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenewalPreviewModal({
  renewal,
  open,
  onOpenChange,
}: RenewalPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!renewal) return null;

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      setIsDownloading(true);
      await generateRenewalPdf(printRef.current, renewal);
      toast.success("Renewal notice PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 border-b flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-lg font-bold">
              Renewal Notice Preview - {renewal.noticeNumber}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prepared for {renewal.clientName} ({renewal.companyName || "Client"})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-1.5"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Container with realistic A4 sheet view */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 bg-muted/40 flex justify-center">
          <div className="shadow-2xl rounded-sm overflow-hidden border border-border/80 bg-white my-2 shrink-0">
            <RenewalPdfTemplate ref={printRef} renewal={renewal} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
