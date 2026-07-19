"use client";

import { useState } from "react";
import { useTemplates, ServiceTemplate } from "@/hooks/useTemplates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function TemplatesPage() {
  const { templates, loading, updateTemplate } = useTemplates();
  const [selectedService, setSelectedService] = useState<string>("Website Development");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceTemplate>>({});

  const handleServiceChange = (serviceId: string | null) => {
    if (!serviceId) return;
    setSelectedService(serviceId);
    const template = templates.find(t => t.id === serviceId);
    if (template) {
      setFormData(template);
    }
  };

  // Initialize form data on first load
  if (!formData.id && templates.length > 0 && selectedService) {
    const template = templates.find(t => t.id === selectedService);
    if (template) {
      setFormData(template);
    }
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTemplate(selectedService, formData);
      toast.success("Template saved successfully.");
    } catch (err) {
      toast.error("Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage quotation templates for different services. These details will be automatically included in quotation PDFs.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Service</CardTitle>
              <CardDescription>Choose a service to edit its template</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedService} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Details - {selectedService}</CardTitle>
              <CardDescription>Edit the default text for {selectedService} quotations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Service Package / Features</Label>
                <Textarea 
                  value={formData.servicePackage || ""} 
                  onChange={e => setFormData({ ...formData, servicePackage: e.target.value })}
                  placeholder="Enter the features or package details..."
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Project Deliverables</Label>
                <Textarea 
                  value={formData.projectDeliverables || ""} 
                  onChange={e => setFormData({ ...formData, projectDeliverables: e.target.value })}
                  placeholder="Enter project deliverables..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Important Note</Label>
                <Textarea 
                  value={formData.importantNote || ""} 
                  onChange={e => setFormData({ ...formData, importantNote: e.target.value })}
                  placeholder="Enter any important notes..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Schedule Time Frame & Project Duration</Label>
                <Textarea 
                  value={formData.scheduleTimeFrame || ""} 
                  onChange={e => setFormData({ ...formData, scheduleTimeFrame: e.target.value })}
                  placeholder="Enter schedule and duration..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Project Payment Terms</Label>
                <Textarea 
                  value={formData.projectPaymentTerms || ""} 
                  onChange={e => setFormData({ ...formData, projectPaymentTerms: e.target.value })}
                  placeholder="Enter payment terms..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Sample or Case Studies</Label>
                <Textarea 
                  value={formData.sampleOrCaseStudies || ""} 
                  onChange={e => setFormData({ ...formData, sampleOrCaseStudies: e.target.value })}
                  placeholder="Enter samples or case studies..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Terms & Conditions</Label>
                <Textarea 
                  value={formData.termsAndConditions || ""} 
                  onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  placeholder="Enter terms and conditions..."
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
