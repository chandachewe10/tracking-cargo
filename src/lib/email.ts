import nodemailer from "nodemailer";
import { getStatusInfo, formatDate, formatDateTime } from "@/lib/utils";

// ─── Transporter (reused across invocations in dev; fresh each call in prod) ──
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 465),
    secure: Number(process.env.MAIL_PORT ?? 465) === 465, // port 465 = implicit SSL
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // shared hosting certs are often self-signed
    },
  });
}

const FROM = `${process.env.MAIL_FROM_NAME ?? "TrackIt"} <${process.env.MAIL_FROM_ADDRESS ?? process.env.MAIL_USERNAME}>`;
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

// ─── Helper: check that env vars are present ──────────────────────────────────
function isEmailConfigured() {
  return !!(process.env.MAIL_HOST && process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD);
}

// ─── Shared HTML helpers ──────────────────────────────────────────────────────
function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0;">
  <div style="max-width:600px;margin:32px auto;padding:0 16px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);border-radius:16px 16px 0 0;padding:28px 32px;">
      <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">📦 TrackIt</span>
    </div>
    <!-- Body -->
    <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 4px 4px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">
      <p style="margin:0;">© ${new Date().getFullYear()} TrackIt — Cargo &amp; Parcel Tracking</p>
      <p style="margin:4px 0 0;">You received this because a shipment is registered to your email.</p>
    </div>
  </div>
