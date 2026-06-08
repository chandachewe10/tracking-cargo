"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  PlusCircle,
  Package,
  Filter,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { getStatusInfo, formatDate, SHIPMENT_STATUSES } from "@/lib/utils";

interface Shipment {
  id: string;
  trackingNumber: string;
  description: string;
  senderName: string;
  receiverName: string;
  originLocation: string;
  destinationLocation: string;
  currentLocation: string;
  status: string;
  createdAt: string;
  expectedDeliveryDate: string | null;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/shipments?${params}`);
      const data = await res.json();
      setShipments(data.shipments || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(fetchShipments, 300);
    return () => clearTimeout(timer);
  }, [fetchShipments]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} shipment{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/shipments/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          New Shipment
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by tracking number, name, location..."
              className="input pl-9"
            />
          </div>
          <div className="relative sm:w-52">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input pl-9 appearance-none"
            >
              <option value="">All Statuses</option>
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchShipments}
            className="btn-secondary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No shipments found</p>
            <p className="text-gray-500 text-sm mt-1">
              {search || statusFilter ? "Try adjusting your filters" : "Create your first shipment to get started"}
            </p>
            {!search && !statusFilter && (
              <Link href="/admin/shipments/new" className="btn-primary mt-4 inline-flex">
                Create Shipment
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking #
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Sender → Receiver
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Route
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Created
                    </th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shipments.map((s) => {
                    const statusInfo = getStatusInfo(s.status);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <code className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            {s.trackingNumber}
                          </code>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm text-gray-900 font-medium max-w-xs truncate">
                            {s.description}
                          </p>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <p className="text-sm text-gray-700">{s.senderName}</p>
                          <p className="text-xs text-gray-400">→ {s.receiverName}</p>
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span>{s.originLocation} → {s.destinationLocation}</span>
                          </div>
                          <p className="text-xs text-blue-600 mt-0.5">
                            Currently: {s.currentLocation}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`badge ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500 hidden xl:table-cell">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/shipments/${s.id}`}
                            className="text-blue-600 text-sm hover:underline whitespace-nowrap"
                          >
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary p-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary p-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
