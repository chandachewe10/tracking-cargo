import { Resend } from "resend";
import { getStatusInfo, formatDate, formatDateTime } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM ?? "TrackIt <onboarding@resend.dev>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

// ─── Shared styles ────────────────────────────────────────────────────────────
const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  margin: 0; padding: 0;
`;

function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="${BASE_STYLE}">
  <div style="max-width:600px;margin:32px auto;padding:0 16px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);border-radius:16px 16px 0 0;padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:20px;">📦</span>
        </div>
        <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">TrackIt</span>
      </div>
    </div>
    <!-- Body -->
    <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">
      <p style="margin:0;">© ${new Date().getFullYear()} TrackIt Cargo &amp; Parcel Tracking</p>
      <p style="margin:4px 0 0;">You are receiving this email because you have a shipment registered with us.</p>
    </div>
  </div>
</body>
</html>`;
}

function trackingBadge(status: string) {
  const info = getStatusInfo(status);
  const bgMap: Record<string, string> = {
    PENDING: "#f1f5f9", LOADED: "#e0f2fe", RECEIVED: "#dbeafe",
    DISPATCHED: "#e0e7ff", IN_TRANSIT: "#fef9c3", AT_HUB: "#ffedd5",
    OUT_FOR_DELIVERY: "#f3e8ff", DELIVERED: "#dcfce7",
    FAILED: "#fee2e2", RETURNED: "#ffe4e6",
  };
  const colorMap: Record<string, string> = {
    PENDING: "#475569", LOADED: "#0369a1", RECEIVED: "#1d4ed8",
    DISPATCHED: "#4338ca", IN_TRANSIT: "#a16207", AT_HUB: "#c2410c",
    OUT_FOR_DELIVERY: "#7e22ce", DELIVERED: "#15803d",
    FAILED: "#b91c1c", RETURNED: "#be123c",
  };
  return `<span style="display:inline-block;padding:5px 14px;border-radius:999px;font-size:13px;font-weight:600;background:${bgMap[status] ?? "#f1f5f9"};color:${colorMap[status] ?? "#475569"};">${info.label}</span>`;
}

function infoRow(label: string, value: string) {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:40%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;font-weight:500;vertical-align:top;">${value}</td>
  </tr>`;
}

// ─── 1. Shipment Created ──────────────────────────────────────────────────────
interface ShipmentCreatedParams {
  to: string;
  receiverName: string;
  trackingNumber: string;
  description: string;
  senderName: string;
  originLocation: string;
  destinationLocation: string;
  expectedDeliveryDate?: Date | null;
}

export async function sendShipmentCreatedEmail(params: ShipmentCreatedParams) {
  if (!process.env.RESEND_API_KEY) return;

  const trackUrl = `${APP_URL}/track/${params.trackingNumber}`;

  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a;">Your Shipment is Registered! 🎉</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hi <strong>${params.receiverName}</strong>, a shipment has been created for you. Here are the details:</p>

    <!-- Tracking Number Banner -->
    <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#3b82f6;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Tracking Number</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:#1d4ed8;font-family:monospace;letter-spacing:2px;">${params.trackingNumber}</p>
    </div>

    <!-- Details Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${infoRow("Status", trackingBadge("LOADED"))}
      ${infoRow("Description", params.description)}
      ${infoRow("From", params.senderName)}
      ${infoRow("Origin", params.originLocation)}
      ${infoRow("Destination", params.destinationLocation)}
      ${params.expectedDeliveryDate ? infoRow("Expected Delivery", formatDate(params.expectedDeliveryDate)) : ""}
    </table>

    <!-- Track Button -->
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${trackUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
        Track My Shipment →
      </a>
    </div>
    <p style="text-align:center;margin:12px 0 0;font-size:12px;color:#94a3b8;">Or visit: <a href="${trackUrl}" style="color:#3b82f6;">${trackUrl}</a></p>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `📦 Shipment Created — ${params.trackingNumber}`,
    html: emailWrapper(content),
  });
}

// ─── 2. Status / Location Update ─────────────────────────────────────────────
interface StatusUpdateParams {
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

export async function sendStatusUpdateEmail(params: StatusUpdateParams) {
  if (!process.env.RESEND_API_KEY) return;

  const trackUrl = `${APP_URL}/track/${params.trackingNumber}`;
  const isDelivered = params.newStatus === "DELIVERED";

  const subjectMap: Record<string, string> = {
    LOADED:           `📦 Cargo Loaded — ${params.trackingNumber}`,
    DISPATCHED:       `🚚 Shipment Dispatched — ${params.trackingNumber}`,
    IN_TRANSIT:       `🛣️ Shipment In Transit — ${params.trackingNumber}`,
    AT_HUB:           `🏭 Arrived at Hub — ${params.trackingNumber}`,
    OUT_FOR_DELIVERY: `🚴 Out for Delivery — ${params.trackingNumber}`,
    DELIVERED:        `✅ Shipment Delivered — ${params.trackingNumber}`,
    FAILED:           `⚠️ Delivery Attempt Failed — ${params.trackingNumber}`,
    RETURNED:         `↩️ Shipment Returned — ${params.trackingNumber}`,
  };

  const subject = subjectMap[params.newStatus] ?? `📍 Shipment Update — ${params.trackingNumber}`;

  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a;">
      ${isDelivered ? "Your Shipment Has Been Delivered! ✅" : "Shipment Status Update 📍"}
    </h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
      Hi <strong>${params.receiverName}</strong>, here is the latest update on your shipment.
    </p>

    <!-- Status Update Card -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="font-size:28px;">${isDelivered ? "✅" : "📍"}</span>
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Current Status</p>
          ${trackingBadge(params.newStatus)}
        </div>
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">📌 Current Location</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${params.currentLocation}</p>
      </div>
      <div style="margin-top:10px;">
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">💬 Update Note</p>
        <p style="margin:0;font-size:14px;color:#334155;">${params.description}</p>
      </div>
    </div>

    <!-- Details Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${infoRow("Tracking Number", `<code style="font-family:monospace;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${params.trackingNumber}</code>`)}
      ${infoRow("Destination", params.destinationLocation)}
      ${infoRow("Updated At", formatDateTime(params.timestamp))}
      ${params.expectedDeliveryDate && !isDelivered ? infoRow("Expected Delivery", formatDate(params.expectedDeliveryDate)) : ""}
    </table>

    ${isDelivered ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:15px;color:#15803d;font-weight:600;">🎉 Your package has been successfully delivered!</p>
      <p style="margin:6px 0 0;font-size:13px;color:#16a34a;">Thank you for using TrackIt.</p>
    </div>` : ""}

    <!-- Track Button -->
    <div style="text-align:center;margin:24px 0 8px;">
      <a href="${trackUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;text-decoration:none;padding:13px 30px;border-radius:10px;font-weight:600;font-size:14px;">
        View Full Tracking History →
      </a>
    </div>
    <p style="text-align:center;margin:10px 0 0;font-size:12px;color:#94a3b8;"><a href="${trackUrl}" style="color:#3b82f6;">${trackUrl}</a></p>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject,
    html: emailWrapper(content),
  });
}
