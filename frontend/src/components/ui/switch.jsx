import * as React from "react";
import { cn } from "@/lib/utils";

export const Switch = ({ checked, onCheckedChange }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "w-12 h-6 flex items-center bg-gray-200 rounded-full p-1 transition-all",
      checked && "bg-blue-600"
    )}
  >
    <div
      className={cn(
        "bg-white w-4 h-4 rounded-full shadow-md transform transition-transform",
        checked ? "translate-x-6" : "translate-x-0"
      )}
    />
  </button>
);