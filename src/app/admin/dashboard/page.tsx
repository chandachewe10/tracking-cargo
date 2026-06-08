import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { getStatusInfo, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    total,
    delivered,
    inTransit,
    pending,
    recentShipments,
    shipmentsLast30,
  ] = await Promise.all([
    prisma.shipment.count(),
    prisma.shipment.count({ where: { status: "DELIVERED" } }),
    prisma.shipment.count({ where: { status: { in: ["IN_TRANSIT", "DISPATCHED", "OUT_FOR_DELIVERY", "AT_HUB"] } } }),
    prisma.shipment.count({ where: { status: "PENDING" } }),
    prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        trackingNumber: true,
        receiverName: true,
        destinationLocation: true,
        status: true,
        createdAt: true,
        currentLocation: true,
      },
    }),
    prisma.shipment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const stats = [
    {
      label: "Total Shipments",
      value: total,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      change: `+${shipmentsLast30} this month`,
    },
    {
      label: "In Transit",
      value: inTransit,
      icon: Truck,
      color: "bg-yellow-50 text-yellow-600",
      change: `${total > 0 ? Math.round((inTransit / total) * 100) : 0}% of total`,
    },
    {
      label: "Delivered",
      value: delivered,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      change: `${deliveryRate}% success rate`,
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
      change: "Awaiting dispatch",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name || "Admin"}
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your shipments today.
          </p>
        </div>
        <Link href="/admin/shipments/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          New Shipment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Alert for overdue */}
      {pending > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {pending} shipment{pending > 1 ? "s" : ""} pending dispatch
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review and update status for pending shipments.{" "}
              <Link href="/admin/shipments?status=PENDING" className="underline">
                View pending
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Recent Shipments */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Shipments</h2>
          <Link href="/admin/shipments" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        {recentShipments.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No shipments yet.</p>
            <Link href="/admin/shipments/new" className="btn-primary mt-4 inline-flex">
              Create First Shipment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking #
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Destination
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Current Location
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentShipments.map((s) => {
                  const statusInfo = getStatusInfo(s.status);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <code className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {s.trackingNumber}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-900">{s.receiverName}</td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {s.destinationLocation}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {s.currentLocation}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/shipments/${s.id}`}
                          className="text-blue-600 text-sm hover:underline whitespace-nowrap"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
