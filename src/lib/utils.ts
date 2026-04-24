import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPrice(value: number | string, digits = 5) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toFixed(digits);
}

export function formatVolume(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString();
}
