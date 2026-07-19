"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuotations, Quotation } from "@/hooks/useQuotations";
import { useEnquiries, Enquiry } from "@/hooks/useEnquiries";
import { QuotationActions } from "@/components/quotations/QuotationActions";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { quotationTemplates } from "@/lib/quotationTemplates";
import { useTemplates } from "@/hooks/useTemplates";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QuotationDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { quotations, loading: quotationsLoading, updateQuotation } = useQuotations();
  const { enquiries, loading: enquiriesLoading, updateEnquiry } = useEnquiries();
  const { templates } = useTemplates();
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    email: "",
    serviceType: "",
    price: "",
    requirements: ""
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quotationsLoading && !enquiriesLoading) {
      const foundQuote = quotations.find((q) => q.id === id);
      if (foundQuote) {
        setQuotation(foundQuote);
        const foundEnquiry = enquiries.find((e) => e.id === foundQuote.enquiryId);
        if (foundEnquiry) {
          setEnquiry(foundEnquiry);
          
          if (!isDirty) {
            setFormData({
              customerName: foundQuote.customerName,
              mobileNumber: foundEnquiry.mobileNumber || "",
              email: foundEnquiry.email || "",
              serviceType: foundQuote.serviceType,
              price: foundQuote.price.toString(),
              requirements: foundEnquiry.requirements || ""
            });
          }
        }
      }
    }
  }, [id, quotations, enquiries, quotationsLoading, enquiriesLoading, isDirty]);

  const handleDownloadPdf = async () => {
    if (!printRef.current || !quotation) return;
    
    try {
      setIsGeneratingPdf(true);
      const element = printRef.current;
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt: any = {
        margin: [15, 0, 15, 0], // top, left, bottom, right
        filename: `${quotation.serialNumber}_Quotation.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'legacy', avoid: '.pdf-no-break' }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      setIsGeneratingPdf(false);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsDirty(true);
  };

  const handleServiceTypeChange = (val: string | null) => {
    if (!val) return;
    setFormData(prev => ({ ...prev, serviceType: val }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!quotation || !enquiry) return;
    setIsSaving(true);
    try {
      await updateQuotation(quotation.id, {
        customerName: formData.customerName,
        serviceType: formData.serviceType as any,
        price: Number(formData.price)
      });
      await updateEnquiry(quotation.enquiryId, {
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        requirements: formData.requirements
      });
      setIsDirty(false);
      toast.success("Quotation updated successfully");
    } catch (err) {
      toast.error("Failed to update quotation");
    } finally {
      setIsSaving(false);
    }
  };

  if (quotationsLoading || enquiriesLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quotation || !enquiry) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Quotation not found.</p>
        <button 
          onClick={() => router.push("/dashboard/quotations")}
          className="text-primary hover:underline"
        >
          Return to Quotations
        </button>
      </div>
    );
  }

  const currentTemplate = templates.find(t => t.id === formData.serviceType);

  return (
    <div className="space-y-6 pb-12 -mt-6 -mx-6 bg-muted/30 min-h-screen">
      <QuotationActions 
        quotation={quotation} 
        enquiry={enquiry} 
        onDownloadPdf={handleDownloadPdf}
        isGeneratingPdf={isGeneratingPdf}
      />
      
      <div className="max-w-6xl mx-auto px-6 space-y-6 mt-6 print:hidden">
        
        {isDirty && (
          <div className="flex justify-end animate-in fade-in slide-in-from-top-4 duration-300">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}

        {/* Customer Information Card */}
        <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Customer information</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Quotation {quotation.serialNumber} • {quotation.serviceType}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium border border-border">
                {quotation.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Customer name</label>
              <Input 
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Mobile number</label>
              <Input 
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email address</label>
              <Input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-background"
              />
            </div>
          </div>
        </div>

        {/* Service Details Card */}
        <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Service details</h2>
            <p className="text-sm text-muted-foreground mt-1">Information from the original enquiry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Service type</label>
              <Select value={formData.serviceType} onValueChange={handleServiceTypeChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEO">SEO</SelectItem>
                  <SelectItem value="Website Development">Website Development</SelectItem>
                  <SelectItem value="AI Leads">AI Leads</SelectItem>
                  <SelectItem value="Software Solutions">Software Solutions</SelectItem>
                  <SelectItem value="Google Ads / Meta Ads">Google Ads / Meta Ads</SelectItem>
                  <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Quoted Price (₹)</label>
              <Input 
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Requirements & Scope</label>
            <Textarea 
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className="bg-background min-h-[100px] resize-y"
            />
          </div>
        </div>
      </div>

      {/* Hidden PDF Template (also used for Printing) */}
      <style type="text/css" media="print">
        {`@page { margin: 15mm 0; }`}
      </style>
      <div className="absolute -top-[9999px] -left-[9999px] print:static print:top-auto print:left-auto print:transform-none">
        <div ref={printRef} className="print:block w-[794px] print:w-full" style={{ backgroundColor: "#ffffff", color: "#000000", fontFamily: "sans-serif", paddingBottom: "1px" }}>
          <div className="p-[20mm] print:px-[20mm] print:py-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6" style={{ borderBottom: "2px solid #3b82f6" }}>
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
            <div className="flex justify-between items-center mb-8 font-bold text-sm" style={{ color: "#0369a1" }}>
              <span>QUOTATION ID : {quotation.serialNumber}</span>
              <span>Date : {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
            </div>

            {/* Customer */}
            <div className="mb-10 print:break-inside-avoid pdf-no-break">
              <h3 className="text-sm mb-1 uppercase tracking-wider" style={{ color: "#1e293b" }}>CUSTOMER DETAILS :</h3>
              <p className="text-lg font-bold uppercase m-0" style={{ color: "#d97706" }}>{formData.customerName || "Customer Name"}</p>
              <p className="m-0 uppercase" style={{ color: "#1e293b" }}>{formData.email || "NO EMAIL PROVIDED"}</p>
              <p className="m-0" style={{ color: "#1e293b" }}>{formData.mobileNumber || "NO NUMBER PROVIDED"}</p>
            </div>

            {/* Service Title */}
            <div className="mb-6 print:break-inside-avoid pdf-no-break print:mt-8">
              <h2 className="text-xl font-bold uppercase m-0" style={{ color: "#0369a1" }}>
                {currentTemplate?.id || `${formData.serviceType.toUpperCase()} SERVICE`}
              </h2>
            </div>

            {/* Boilerplate or Requirements */}
            <>
              {currentTemplate ? (
                <>
                  {currentTemplate.servicePackage && (
                    <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                      <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>SERVICE PACKAGE INCLUDES :</h4>
                      <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>{currentTemplate.servicePackage}</div>
                    </div>
                  )}
                  {currentTemplate.projectDeliverables && (
                    <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                      <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>PROJECT DELIVERABLES :</h4>
                      <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>{currentTemplate.projectDeliverables}</div>
                    </div>
                  )}
                  {currentTemplate.importantNote && (
                    <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                      <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>IMPORTANT NOTE :</h4>
                      <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>{currentTemplate.importantNote}</div>
                    </div>
                  )}
                  {currentTemplate.scheduleTimeFrame && (
                    <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                      <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>SCHEDULE TIME FRAME & PROJECT DURATION :</h4>
                      <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>{currentTemplate.scheduleTimeFrame}</div>
                    </div>
                  )}
                  {currentTemplate.projectPaymentTerms && (
                    <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                      <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>PROJECT PAYMENT TERMS :</h4>
                      <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>{currentTemplate.projectPaymentTerms}</div>
                    </div>
                  )}
                  {currentTemplate.sampleOrCaseStudies && (
                    <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                      <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>SAMPLE OR CASE STUDIES :</h4>
                      <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>{currentTemplate.sampleOrCaseStudies}</div>
                    </div>
                  )}
                  {currentTemplate.termsAndConditions && (
                    <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                      <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>TERMS & CONDITIONS :</h4>
                      <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>{currentTemplate.termsAndConditions}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-6 print:break-inside-avoid pdf-no-break print:pt-4">
                  <h4 className="text-sm font-bold uppercase mb-3" style={{ color: "#0369a1" }}>REQUIREMENTS & SCOPE :</h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#000000" }}>
                    {formData.requirements || "No specific requirements provided."}
                  </div>
                </div>
              )}
            </>
            
            {/* Spacer to push footer down */}
            <div style={{ flexGrow: 1 }}></div>

            {/* Footer content - Amount and Sign */}
            <div className="flex justify-between items-end mt-12 mb-8 pt-8 print:break-inside-avoid pdf-no-break" style={{ borderTop: "1px solid #e2e8f0" }}>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: "#000000" }}>Amount:</span>
                <span className="text-2xl font-black" style={{ color: "#000000" }}>₹ {Number(formData.price).toLocaleString("en-IN")}/-</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm m-0" style={{ color: "#000000" }}>For Digital Dictionary</p>
                <p className="text-xs m-0" style={{ color: "#000000" }}>with date & stamp</p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="text-center text-xs mt-auto pt-4" style={{ color: "#3b82f6", borderTop: "1px solid #bfdbfe" }}>
              📍 Neelkamal Shopping Plaza, D.L.Roy Sarani, Ward 6, Siliguri, West Bengal, Pin: 734001
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
