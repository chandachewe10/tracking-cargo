"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Search, ChevronRight, ArrowLeft } from "lucide-react";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (trimmed) {
      router.push(`/track/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-white">LuxShipCargo</span>
          </Link>
          <p className="text-blue-200 mt-2 text-sm">Real-time shipment tracking</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Track Your Package</h1>
          <p className="text-gray-500 text-sm mb-7">
            Enter the tracking number from your shipment confirmation.
          </p>

          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="label">Tracking Number</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. TRK-ABC123-XY12"
                  className="input pl-10 font-mono text-sm"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Tracking numbers are in the format TRK-XXXXXX-XXXX
              </p>
            </div>

            <button
              type="submit"
              disabled={!trackingNumber.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Track Shipment
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
