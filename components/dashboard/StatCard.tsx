"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, delay = 0 }: StatCardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:shadow-md transition-shadow overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</span>
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              {icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {trend !== undefined && (
              <div className={cn("flex items-center text-sm font-medium", isPositive ? "text-emerald-500" : "text-rose-500")}>
                {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
