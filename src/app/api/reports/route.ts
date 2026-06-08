import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalShipments,
    activeShipments,
    deliveredShipments,
    pendingShipments,
    shipmentsLast30Days,
    shipmentsLast7Days,
    statusBreakdown,
    recentShipments,
    topDestinations,
  ] = await Promise.all([
    prisma.shipment.count(),
    prisma.shipment.count({
      where: {
        status: { notIn: ["DELIVERED", "RETURNED", "FAILED"] },
      },
    }),
    prisma.shipment.count({ where: { status: "DELIVERED" } }),
    prisma.shipment.count({ where: { status: "PENDING" } }),
    prisma.shipment.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.shipment.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.shipment.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        trackingNumber: true,
        receiverName: true,
        status: true,
        createdAt: true,
        destinationLocation: true,
      },
    }),
    prisma.shipment.groupBy({
      by: ["destinationLocation"],
      _count: { destinationLocation: true },
      orderBy: { _count: { destinationLocation: "desc" } },
      take: 5,
    }),
  ]);

  // Daily shipments for last 30 days
  const allShipmentsLast30 = await prisma.shipment.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, status: true },
  });

  const dailyMap: Record<string, { date: string; created: number; delivered: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap[key] = { date: key, created: 0, delivered: 0 };
  }

  for (const s of allShipmentsLast30) {
    const key = new Date(s.createdAt).toISOString().split("T")[0];
    if (dailyMap[key]) {
      dailyMap[key].created++;
      if (s.status === "DELIVERED") dailyMap[key].delivered++;
    }
  }

  const dailyTrend = Object.values(dailyMap);

  return NextResponse.json({
    summary: {
      total: totalShipments,
      active: activeShipments,
      delivered: deliveredShipments,
      pending: pendingShipments,
      last30Days: shipmentsLast30Days,
      last7Days: shipmentsLast7Days,
      deliveryRate: totalShipments
        ? Math.round((deliveredShipments / totalShipments) * 100)
        : 0,
    },
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count.status,
    })),
    dailyTrend,
    recentShipments,
    topDestinations: topDestinations.map((d) => ({
      location: d.destinationLocation,
      count: d._count.destinationLocation,
    })),
  });
}
