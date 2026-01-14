import * as React from "react";
import { cn } from "@/lib/utils";

export const Toast = ({ children }) => (
  <div className="fixed bottom-4 right-4 z-50">{children}</div>
);

export const ToastTitle = ({ children }) => (
  <div className="font-bold text-white">{children}</div>
);

export const ToastDescription = ({ children }) => (
  <div className="text-white">{children}</div>
);