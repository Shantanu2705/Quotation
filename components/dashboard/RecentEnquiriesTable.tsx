"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Enquiry } from "@/hooks/useEnquiries";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { EditEnquiryDialog } from "@/components/enquiries/EditEnquiryDialog";
import { GenerateQuoteDialog } from "@/components/quotations/GenerateQuoteDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEnquiries } from "@/hooks/useEnquiries";
import { toast } from "sonner";

export function RecentEnquiriesTable({ 
  data, 
  loading,
  hideHeader = false,
  fullList = false 
}: { 
  data: Enquiry[], 
  loading: boolean,
  hideHeader?: boolean,
  fullList?: boolean
}) {
  const { deleteEnquiry } = useEnquiries();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this enquiry? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteEnquiry(id);
      toast.success("Enquiry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete enquiry");
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm">
      {!hideHeader && (
        <CardHeader>
          <CardTitle>{fullList ? "All Enquiries" : "Recent Enquiries"}</CardTitle>
          <CardDescription>
            {fullList ? "A complete list of all enquiries." : "The latest incoming enquiries and their current status."}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={hideHeader ? "pt-6" : ""}>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service Required</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No recent enquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((enquiry, index) => {
                    // Handle Firestore timestamps vs JS dates
                    const date = enquiry.createdAt?.toDate ? enquiry.createdAt.toDate() : new Date(enquiry.createdAt);
                    
                    let statusVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
                    if (enquiry.status === "in_progress") statusVariant = "default";
                    if (enquiry.status === "quotation_sent") statusVariant = "default"; // maybe use primary or default
                    if (enquiry.status === "completed") statusVariant = "outline";
                    if (enquiry.status === "cancelled") statusVariant = "destructive";

                    return (
                      <TableRow key={enquiry.id}>
                        <TableCell className="font-medium">{enquiry.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-background">
                            {enquiry.serviceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                          {enquiry.requirements}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {date ? format(date, "MMM dd, yyyy") : "Just now"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <EditEnquiryDialog enquiry={enquiry} />
                            <GenerateQuoteDialog enquiry={enquiry} />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(enquiry.id)}
                              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground ml-1"
                              title="Delete Enquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            className="capitalize text-xs"
                            variant={statusVariant}
                          >
                            {enquiry.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
