"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function NewShipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    description: "",
    weight: "",
    dimensions: "",
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    originLocation: "",
    destinationLocation: "",
    expectedDeliveryDate: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create shipment");
        return;
      }

      setSuccess(`Shipment created! Tracking #: ${data.trackingNumber}`);
      setTimeout(() => router.push(`/admin/shipments/${data.id}`), 1500);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/shipments" className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Shipment</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            A unique tracking number will be generated automatically.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Package Info */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Package Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Item / Parcel Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="e.g. Electronics – laptop, smartphone, accessories"
                className="input resize-none h-20"
                required
              />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
                placeholder="e.g. 2.5"
                className="input"
              />
            </div>
            <div>
              <label className="label">Dimensions (L×W×H cm)</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => update("dimensions", e.target.value)}
                placeholder="e.g. 30×20×15"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Sender & Receiver */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sender */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Sender Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={form.senderName}
                  onChange={(e) => update("senderName", e.target.value)}
                  placeholder="Chanda Bwalya"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  value={form.senderPhone}
                  onChange={(e) => update("senderPhone", e.target.value)}
                  placeholder="+260 977 000 000"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={form.senderEmail}
                  onChange={(e) => update("senderEmail", e.target.value)}
                  placeholder="sender@company.co.zm"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Receiver */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">Receiver Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={form.receiverName}
                  onChange={(e) => update("receiverName", e.target.value)}
                  placeholder="Mutale Phiri"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  value={form.receiverPhone}
                  onChange={(e) => update("receiverPhone", e.target.value)}
                  placeholder="+260 966 000 000"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={form.receiverEmail}
                  onChange={(e) => update("receiverEmail", e.target.value)}
                  placeholder="receiver@email.co.zm"
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Locations & Dates */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Route & Schedule</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Origin Location *</label>
              <input
                type="text"
                value={form.originLocation}
                onChange={(e) => update("originLocation", e.target.value)}
                placeholder="e.g. Lusaka City Market, Zambia"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Destination Location *</label>
              <input
                type="text"
                value={form.destinationLocation}
                onChange={(e) => update("destinationLocation", e.target.value)}
                placeholder="e.g. Kitwe CBD, Zambia"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={form.expectedDeliveryDate}
                onChange={(e) => update("expectedDeliveryDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/shipments" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Shipment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
