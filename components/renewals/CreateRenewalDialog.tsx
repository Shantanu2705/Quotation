"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RenewalNotice,
  RenewalItem,
  RenewalStatus,
  useRenewals,
} from "@/hooks/useRenewals";
import { useQuotations, Quotation } from "@/hooks/useQuotations";
import { RenewalPdfTemplate } from "./RenewalPdfTemplate";
import { generateRenewalPdf } from "@/lib/renewalPdf";
import { Plus, Trash2, Wand2, Download, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CreateRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: RenewalNotice | null;
  onSaved?: (renewal: RenewalNotice) => void;
}

export function CreateRenewalDialog({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: CreateRenewalDialogProps) {
  const { addRenewal, updateRenewal } = useRenewals();
  const { quotations } = useQuotations();

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const hiddenPrintRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const defaultNoticeNumber = `RN-${currentYear}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const [formData, setFormData] = useState({
    noticeNumber: defaultNoticeNumber,
    noticeDate: format(new Date(), "MMM dd, yyyy"),
    status: "Pending Renewal" as RenewalStatus,
    serviceCycle: `${currentYear} - ${nextYear}`,
    renewalDue: "Immediate",
    clientName: "",
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    clientEmail: "",
    clientPhone: "",
    salutation: "",
    messageText: "",
    items: [
      {
        id: "item-1",
        title: "Domestic (SEO),Primium(SEO) & Digital Marketing Services",
        description:
          "Renewal of annual contract including Core Keyword Optimization, SEO management, Google Business Profile enhancement, link building strategy, and monthly performance insights.",
        amount: 40000,
      },
    ] as RenewalItem[],
    taxAmount: 0,
    paymentTerms:
      "Please process the renewal payment to avoid any break in your ongoing advertising campaigns or organic visibility ranking efforts. If you have any modifications to request or require specific invoice formatting for your accounts, feel free to reply directly to this notice.",
    signatoryName: "Arick Biswas",
    signatoryDesignation: "Founder & CEO, Digital Dictionary",
    footerNote:
      "Thank you for choosing Digital Dictionary to scale your digital presence. We value your partnership.",
    quotationId: "",
  });

  // Calculate Subtotal and Total
  const subtotal = formData.items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const totalAmount = subtotal + (Number(formData.taxAmount) || 0);

  // Sync when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        noticeNumber: initialData.noticeNumber,
        noticeDate: initialData.noticeDate,
        status: initialData.status,
        serviceCycle: initialData.serviceCycle,
        renewalDue: initialData.renewalDue,
        clientName: initialData.clientName,
        companyName: initialData.companyName,
        addressLine1: initialData.addressLine1,
        addressLine2: initialData.addressLine2,
        clientEmail: initialData.clientEmail || "",
        clientPhone: initialData.clientPhone || "",
        salutation: initialData.salutation,
        messageText: initialData.messageText,
        items: initialData.items || [],
        taxAmount: initialData.taxAmount || 0,
        paymentTerms: initialData.paymentTerms,
        signatoryName: initialData.signatoryName,
        signatoryDesignation: initialData.signatoryDesignation,
        footerNote: initialData.footerNote,
        quotationId: initialData.quotationId || "",
      });
    } else {
      // Reset form
      setFormData({
        noticeNumber: `RN-${currentYear}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
        noticeDate: format(new Date(), "MMM dd, yyyy"),
        status: "Pending Renewal",
        serviceCycle: `${currentYear} - ${nextYear}`,
        renewalDue: "Immediate",
        clientName: "",
        companyName: "",
        addressLine1: "",
        addressLine2: "",
        clientEmail: "",
        clientPhone: "",
        salutation: "",
        messageText:
          "We hope your business is thriving. This is a friendly reminder that your comprehensive Digital Marketing & SEO services with Digital Dictionary are up for their annual renewal. To ensure continuous growth, search rankings stability, and uninterrupted campaign management, please review the renewal breakdown summarized below.",
        items: [
          {
            id: `item-${Date.now()}`,
            title: "Domestic (SEO),Primium(SEO) & Digital Marketing Services",
            description:
              "Renewal of annual contract including Core Keyword Optimization, SEO management, Google Business Profile enhancement, link building strategy, and monthly performance insights.",
            amount: 40000,
          },
        ],
        taxAmount: 0,
        paymentTerms:
          "Please process the renewal payment to avoid any break in your ongoing advertising campaigns or organic visibility ranking efforts. If you have any modifications to request or require specific invoice formatting for your accounts, feel free to reply directly to this notice.",
        signatoryName: "Arick Biswas",
        signatoryDesignation: "Founder & CEO, Digital Dictionary",
        footerNote:
          "Thank you for choosing Digital Dictionary to scale your digital presence. We value your partnership.",
        quotationId: "",
      });
    }
  }, [initialData, open]);

  // Handle Quotation Selection to pre-fill
  const handleSelectQuotation = (quotationId: string) => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) return;

    const clientName = quote.customerName || "";
    const company = quote.customTemplate?.importantNote ? "" : "";
    const serviceName = quote.serviceType || "Digital Marketing";
    const price = quote.price || 40000;

    const salutation = `Dear ${clientName || "Valued Client"},`;
    const message = `We hope your business is thriving. This is a friendly reminder that your comprehensive ${serviceName} services with Digital Dictionary are up for their annual renewal. To ensure continuous growth, search rankings stability, and uninterrupted campaign management${
      company ? ` for ${company}` : ""
    }, please review the renewal breakdown summarized below.`;

    setFormData((prev) => ({
      ...prev,
      quotationId: quote.id,
      clientName: clientName,
      salutation: salutation,
      messageText: message,
      items: [
        {
          id: `item-${Date.now()}`,
          title: `${serviceName} Services`,
          description: `Renewal of annual contract including service management, maintenance, performance optimization, and continuous support.`,
          amount: price,
        },
      ],
    }));

    toast.info(`Imported details from Quotation ${quote.serialNumber}`);
  };

  const generatePersonalizedMessage = () => {
    const salutation = formData.clientName
      ? `Dear ${formData.clientName},`
      : "Dear Valued Client,";
    const serviceNames =
      formData.items.map((i) => i.title).join(", ") ||
      "Domestic (SEO),Primium(SEO) & Digital Marketing";
    const companyPart = formData.companyName
      ? ` for ${formData.companyName}`
      : "";

    const message = `We hope your business is thriving. This is a friendly reminder that your comprehensive ${serviceNames} services with Digital Dictionary are up for their annual renewal. To ensure continuous growth, search rankings stability, and uninterrupted campaign management${companyPart}, please review the renewal breakdown summarized below.`;

    setFormData((prev) => ({
      ...prev,
      salutation,
      messageText: message,
    }));

    toast.success("Message regenerated based on client & service details!");
  };

  const handleItemChange = (
    index: number,
    field: keyof RenewalItem,
    value: any
  ) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "amount" ? Number(value) || 0 : value,
    };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          title: "Additional Web & SEO Service",
          description: "Annual maintenance, optimization and reporting.",
          amount: 10000,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) {
      toast.error("At least one service item is required.");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const prepareRenewalData = (): Omit<RenewalNotice, "id" | "createdAt"> => ({
    noticeNumber: formData.noticeNumber,
    noticeDate: formData.noticeDate,
    status: formData.status,
    serviceCycle: formData.serviceCycle,
    renewalDue: formData.renewalDue,
    clientName: formData.clientName,
    companyName: formData.companyName,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2,
    clientEmail: formData.clientEmail,
    clientPhone: formData.clientPhone,
    salutation: formData.salutation || `Dear ${formData.clientName || "Valued Client"},`,
    messageText: formData.messageText,
    items: formData.items,
    subtotal,
    taxAmount: Number(formData.taxAmount) || 0,
    totalAmount,
    paymentTerms: formData.paymentTerms,
    signatoryName: formData.signatoryName,
    signatoryDesignation: formData.signatoryDesignation,
    footerNote: formData.footerNote,
    quotationId: formData.quotationId,
  });

  const handleSave = async (andDownload = false) => {
    if (!formData.clientName.trim()) {
      toast.error("Client Name is required.");
      return;
    }

    try {
      if (andDownload) setIsDownloading(true);
      else setIsSaving(true);

      const renewalPayload = prepareRenewalData();
      let recordId = initialData?.id;

      if (initialData?.id) {
        await updateRenewal(initialData.id, renewalPayload);
        toast.success("Renewal notice updated successfully!");
      } else {
        recordId = await addRenewal(renewalPayload);
        toast.success("Renewal notice created successfully!");
      }

      const completeRecord: RenewalNotice = {
        id: recordId || `renewal-${Date.now()}`,
        ...renewalPayload,
        createdAt: new Date(),
      };

      if (onSaved) onSaved(completeRecord);

      if (andDownload && hiddenPrintRef.current) {
        await generateRenewalPdf(hiddenPrintRef.current, completeRecord);
        toast.success("PDF downloaded!");
      }

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save renewal notice.");
    } finally {
      setIsSaving(false);
      setIsDownloading(false);
    }
  };

  const previewRecord: RenewalNotice = {
    id: initialData?.id || "preview-temp",
    ...prepareRenewalData(),
    createdAt: new Date(),
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {initialData ? "Edit Renewal Notice" : "Create Renewal Notice"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Configure renewal details, client accounts, service breakdown, and generate official notice PDF.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Import from Quotations */}
            {!initialData && quotations.length > 0 && (
              <div className="p-4 bg-muted/40 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quick Import from Existing Quotation
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-fill client details, service packages, and pricing.
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <Select onValueChange={(val: any) => { if (val) handleSelectQuotation(String(val)); }}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a quotation..." />
                    </SelectTrigger>
                    <SelectContent>
                      {quotations.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.serialNumber} - {q.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Section 1: Notice Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="noticeNumber">Notice Number</Label>
                <Input
                  id="noticeNumber"
                  value={formData.noticeNumber}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, noticeNumber: e.target.value }))
                  }
                  placeholder="RN-2026-001"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="noticeDate">Notice Date</Label>
                <Input
                  id="noticeDate"
                  value={formData.noticeDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, noticeDate: e.target.value }))
                  }
                  placeholder="Sept 24, 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceCycle">Service Cycle</Label>
                <Input
                  id="serviceCycle"
                  value={formData.serviceCycle}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, serviceCycle: e.target.value }))
                  }
                  placeholder="2026 - 2027"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="renewalDue">Renewal Due</Label>
                <Input
                  id="renewalDue"
                  value={formData.renewalDue}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, renewalDue: e.target.value }))
                  }
                  placeholder="Immediate"
                />
              </div>
            </div>

            {/* Section 2: Client & Company (Prepared For) */}
            <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Prepared For (Client Information)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="clientName">
                    Client Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, clientName: e.target.value }))
                    }
                    placeholder="Mr. Harprit Singh"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Business / Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, companyName: e.target.value }))
                    }
                    placeholder="Take A Trip Make Memories"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        addressLine1: e.target.value,
                      }))
                    }
                    placeholder="Udham Singh Sarani,"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="addressLine2">Address Line 2 (City / State)</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        addressLine2: e.target.value,
                      }))
                    }
                    placeholder="Siliguri, West Bengal"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Salutation & Personalized Reminder Message */}
            <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                  Notice Message & Greeting
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePersonalizedMessage}
                  className="gap-1.5 text-xs h-7"
                >
                  <Wand2 className="w-3.5 h-3.5 text-primary" />
                  Auto-Generate Message
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="salutation">Salutation</Label>
                  <Input
                    id="salutation"
                    value={formData.salutation}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, salutation: e.target.value }))
                    }
                    placeholder="Dear Mr. Harprit Singh,"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="messageText">Friendly Reminder Text</Label>
                  <Textarea
                    id="messageText"
                    rows={4}
                    value={formData.messageText}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        messageText: e.target.value,
                      }))
                    }
                    placeholder="We hope your business is thriving. This is a friendly reminder that..."
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Service Items Breakdown */}
            <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                    Service Description & Pricing
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Break down services and annual renewal fees.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Service Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-md border border-border bg-background space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Item #{idx + 1}
                      </span>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(idx)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3 space-y-1">
                        <Label className="text-xs">Service Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            handleItemChange(idx, "title", e.target.value)
                          }
                          placeholder="Domestic (SEO),Primium(SEO) & Digital Marketing Services"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input
                          type="number"
                          value={item.amount || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "amount", e.target.value)
                          }
                          placeholder="40000"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Scope & Breakdown Description
                      </Label>
                      <Textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(idx, "description", e.target.value)
                        }
                        placeholder="Renewal of annual contract including Core Keyword Optimization, SEO management..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal, Tax and Total Calculation */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 space-y-2 text-sm bg-muted/40 p-4 rounded-lg border border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">
                      ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">Tax / GST (₹):</span>
                    <Input
                      type="number"
                      className="w-28 text-right h-8 bg-background"
                      value={formData.taxAmount || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          taxAmount: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                    <span>Total Amount Due:</span>
                    <span className="text-primary text-lg">
                      ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Status & Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Renewal Notice Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => {
                    if (val) setFormData((p) => ({ ...p, status: val as RenewalStatus }));
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending Renewal">
                      Pending Renewal
                    </SelectItem>
                    <SelectItem value="Renewed">Renewed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signatory">Signatory Name</Label>
                <Input
                  id="signatory"
                  value={formData.signatoryName}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      signatoryName: e.target.value,
                    }))
                  }
                  placeholder="Arick Biswas"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="paymentTerms">
                  Payment Terms & Support Callout Text
                </Label>
                <Textarea
                  id="paymentTerms"
                  rows={2}
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      paymentTerms: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-6 border-t bg-muted/20 flex flex-col sm:flex-row gap-2 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isDownloading}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving || isDownloading}
                className="gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Notice
              </Button>
              <Button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving || isDownloading}
                className="gap-1.5"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Save & Download PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden container for instant PDF export upon creation */}
      <div style={{ display: "none" }}>
        <RenewalPdfTemplate ref={hiddenPrintRef} renewal={previewRecord} />
      </div>
    </>
  );
}
