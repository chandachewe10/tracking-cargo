"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Clock,
  Truck,
  Search,
  AlertCircle,
  Calendar,
  User,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { getStatusInfo, formatDate, formatDateTime } from "@/lib/utils";

interface TrackingEntry {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface ShipmentData {
  trackingNumber: string;
  description: string;
  senderName: string;
  receiverName: string;
  originLocation: string;
  destinationLocation: string;
  currentLocation: string;
  status: string;
  expectedDeliveryDate: string | null;
  deliveredAt: string | null;
  createdAt: string;
  trackingHistory: TrackingEntry[];
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  DELIVERED: <CheckCircle className="w-4 h-4" />,
  IN_TRANSIT: <Truck className="w-4 h-4" />,
  OUT_FOR_DELIVERY: <Truck className="w-4 h-4" />,
  PENDING: <Clock className="w-4 h-4" />,
  DISPATCHED: <Truck className="w-4 h-4" />,
};

export default function TrackingResultPage({ params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = use(params);
  const [data, setData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSearch, setNewSearch] = useState("");

  const fetchTracking = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trackingNumber)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Shipment not found");
      } else {
        setData(json);
      }
    } catch {
      setError("Failed to fetch tracking data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingNumber]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">TrackIt</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/track" className="btn-secondary text-sm py-1.5">
              <Search className="w-3.5 h-3.5" />
              New Search
            </Link>
            <button onClick={fetchTracking} className="btn-secondary text-sm py-1.5" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Looking up your shipment...</p>
            <code className="text-xs text-gray-400 mt-1">{trackingNumber}</code>
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Shipment Not Found</h2>
              <p className="text-gray-500 mb-2">{error}</p>
              <code className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                {trackingNumber}
              </code>
              <p className="text-sm text-gray-400 mt-4">
                Please double-check your tracking number and try again.
              </p>
            </div>

            {/* Search again */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Try Another Tracking Number</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newSearch.trim()) {
                    window.location.href = `/track/${encodeURIComponent(newSearch.trim())}`;
                  }
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={newSearch}
                  onChange={(e) => setNewSearch(e.target.value.toUpperCase())}
                  placeholder="Enter tracking number..."
                  className="input flex-1 font-mono"
                />
                <button type="submit" className="btn-primary">
                  Track
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 justify-center">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Status Hero */}
            <div className={`card p-6 ${data.status === "DELIVERED" ? "border-green-200 bg-green-50" : "bg-white"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {data.trackingNumber}
                    </code>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mt-2">{data.description}</h1>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm ${getStatusInfo(data.status).color}`}>
                    {STATUS_ICON[data.status] || <Package className="w-4 h-4" />}
                    {getStatusInfo(data.status).label}
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="mt-5 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{data.originLocation}</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 min-w-8 hidden sm:block" />
                <Truck className="w-4 h-4 text-gray-400 hidden sm:block" />
                <div className="flex-1 h-0.5 bg-gray-200 min-w-8 hidden sm:block" />
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{data.destinationLocation}</span>
                </div>
              </div>

              {/* Current Location */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Current Location</p>
                  <p className="text-sm text-blue-900 font-semibold">{data.currentLocation}</p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</span>
                </div>
                <p className="font-semibold text-gray-900">{formatDate(data.createdAt)}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {data.deliveredAt ? "Delivered" : "Expected Delivery"}
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {data.deliveredAt
                    ? formatDate(data.deliveredAt)
                    : data.expectedDeliveryDate
                    ? formatDate(data.expectedDeliveryDate)
                    : "To be confirmed"}
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recipient</span>
                </div>
                <p className="font-semibold text-gray-900">{data.receiverName}</p>
                <p className="text-xs text-gray-500">From: {data.senderName}</p>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Tracking Timeline</h2>
                <span className="text-xs text-gray-400 ml-auto">
                  {data.trackingHistory.length} event{data.trackingHistory.length !== 1 ? "s" : ""}
                </span>
              </div>

              {data.trackingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No tracking events yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back soon for updates.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {data.trackingHistory.map((entry, i) => {
                    const isFirst = i === 0;
                    const statusInfo = getStatusInfo(entry.status);
                    return (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 ${
                              isFirst
                                ? "bg-blue-600 ring-4 ring-blue-100"
                                : "bg-gray-300"
                            }`}
                          />
                          {i < data.trackingHistory.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-100 my-1 min-h-[32px]" />
                          )}
                        </div>
                        <div
                          className={`pb-5 flex-1 ${
                            i === data.trackingHistory.length - 1 ? "pb-0" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`badge ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                              {isFirst && (
                                <span className="text-xs font-semibold text-blue-600">
                                  Latest Update
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1 text-sm">{entry.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <p className="text-xs text-gray-500">{entry.location}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Track Another */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Track Another Shipment</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newSearch.trim()) {
                    window.location.href = `/track/${encodeURIComponent(newSearch.trim())}`;
                  }
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={newSearch}
                  onChange={(e) => setNewSearch(e.target.value.toUpperCase())}
                  placeholder="Enter tracking number..."
                  className="input flex-1 font-mono text-sm"
                />
                <button type="submit" disabled={!newSearch.trim()} className="btn-primary">
                  Track
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 justify-center">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
