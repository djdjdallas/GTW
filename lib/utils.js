import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class names and de-duplicate conflicting Tailwind utilities.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format an integer number of cents as a USD string, eg 850 becomes "$8.50".
export function formatPrice(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);
}

export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
