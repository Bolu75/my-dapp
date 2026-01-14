import * as React from "react";
import { cn } from "@/lib/utils";

export const Separator = ({ className = "" }) => (
  <div className={cn("border-t border-gray-200 my-2", className)} />
);