"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Enquiries", href: "/dashboard/enquiries", icon: MessageSquare },
  { name: "Quotations", href: "/dashboard/quotations", icon: FileText },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Templates", href: "/dashboard/templates", icon: BookOpen },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      className="bg-sidebar border-r border-sidebar-border text-sidebar-foreground h-screen flex flex-col relative transition-all duration-300 print:hidden"
    >
      <div className="flex items-center justify-center p-4 border-b border-sidebar-border min-h-[100px]">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center w-full px-2"
          >
            <img 
              src="/logo.png?v=4" 
              alt="Digital Dictionary Logo" 
              className="w-56 h-auto object-contain" 
            />
          </motion.div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <img src="/logo.png?v=4" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-sidebar border border-sidebar-border rounded-full p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", collapsed && "mx-auto")} />
                {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={async () => {
            const { signOut } = await import("firebase/auth");
            const { auth } = await import("@/firebase/auth");
            await signOut(auth);
            // Next.js router is already imported at the top of the file via next/navigation? Wait, it's not. I'll just use window.location.href
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut size={20} className={cn("shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
