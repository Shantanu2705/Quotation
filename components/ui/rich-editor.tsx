"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function RichEditor({ value, onChange, className, placeholder }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize and update content if value changes externally (e.g. initial load)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold', false);
      handleInput();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic', false);
      handleInput();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline', false);
      handleInput();
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[100px] overflow-auto",
        className
      )}
      onInput={handleInput}
      onBlur={handleInput}
      onKeyDown={handleKeyDown}
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      data-placeholder={placeholder}
    />
  );
}
