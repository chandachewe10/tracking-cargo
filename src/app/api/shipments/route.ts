import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateTrackingNumber } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { sendShipmentCreatedEmail } from "@/lib/email";
import { sendShipmentCreatedSms } from "@/lib/sms";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { trackingNumber: { contains: search } },
              { senderName: { contains: search } },
              { receiverName: { contains: search } },
              { description: { contains: search } },
              { originLocation: { contains: search } },
              { destinationLocation: { contains: search } },
            ],
          }
        : {},
      status ? { status } : {},
    ],
  };

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.shipment.count({ where }),
  ]);

  return NextResponse.json({ shipments, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const trackingNumber = generateTrackingNumber();

    // Receiver email is required
    if (!body.receiverEmail) {
      return NextResponse.json(
        { error: "Receiver email address is required to send tracking notifications." },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        description: body.description,
        weight: body.weight ? parseFloat(body.weight) : null,
        dimensions: body.dimensions || null,
        senderName: body.senderName,
        senderPhone: body.senderPhone,
        senderEmail: body.senderEmail || null,
        receiverName: body.receiverName,
        receiverPhone: body.receiverPhone,
        receiverEmail: body.receiverEmail,
        originLocation: body.originLocation,
        destinationLocation: body.destinationLocation,
        currentLocation: body.originLocation,
        status: "LOADED",
        expectedDeliveryDate: body.expectedDeliveryDate
          ? new Date(body.expectedDeliveryDate)
          : null,
      },
    });

    // Initial tracking entry
    await prisma.trackingHistory.create({
      data: {
        shipmentId: shipment.id,
        status: "LOADED",
        location: body.originLocation,
        description: "Cargo loaded and registered in the system",
        updatedById: session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      action: "CREATE_SHIPMENT",
      entityType: "Shipment",
      entityId: shipment.id,
      shipmentId: shipment.id,
      details: `Created shipment ${trackingNumber} for ${body.receiverName}`,
    });

    // Send confirmation email and SMS to receiver
    try {
      await sendShipmentCreatedEmail({
        to: body.receiverEmail,
        receiverName: body.receiverName,
        trackingNumber,
        description: body.description,
        senderName: body.senderName,
        originLocation: body.originLocation,
        destinationLocation: body.destinationLocation,
        expectedDeliveryDate: shipment.expectedDeliveryDate,
      });
    } catch (emailErr) {
      console.error("Email send failed (non-fatal):", emailErr);
    }

    if (body.receiverPhone) {
      try {
        await sendShipmentCreatedSms({
          to: body.receiverPhone,
          receiverName: body.receiverName,
          trackingNumber,
          description: body.description,
          senderName: body.senderName,
          originLocation: body.originLocation,
          destinationLocation: body.destinationLocation,
          expectedDeliveryDate: shipment.expectedDeliveryDate,
        });
      } catch (smsErr) {
        console.error("SMS send failed (non-fatal):", smsErr);
      }
    }

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}
