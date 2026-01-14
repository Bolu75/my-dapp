import * as React from "react";
import { cn } from "@/lib/utils";

export const Tooltip = ({ children }) => <div className="relative">{children}</div>;

export const TooltipTrigger = ({ children }) => <div>{children}</div>;

export const TooltipContent = ({ children, className = "" }) => (
  <div className={cn("absolute z-50 rounded-md bg-black text-white px-2 py-1 text-sm", className)}>
    {children}
  </div>
);