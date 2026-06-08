import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { sendStatusUpdateEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, location, description } = body;

    if (!status || !location || !description) {
      return NextResponse.json(
        { error: "status, location, and description are required" },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const now = new Date();

    const [trackingEntry] = await Promise.all([
      prisma.trackingHistory.create({
        data: {
          shipmentId: id,
          status,
          location,
          description,
          updatedById: session.user.id,
        },
        include: { updatedBy: { select: { name: true, email: true } } },
      }),
      prisma.shipment.update({
        where: { id },
        data: {
          status,
          currentLocation: location,
          ...(status === "DELIVERED" ? { deliveredAt: now } : {}),
        },
      }),
    ]);

    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      action: "UPDATE_TRACKING",
      entityType: "Shipment",
      entityId: id,
      shipmentId: id,
      details: `Updated tracking: ${status} at ${location} — ${description}`,
    });

    // Send email notification to receiver if email exists
    if (shipment.receiverEmail) {
      try {
        await sendStatusUpdateEmail({
          to: shipment.receiverEmail,
          receiverName: shipment.receiverName,
          trackingNumber: shipment.trackingNumber,
          newStatus: status,
          currentLocation: location,
          description,
          destinationLocation: shipment.destinationLocation,
          timestamp: now,
          expectedDeliveryDate: shipment.expectedDeliveryDate,
        });
      } catch (emailErr) {
        console.error("Email send failed (non-fatal):", emailErr);
      }
    }

    return NextResponse.json(trackingEntry, { status: 201 });
  } catch (error) {
    console.error("Error adding tracking:", error);
    return NextResponse.json({ error: "Failed to add tracking update" }, { status: 500 });
  }
}
