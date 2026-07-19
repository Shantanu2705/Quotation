"use client";

import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  };

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 transition-colors print:hidden">
      <div></div>

      <div className="flex items-center gap-4 ml-auto">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-accent text-foreground transition-colors"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold shadow-sm overflow-hidden">
          {/* Avatar Placeholder */}
          AD
        </div>
      </div>
    </header>
  );
}
