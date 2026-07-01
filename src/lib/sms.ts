import { formatDate, formatDateTime, getStatusInfo } from "@/lib/utils";

const SMS_API_URL =
  process.env.SWIFTSMS_API_URL ?? "https://swiftsms.macroit.org/api/send_message";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function isSmsConfigured() {
  return !!(
    process.env.SWIFTSMS_API_TOKEN &&
    process.env.SWIFTSMS_SENDER_ID
  );
}

/** Normalize phone numbers for SwiftSMS (international format without +). */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("260") && digits.length >= 12) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length >= 10) {
    return `260${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `260${digits}`;
  }

  return digits;
}

async function sendSms(numbers: string, message: string) {
  if (!isSmsConfigured()) {
    console.warn("[sms] SwiftSMS not configured — skipping SMS");
    return;
  }

  const response = await fetch(SMS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.SWIFTSMS_API_TOKEN}`,
    },
    body: JSON.stringify({
      sender_id: process.env.SWIFTSMS_SENDER_ID,
      numbers,
      message,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`SwiftSMS request failed (${response.status}): ${body}`);
  }
}

export interface ShipmentCreatedSmsParams {
  to: string;
  receiverName: string;
  trackingNumber: string;
  description: string;
  senderName: string;
  originLocation: string;
  destinationLocation: string;
  expectedDeliveryDate?: Date | null;
}

export async function sendShipmentCreatedSms(p: ShipmentCreatedSmsParams) {
  const phone = normalizePhoneNumber(p.to);
  if (!phone) return;

  const trackUrl = `${APP_URL}/track/${p.trackingNumber}`;
  const estDelivery = p.expectedDeliveryDate
    ? `\nEst. delivery: ${formatDate(p.expectedDeliveryDate)}`
    : "";

  const message = [
    `Hi ${p.receiverName}, your shipment is registered with FastCargo.`,
    `Tracking #: ${p.trackingNumber}`,
    `From: ${p.originLocation}`,
    `To: ${p.destinationLocation}`,
    `Sender: ${p.senderName}`,
    `Item: ${p.description}${estDelivery}`,
    `Track: ${trackUrl}`,
  ].join("\n");

  await sendSms(phone, message);
}

export interface StatusUpdateSmsParams {
  to: string;
  receiverName: string;
  trackingNumber: string;
  newStatus: string;
  currentLocation: string;
  description: string;
  destinationLocation: string;
  timestamp: Date;
  expectedDeliveryDate?: Date | null;
}

export async function sendStatusUpdateSms(p: StatusUpdateSmsParams) {
  const phone = normalizePhoneNumber(p.to);
  if (!phone) return;

  const trackUrl = `${APP_URL}/track/${p.trackingNumber}`;
  const statusLabel = getStatusInfo(p.newStatus).label;
  const estDelivery =
    p.expectedDeliveryDate && p.newStatus !== "DELIVERED"
      ? `\nEst. delivery: ${formatDate(p.expectedDeliveryDate)}`
      : "";

  const message = [
    `Hi ${p.receiverName}, shipment update from FastCargo.`,
    `Tracking #: ${p.trackingNumber}`,
    `Status: ${statusLabel}`,
    `Location: ${p.currentLocation}`,
    `Note: ${p.description}`,
    `Destination: ${p.destinationLocation}`,
    `Updated: ${formatDateTime(p.timestamp)}${estDelivery}`,
    `Track: ${trackUrl}`,
  ].join("\n");

  await sendSms(phone, message);
}
