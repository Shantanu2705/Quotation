"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEnquiries } from "@/hooks/useEnquiries";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

const formSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  mobileNumber: z.string().min(7, "Mobile number is required"),
  requirements: z.string().min(2, "Requirements are required"),
  serviceType: z.enum(["SEO", "Website Development", "AI Leads", "Software Solutions", "Google Ads / Meta Ads", "Digital Marketing"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled", "quotation_sent"]),
});

export function NewEnquiryDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addEnquiry } = useEnquiries();

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      email: "",
      mobileNumber: "",
      requirements: "",
      serviceType: "Website Development",
      status: "pending",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await addEnquiry(values);
    setIsSubmitting(false);
    setOpen(false);
    reset();
  };

  const watchServiceType = watch("serviceType");
  const watchStatus = watch("status");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="shrink-0 group">
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
            New Enquiry
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Enquiry</DialogTitle>
          <DialogDescription>
            Create a new client enquiry for IT services.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input id="customerName" {...register("customerName")} placeholder="John Doe" />
            {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input id="mobileNumber" {...register("mobileNumber")} placeholder="+1 555-0000" />
              {errors.mobileNumber && <p className="text-xs text-destructive">{errors.mobileNumber.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements / Notes</Label>
            <Input id="requirements" {...register("requirements")} placeholder="Briefly describe the project..." />
            {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={watchServiceType} onValueChange={(v) => setValue("serviceType", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
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
              <Label>Status</Label>
              <Select value={watchStatus} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="quotation_sent">Quotation Sent</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Enquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
