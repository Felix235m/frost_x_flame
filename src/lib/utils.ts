import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, letting later Tailwind utilities win.
 *
 * Kept in a plain module (no "use client") so both server and client components
 * can call it. Importing a function out of a "use client" module into a server
 * component fails at runtime.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
