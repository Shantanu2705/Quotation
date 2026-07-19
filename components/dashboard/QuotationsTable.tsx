"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Quotation } from "@/hooks/useQuotations";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QuotationsTable({ 
  data, 
  loading,
  onDelete,
  onStatusChange
}: { 
  data: Quotation[], 
  loading: boolean,
  onDelete?: (quotationId: string, enquiryId: string) => void,
  onStatusChange?: (quotationId: string, newStatus: Quotation["status"]) => void
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((quote) => 
    quote.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0 pb-4">
        <div>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>
            A complete list of generated quotations and their statuses.
          </CardDescription>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search serial or customer..."
            className="w-full pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
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
                  <TableHead>Quotation #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No quotations found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((quote) => {
                    // Handle Firestore timestamps vs JS dates
                    const date = quote.createdAt?.toDate ? quote.createdAt.toDate() : new Date(quote.createdAt);
                    
                    let statusVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
                    if (quote.status === "Sent") statusVariant = "default";
                    if (quote.status === "Confirmed") statusVariant = "outline";

                    return (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          <Link href={`/dashboard/quotations/${quote.id}`} className="text-primary hover:underline">
                            {quote.serialNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">{quote.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-background">
                            {quote.serviceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {date ? format(date, "MMM dd, yyyy") : "Just now"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{quote.price.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select 
                            value={quote.status} 
                            onValueChange={(val: any) => onStatusChange?.(quote.id, val)}
                          >
                            <SelectTrigger className="w-[120px] h-8 ml-auto text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Sent">Sent</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this quotation?")) {
                                onDelete?.(quote.id, quote.enquiryId);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
