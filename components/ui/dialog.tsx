"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-50 w-full max-w-lg mx-4 animate-fade-up">
        {children}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-white border shadow-lg rounded-none p-6 sm:p-8 max-h-[85vh] overflow-y-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

interface DialogTitleProps {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{children}</h2>
  );
};

interface DialogCloseProps {
  onClick: () => void;
}

const DialogClose: React.FC<DialogCloseProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label="Close"
    >
      <X className="w-5 h-5" />
    </button>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose };
