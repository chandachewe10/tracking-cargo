import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  const { trackingNumber } = await params;

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: trackingNumber.toUpperCase() },
    include: {
      trackingHistory: {
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!shipment) {
    return NextResponse.json(
      { error: "Shipment not found. Please check your tracking number." },
      { status: 404 }
    );
  }

  // Return public data (no sensitive admin info)
  return NextResponse.json({
    trackingNumber: shipment.trackingNumber,
    description: shipment.description,
    senderName: shipment.senderName,
    receiverName: shipment.receiverName,
    originLocation: shipment.originLocation,
    destinationLocation: shipment.destinationLocation,
    currentLocation: shipment.currentLocation,
    status: shipment.status,
    expectedDeliveryDate: shipment.expectedDeliveryDate,
    deliveredAt: shipment.deliveredAt,
    createdAt: shipment.createdAt,
    trackingHistory: shipment.trackingHistory.map((h) => ({
      id: h.id,
      status: h.status,
      location: h.location,
      description: h.description,
      timestamp: h.timestamp,
    })),
  });
}
