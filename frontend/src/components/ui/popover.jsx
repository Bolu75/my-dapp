import * as React from "react";
import { cn } from "@/lib/utils";

export const Popover = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

export const PopoverTrigger = ({ children }) => {
  return <div className="cursor-pointer">{children}</div>;
};

export const PopoverContent = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-56 rounded-lg border bg-white text-black shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
};