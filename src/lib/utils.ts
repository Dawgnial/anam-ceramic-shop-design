import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

export function formatPrice(num: number | string): string {
  const formatted = Number(num).toLocaleString('en-US');
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return formatted.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

export function generateOrderNumber(orderId: string, createdAt: string): string {
  // Extract digits from UUID and combine with date
  const dateObj = new Date(createdAt);
  const year = dateObj.getFullYear().toString().slice(-2);
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  // Get first 4 hex chars from UUID and convert to number
  const uuidPart = parseInt(orderId.replace(/-/g, '').slice(0, 6), 16) % 10000;
  const orderNum = String(uuidPart).padStart(4, '0');
  
  return `${year}${month}${day}-${orderNum}`;
}
