"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuotations, Quotation } from "@/hooks/useQuotations";
import { useEnquiries, Enquiry } from "@/hooks/useEnquiries";
import { QuotationActions } from "@/components/quotations/QuotationActions";
import { 
  Loader2, 
  UserCircle, 
  Settings2,
  ListChecks,
  PackageCheck,
  Target,
  AlertCircle,
  Clock,
  Banknote,
  LineChart,
  ShieldAlert
} from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent } from "@/components/ui/card";
import { quotationTemplates } from "@/lib/quotationTemplates";
import { useTemplates } from "@/hooks/useTemplates";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichEditor } from "@/components/ui/rich-editor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QuotationDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { quotations, loading: quotationsLoading, updateQuotation } = useQuotations();
  const { enquiries, loading: enquiriesLoading, updateEnquiry } = useEnquiries();
  const { templates, loading: templatesLoading } = useTemplates();
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    customerName: "",
    mobileNumber: "",
    email: "",
    address: "",
    quotationDate: "",
    serviceType: "",
    price: "",
    requirements: "",
    servicePackage: "",
    projectDeliverables: "",
    importantNote: "",
    scheduleTimeFrame: "",
    projectPaymentTerms: "",
    sampleOrCaseStudies: "",
    termsAndConditions: ""
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quotationsLoading && !enquiriesLoading && !templatesLoading) {
      const foundQuote = quotations.find((q) => q.id === id);
      if (foundQuote) {
        setQuotation(foundQuote);
        const foundEnquiry = enquiries.find((e) => e.id === foundQuote.enquiryId);
        if (foundEnquiry) {
          setEnquiry(foundEnquiry);
          
          if (!isDirty) {
            const currentTemplate = templates.find(t => t.id === foundQuote.serviceType);
            
            const createdDateStr = foundQuote.createdAt?.seconds 
               ? new Date(foundQuote.createdAt.seconds * 1000).toISOString().split('T')[0]
               : new Date().toISOString().split('T')[0];

            setFormData({
              companyName: foundEnquiry.companyName || "",
              customerName: foundQuote.customerName,
              mobileNumber: foundEnquiry.mobileNumber || "",
              email: foundEnquiry.email || "",
              address: foundEnquiry.address || "",
              quotationDate: foundQuote.quotationDate || createdDateStr,
              serviceType: foundQuote.serviceType,
              price: foundQuote.price.toString(),
              requirements: foundEnquiry.requirements || "",
              servicePackage: foundQuote.customTemplate?.servicePackage ?? currentTemplate?.servicePackage ?? "",
              projectDeliverables: foundQuote.customTemplate?.projectDeliverables ?? currentTemplate?.projectDeliverables ?? "",
              importantNote: foundQuote.customTemplate?.importantNote ?? currentTemplate?.importantNote ?? "",
              scheduleTimeFrame: foundQuote.customTemplate?.scheduleTimeFrame ?? currentTemplate?.scheduleTimeFrame ?? "",
              projectPaymentTerms: foundQuote.customTemplate?.projectPaymentTerms ?? currentTemplate?.projectPaymentTerms ?? "",
              sampleOrCaseStudies: foundQuote.customTemplate?.sampleOrCaseStudies ?? currentTemplate?.sampleOrCaseStudies ?? "",
              termsAndConditions: foundQuote.customTemplate?.termsAndConditions ?? currentTemplate?.termsAndConditions ?? "",
            });
          }
        }
      }
    }
  }, [id, quotations, enquiries, templates, quotationsLoading, enquiriesLoading, templatesLoading, isDirty]);

  const handleDownloadPdf = async () => {
    if (!printRef.current || !quotation) return;
    
    try {
      setIsGeneratingPdf(true);
      const element = printRef.current;
      
      const wmImg = document.getElementById('watermark-img') as HTMLImageElement;
      let wmBase64 = '';
      let wmWidth = 0;
      let wmHeight = 0;
      if (wmImg && wmImg.complete) {
        const canvas = document.createElement('canvas');
        canvas.width = wmImg.naturalWidth;
        canvas.height = wmImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.filter = 'grayscale(100%) opacity(10%)';
          ctx.drawImage(wmImg, 0, 0);
          wmBase64 = canvas.toDataURL('image/png');
          wmWidth = wmImg.naturalWidth;
          wmHeight = wmImg.naturalHeight;
        }
      }
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt: any = {
        margin: [12, 0, 12, 0],
        filename: `${quotation.serialNumber}_Quotation.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      
      await (html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          pdf.setDrawColor(218, 165, 32);
          pdf.setLineWidth(2);
          pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);
          
          if (wmBase64 && wmWidth > 0) {
            const w = 150;
            const h = (wmHeight * w) / wmWidth;
            pdf.addImage(wmBase64, 'PNG', (pdfWidth - w) / 2, (pdfHeight - h) / 2, w, h);
          }
        }
      }) as any).save();
      
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
        price: Number(formData.price),
        quotationDate: formData.quotationDate,
        customTemplate: {
          servicePackage: formData.servicePackage,
          projectDeliverables: formData.projectDeliverables,
          importantNote: formData.importantNote,
          scheduleTimeFrame: formData.scheduleTimeFrame,
          projectPaymentTerms: formData.projectPaymentTerms,
          sampleOrCaseStudies: formData.sampleOrCaseStudies,
          termsAndConditions: formData.termsAndConditions,
        }
      });
      await updateEnquiry(quotation.enquiryId, {
        companyName: formData.companyName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        address: formData.address,
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

  const headingStyle = {
    color: "#C5A059",
    fontWeight: "900",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Company name</label>
              <Input 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Customer name <span className="text-destructive">*</span></label>
              <Input 
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Mobile number <span className="text-destructive">*</span></label>
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <Input 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Quotation Date</label>
              <Input 
                name="quotationDate"
                type="date"
                value={formData.quotationDate}
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
                  <SelectItem value="Premium SEO">Premium SEO</SelectItem>
                  <SelectItem value="Website Development">Website Development</SelectItem>
                  <SelectItem value="AI Leads">AI Leads</SelectItem>
                  <SelectItem value="Software Solutions">Software Solutions</SelectItem>
                  <SelectItem value="Google Ads / Meta Ads">Google Ads / Meta Ads</SelectItem>
                  <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                  <SelectItem value="Premium Digital Marketing">Premium Digital Marketing</SelectItem>
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
            <RichEditor 
              value={formData.requirements}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, requirements: val }));
                setIsDirty(true);
              }}
              className="bg-background min-h-[100px]"
            />
          </div>
        </div>

        {/* Quotation Template Details Card */}
        <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Quotation Template Details</h2>
            <p className="text-sm text-muted-foreground mt-1">Customize the deliverables, terms, and sections for this specific quotation.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Service Package Includes</label>
              <RichEditor 
                value={formData.servicePackage}
                onChange={(val) => { setFormData(prev => ({ ...prev, servicePackage: val })); setIsDirty(true); }}
                className="bg-background min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Project Deliverables</label>
              <RichEditor 
                value={formData.projectDeliverables}
                onChange={(val) => { setFormData(prev => ({ ...prev, projectDeliverables: val })); setIsDirty(true); }}
                className="bg-background min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Important Note</label>
              <RichEditor 
                value={formData.importantNote}
                onChange={(val) => { setFormData(prev => ({ ...prev, importantNote: val })); setIsDirty(true); }}
                className="bg-background min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Schedule Time Frame & Project Duration</label>
              <RichEditor 
                value={formData.scheduleTimeFrame}
                onChange={(val) => { setFormData(prev => ({ ...prev, scheduleTimeFrame: val })); setIsDirty(true); }}
                className="bg-background min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Project Payment Terms</label>
              <RichEditor 
                value={formData.projectPaymentTerms}
                onChange={(val) => { setFormData(prev => ({ ...prev, projectPaymentTerms: val })); setIsDirty(true); }}
                className="bg-background min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Sample or Case Studies</label>
              <RichEditor 
                value={formData.sampleOrCaseStudies}
                onChange={(val) => { setFormData(prev => ({ ...prev, sampleOrCaseStudies: val })); setIsDirty(true); }}
                className="bg-background min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Terms & Conditions</label>
              <RichEditor 
                value={formData.termsAndConditions}
                onChange={(val) => { setFormData(prev => ({ ...prev, termsAndConditions: val })); setIsDirty(true); }}
                className="bg-background min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Template (also used for Printing) */}
      <img id="watermark-img" src="/watermark.png" style={{ display: 'none' }} crossOrigin="anonymous" alt="watermark hidden" />
      <style type="text/css" media="print">
        {`@page { margin: 0; }`}
      </style>
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none print:static print:opacity-100 print:z-auto print:pointer-events-auto overflow-hidden h-0 print:h-auto print:overflow-visible">
        <div ref={printRef} className="print:block w-[794px] print:w-full" style={{ backgroundColor: "#ffffff", color: "#1e3a8a", fontFamily: "Arial, Helvetica, sans-serif", paddingBottom: "1px", boxSizing: "border-box" }}>
          <div style={{ padding: "0 15mm" }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6" style={{ borderBottom: "2px solid #DAA520" }}>
              <div className="flex items-center gap-4">
                <img src="/logo.png?v=3" alt="Digital Dictionary Logo" style={{ maxHeight: "120px", objectFit: "contain" }} />
              </div>
              <div className="text-right text-sm flex flex-col items-end" style={{ color: "#1e3a8a" }}>
                <div className="flex flex-col items-end mb-2">
                  <p className="font-black m-0 leading-tight" style={{ fontSize: "24px", color: "#1e3a8a", letterSpacing: "1px" }}>
                    📱 +91 6291111428
                  </p>
                  <p className="font-bold m-0 mt-1" style={{ fontSize: "15px", color: "#1e3a8a", letterSpacing: "0.5px" }}>
                    ☎️ +91 6297868104 (Office)
                  </p>
                </div>
                <p className="mb-1 font-medium">📧 admin07digitaldictionary@gmail.com</p>
                <p className="mb-1 font-medium">🌐 www.digitaldictionary.in</p>
                <p className="m-0 font-medium" style={{ color: "#1e3a8a" }}>📍 Neelkamal Shopping Plaza, D.L.Roy Sarani, Ward 6, Siliguri, WB 734001</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex justify-between items-center mb-8 font-bold text-sm" style={{ color: "#C5A059" }}>
              <span>QUOTATION ID : {quotation.serialNumber}</span>
              <span>Date : {formData.quotationDate ? new Date(formData.quotationDate).toLocaleDateString('en-GB').replace(/\//g, '-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
            </div>

            {/* Customer */}
            <div className="mb-10 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h3 className="text-sm mb-3 uppercase tracking-wider" style={headingStyle}>
                <UserCircle size={18} /> CUSTOMER DETAILS
              </h3>
              {formData.companyName && <p className="text-lg font-bold uppercase m-0" style={{ color: "#d97706" }}>{formData.companyName}</p>}
              <p className={formData.companyName ? "m-0 font-semibold uppercase" : "text-lg font-bold uppercase m-0"} style={formData.companyName ? { color: "#1e3a8a" } : { color: "#d97706" }}>
                {formData.customerName || "Customer Name"}
              </p>
              {formData.email && <p className="m-0 uppercase" style={{ color: "#1e3a8a" }}>{formData.email}</p>}
              <p className="m-0" style={{ color: "#1e3a8a" }}>{formData.mobileNumber || "NO NUMBER PROVIDED"}</p>
              {formData.address && <p className="m-0 uppercase whitespace-pre-wrap mt-1" style={{ color: "#1e3a8a", fontSize: "11px" }}>{formData.address}</p>}
            </div>

            {/* Service Title */}
            <div className="mb-6 print:mt-8" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h2 className="text-xl font-bold uppercase m-0" style={headingStyle}>
                <Settings2 size={24} /> {currentTemplate?.id || `${formData.serviceType.toUpperCase()} SERVICE`}
              </h2>
            </div>

            {/* Boilerplate or Requirements */}
            <>
              <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                  <ListChecks size={16} /> REQUIREMENTS & SCOPE
                </h4>
                <div 
                  className="text-xs whitespace-pre-wrap" 
                  style={{ color: "#1e3a8a" }} 
                  dangerouslySetInnerHTML={{ __html: (formData.requirements || "No specific requirements provided.").replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }}
                />
              </div>

              {formData.servicePackage && (
                <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                    <PackageCheck size={16} /> SERVICE PACKAGE INCLUDES
                  </h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#1e3a8a" }} dangerouslySetInnerHTML={{ __html: formData.servicePackage.replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }} />
                </div>
              )}
              {formData.projectDeliverables && (
                <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                    <Target size={16} /> PROJECT DELIVERABLES
                  </h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#1e3a8a" }} dangerouslySetInnerHTML={{ __html: formData.projectDeliverables.replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }} />
                </div>
              )}
              {formData.importantNote && (
                <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                    <AlertCircle size={16} /> IMPORTANT NOTE
                  </h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#1e3a8a" }} dangerouslySetInnerHTML={{ __html: formData.importantNote.replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }} />
                </div>
              )}
              {formData.scheduleTimeFrame && (
                <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                    <Clock size={16} /> SCHEDULE TIME FRAME & PROJECT DURATION
                  </h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#1e3a8a" }} dangerouslySetInnerHTML={{ __html: formData.scheduleTimeFrame.replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }} />
                </div>
              )}
              
              {formData.projectPaymentTerms && (
                <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                    <Banknote size={16} /> PROJECT PAYMENT TERMS
                  </h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#1e3a8a" }} dangerouslySetInnerHTML={{ __html: formData.projectPaymentTerms.replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }} />
                </div>
              )}
              {formData.sampleOrCaseStudies && (
                <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                    <LineChart size={16} /> SAMPLE OR CASE STUDIES
                  </h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#1e3a8a" }} dangerouslySetInnerHTML={{ __html: formData.sampleOrCaseStudies.replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }} />
                </div>
              )}
              {formData.termsAndConditions && (
                <div className="mb-6 print:pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-sm font-bold uppercase mb-3" style={headingStyle}>
                    <ShieldAlert size={16} /> TERMS & CONDITIONS
                  </h4>
                  <div className="text-xs whitespace-pre-wrap" style={{ color: "#1e3a8a" }} dangerouslySetInnerHTML={{ __html: formData.termsAndConditions.replace(/color:\s*(#000000|black|rgb\(0,\s*0,\s*0\))/gi, "color: #17365D") }} />
                </div>
              )}
            </>
            
            {/* Spacer to push footer down (if flex was used, but here it's just flow) */}
            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Container (keeps Amount and Address together to prevent slicing) */}
            <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: '3rem' }}>
              {/* Footer content - Amount and Sign */}
              <div className="flex justify-between items-end mb-8 pt-8" style={{ borderTop: "1px solid #b8860b" }}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold" style={{ color: "#1e3a8a" }}>Amount:</span>
                    <span className="text-2xl font-black" style={{ color: "#1e3a8a" }}>₹ {Number(formData.price).toLocaleString("en-IN")}/-</span>
                  </div>
                  <div className="text-sm p-3" style={{ color: "#1e3a8a", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <p className="font-bold mb-1" style={{ color: "#d97706" }}>Bank Details:</p>
                    <p className="m-0 font-bold">Digital Dictionary</p>
                    <p className="m-0">Axis Bank Bagdogra Branch</p>
                    <p className="m-0">Account No: <span className="font-bold">926020029844176</span></p>
                    <p className="m-0">IFSC Code: <span className="font-bold">UTIB0005857</span></p>
                  </div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <img src="/stamp.png" crossOrigin="anonymous" alt="Digital Dictionary Stamp" style={{ width: "160px", height: "auto" }} className="mb-2" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