</body>
</html>`;
}

function statusBadge(status: string) {
  const info = getStatusInfo(status);
  const bg: Record<string, string> = {
    PENDING:"#f1f5f9", LOADED:"#e0f2fe", RECEIVED:"#dbeafe",
    DISPATCHED:"#e0e7ff", IN_TRANSIT:"#fef9c3", AT_HUB:"#ffedd5",
    OUT_FOR_DELIVERY:"#f3e8ff", DELIVERED:"#dcfce7",
    FAILED:"#fee2e2", RETURNED:"#ffe4e6",
  };
  const fg: Record<string, string> = {
    PENDING:"#475569", LOADED:"#0369a1", RECEIVED:"#1d4ed8",
    DISPATCHED:"#4338ca", IN_TRANSIT:"#a16207", AT_HUB:"#c2410c",
    OUT_FOR_DELIVERY:"#7e22ce", DELIVERED:"#15803d",
    FAILED:"#b91c1c", RETURNED:"#be123c",
  };
  return `<span style="display:inline-block;padding:5px 14px;border-radius:999px;font-size:13px;font-weight:600;background:${bg[status]??"#f1f5f9"};color:${fg[status]??"#475569"};">${info.label}</span>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;font-weight:500;vertical-align:top;">${value}</td>
  </tr>`;
}

// ─── 1. Shipment Created ──────────────────────────────────────────────────────
export interface ShipmentCreatedParams {
  to: string;
  receiverName: string;
  trackingNumber: string;
  description: string;
  senderName: string;
  originLocation: string;
  destinationLocation: string;
  expectedDeliveryDate?: Date | null;
}

export async function sendShipmentCreatedEmail(p: ShipmentCreatedParams) {
  if (!isEmailConfigured()) {
    console.warn("[email] SMTP not configured — skipping shipment created email");
    return;
  }

  const trackUrl = `${APP_URL}/track/${p.trackingNumber}`;

  const html = emailWrapper(`
    <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a;">Your Shipment is Registered! 🎉</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
      Hi <strong>${p.receiverName}</strong>, a shipment has been created for you.
    </p>

    <!-- Tracking Number Banner -->
    <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;color:#3b82f6;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Your Tracking Number</p>
      <p style="margin:0;font-size:26px;font-weight:700;color:#1d4ed8;font-family:monospace;letter-spacing:3px;">${p.trackingNumber}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${row("Status", statusBadge("LOADED"))}
      ${row("Description", p.description)}
      ${row("Sender", p.senderName)}
      ${row("From", p.originLocation)}
      ${row("To", p.destinationLocation)}
      ${p.expectedDeliveryDate ? row("Est. Delivery", formatDate(p.expectedDeliveryDate)) : ""}
    </table>

    <div style="text-align:center;margin:28px 0 12px;">
      <a href="${trackUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;
                text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
        Track My Shipment &rarr;
      </a>
    </div>
    <p style="text-align:center;margin:8px 0 0;font-size:12px;color:#94a3b8;">
      Or copy this link: <a href="${trackUrl}" style="color:#3b82f6;">${trackUrl}</a>
    </p>
  `);

  await createTransporter().sendMail({
    from: FROM,
    to: p.to,
    subject: `📦 Shipment Registered — ${p.trackingNumber}`,
    html,
  });
}

// ─── 2. Status / Location Update ─────────────────────────────────────────────
export interface StatusUpdateParams {
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

export async function sendStatusUpdateEmail(p: StatusUpdateParams) {
  if (!isEmailConfigured()) {
    console.warn("[email] SMTP not configured — skipping status update email");
    return;
  }

  const trackUrl = `${APP_URL}/track/${p.trackingNumber}`;
  const isDelivered = p.newStatus === "DELIVERED";

  const subjectMap: Record<string, string> = {
    LOADED:           `📦 Cargo Loaded — ${p.trackingNumber}`,
    DISPATCHED:       `🚚 Shipment Dispatched — ${p.trackingNumber}`,
    IN_TRANSIT:       `🛣️ Shipment In Transit — ${p.trackingNumber}`,
    AT_HUB:           `🏭 Arrived at Hub — ${p.trackingNumber}`,
    OUT_FOR_DELIVERY: `🚴 Out for Delivery — ${p.trackingNumber}`,
    DELIVERED:        `✅ Delivered — ${p.trackingNumber}`,
    FAILED:           `⚠️ Delivery Attempt Failed — ${p.trackingNumber}`,
    RETURNED:         `↩️ Shipment Returned — ${p.trackingNumber}`,
  };

  const subject = subjectMap[p.newStatus] ?? `📍 Shipment Update — ${p.trackingNumber}`;

  const html = emailWrapper(`
    <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a;">
      ${isDelivered ? "Your Shipment Has Been Delivered! ✅" : "Shipment Update 📍"}
    </h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
      Hi <strong>${p.receiverName}</strong>, here is the latest update on your shipment.
    </p>

    <!-- Update Card -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;
                border-radius:0 12px 12px 0;padding:18px 20px;margin-bottom:24px;">
      <div style="margin-bottom:12px;">
        <p style="margin:0 0 6px;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Current Status</p>
        ${statusBadge(p.newStatus)}
      </div>
      <div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-bottom:10px;">
        <p style="margin:0 0 3px;font-size:11px;color:#64748b;">📌 Current Location</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${p.currentLocation}</p>
      </div>
      <div>
        <p style="margin:0 0 3px;font-size:11px;color:#64748b;">💬 Note</p>
        <p style="margin:0;font-size:14px;color:#334155;">${p.description}</p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${row("Tracking #", `<code style="font-family:monospace;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${p.trackingNumber}</code>`)}
      ${row("Destination", p.destinationLocation)}
      ${row("Updated", formatDateTime(p.timestamp))}
      ${p.expectedDeliveryDate && !isDelivered ? row("Est. Delivery", formatDate(p.expectedDeliveryDate)) : ""}
    </table>

    ${isDelivered ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:15px;color:#15803d;font-weight:700;">🎉 Package successfully delivered!</p>
      <p style="margin:6px 0 0;font-size:13px;color:#16a34a;">Thank you for choosing TrackIt.</p>
    </div>` : ""}

    <div style="text-align:center;margin:24px 0 10px;">
      <a href="${trackUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;
                text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        View Full Tracking History &rarr;
      </a>
    </div>
    <p style="text-align:center;margin:8px 0 0;font-size:12px;color:#94a3b8;">
      <a href="${trackUrl}" style="color:#3b82f6;">${trackUrl}</a>
    </p>
  `);

  await createTransporter().sendMail({
    from: FROM,
    to: p.to,
    subject,
    html,
  });
}
