import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function generateTrackingNumber(): string {
  const prefix = "TRK";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const SHIPMENT_STATUSES = [
  { value: "PENDING",          label: "Pending",            color: "bg-gray-100 text-gray-800"   },
  { value: "LOADED",           label: "Loaded",             color: "bg-sky-100 text-sky-800"     },
  { value: "RECEIVED",         label: "Received at Origin", color: "bg-blue-100 text-blue-800"   },
  { value: "DISPATCHED",       label: "Dispatched",         color: "bg-indigo-100 text-indigo-800" },
  { value: "IN_TRANSIT",       label: "In Transit",         color: "bg-yellow-100 text-yellow-800" },
  { value: "AT_HUB",           label: "Arrived at Hub",     color: "bg-orange-100 text-orange-800" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery",   color: "bg-purple-100 text-purple-800" },
  { value: "DELIVERED",        label: "Delivered",          color: "bg-green-100 text-green-800"  },
  { value: "FAILED",           label: "Delivery Failed",    color: "bg-red-100 text-red-800"     },
  { value: "RETURNED",         label: "Returned",           color: "bg-rose-100 text-rose-800"   },
];

export function getStatusInfo(status: string) {
  return SHIPMENT_STATUSES.find((s) => s.value === status) ?? {
    value: status,
    label: status,
    color: "bg-gray-100 text-gray-800",
  };
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
