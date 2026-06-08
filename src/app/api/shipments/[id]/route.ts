import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      trackingHistory: {
        orderBy: { timestamp: "desc" },
        include: { updatedBy: { select: { name: true, email: true } } },
      },
    },
  });

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  return NextResponse.json(shipment);
}

export async function PATCH(
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

    const existing = await prisma.shipment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const fields = [
      "description", "weight", "dimensions", "senderName", "senderPhone",
      "senderEmail", "receiverName", "receiverPhone", "receiverEmail",
      "originLocation", "destinationLocation", "expectedDeliveryDate",
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        if (field === "expectedDeliveryDate") {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else if (field === "weight") {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      action: "UPDATE_SHIPMENT",
      entityType: "Shipment",
      entityId: id,
      shipmentId: id,
      details: `Updated shipment ${existing.trackingNumber}`,
    });

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Error updating shipment:", error);
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    await prisma.shipment.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      action: "DELETE_SHIPMENT",
      entityType: "Shipment",
      entityId: id,
      details: `Deleted shipment ${shipment.trackingNumber}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    return NextResponse.json({ error: "Failed to delete shipment" }, { status: 500 });
  }
}
