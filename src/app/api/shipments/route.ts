import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateTrackingNumber } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";

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
        receiverEmail: body.receiverEmail || null,
        originLocation: body.originLocation,
        destinationLocation: body.destinationLocation,
        currentLocation: body.originLocation,
        status: "PENDING",
        expectedDeliveryDate: body.expectedDeliveryDate
          ? new Date(body.expectedDeliveryDate)
          : null,
      },
    });

    // Initial tracking entry
    await prisma.trackingHistory.create({
      data: {
        shipmentId: shipment.id,
        status: "PENDING",
        location: body.originLocation,
        description: "Shipment created and registered in system",
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

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}
