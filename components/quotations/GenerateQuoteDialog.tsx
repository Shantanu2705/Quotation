"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Enquiry, useEnquiries } from "@/hooks/useEnquiries";
import { useQuotations } from "@/hooks/useQuotations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";

export function GenerateQuoteDialog({ enquiry }: { enquiry: Enquiry }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [price, setPrice] = useState("");
  
  const { addQuotation } = useQuotations();
  const { updateEnquiry } = useEnquiries();
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price))) return;
    
    setIsSubmitting(true);
    
    // Generate Serial Number: DD-YYYY-XXXX (where XXXX is random 1000-9999)
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const serialNumber = `DD-${year}-${randomNum}`;
    
    try {
      // 1. Create the Quotation
      await addQuotation({
        serialNumber,
        enquiryId: enquiry.id,
        customerName: enquiry.customerName,
        serviceType: enquiry.serviceType,
        price: Number(price),
        status: 'Draft',
      });
      
      // 2. Update Enquiry Status to 'quotation_sent'
      await updateEnquiry(enquiry.id, {
        status: 'quotation_sent'
      });
      
      setOpen(false);
      // 3. Redirect to Quotations page
      router.push("/dashboard/quotations");
    } catch (error) {
      console.error("Failed to generate quote", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1 ml-2 text-primary border-primary/20 hover:bg-primary/10">
            <FileText className="h-3.5 w-3.5" />
            <span>Quote</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Quotation</DialogTitle>
          <DialogDescription>
            Create a new quotation for <strong>{enquiry.customerName}</strong> ({enquiry.serviceType}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleGenerate} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="price">Quotation Price (₹)</Label>
            <Input 
              id="price" 
              type="number"
              placeholder="e.g. 15000" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !price}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Quote"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
