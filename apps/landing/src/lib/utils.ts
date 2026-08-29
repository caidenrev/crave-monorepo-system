import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const POS_URL = import.meta.env['VITE_POS_URL'] || 
  (import.meta.env['DEV'] ? "http://localhost:8081" : "https://crave-pos-hackton.vercel.app");

