"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Clock,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  getStatusInfo,
  formatDate,
  formatDateTime,
  SHIPMENT_STATUSES,
} from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TrackingEntry {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  updatedBy?: { name?: string; email?: string } | null;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  description: string;
  weight: number | null;
  dimensions: string | null;
  senderName: string;
  senderPhone: string;
  senderEmail: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string | null;
  originLocation: string;
  destinationLocation: string;
  currentLocation: string;
  status: string;
  expectedDeliveryDate: string | null;
  deliveredAt: string | null;
  createdAt: string;
  trackingHistory: TrackingEntry[];
}

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Shipment>>({});
  const [saving, setSaving] = useState(false);

  // Add tracking
  const [showAddTracking, setShowAddTracking] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    status: "",
    location: "",
    description: "",
  });
  const [addingTracking, setAddingTracking] = useState(false);
  const [trackMsg, setTrackMsg] = useState("");

  // Delete
  const [deleting, setDeleting] = useState(false);

  // Copied
  const [copied, setCopied] = useState(false);

  const fetchShipment = async () => {
    try {
      const res = await fetch(`/api/shipments/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setShipment(data);
      setEditForm(data);
    } catch {
      setError("Shipment not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setShipment((s) => s ? { ...s, ...updated } : s);
      setEditMode(false);
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTracking(true);
    setTrackMsg("");
    try {
      const res = await fetch(`/api/shipments/${id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackingForm),
      });
      if (!res.ok) throw new Error();
      setTrackMsg("Tracking update added!");
      setTrackingForm({ status: "", location: "", description: "" });
      setShowAddTracking(false);
      await fetchShipment();
    } catch {
      setTrackMsg("Failed to add tracking update");
    } finally {
      setAddingTracking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete shipment ${shipment?.trackingNumber}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/shipments/${id}`, { method: "DELETE" });
      router.push("/admin/shipments");
    } catch {
      alert("Failed to delete shipment");
      setDeleting(false);
    }
  };

  const copyTracking = () => {
    if (!shipment) return;
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Shipment Not Found</h2>
        <Link href="/admin/shipments" className="btn-primary mt-4 inline-flex">
          Back to Shipments
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(shipment.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/shipments" className="btn-secondary p-2 mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Shipment Details</h1>
              <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {shipment.trackingNumber}
              </code>
              <button onClick={copyTracking} className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1">
                {copied ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
              <Link
                href={`/track/${shipment.trackingNumber}`}
                target="_blank"
                className="text-gray-400 hover:text-blue-600 text-xs flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Public page
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {trackMsg && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> {trackMsg}
            </span>
          )}
          {!editMode ? (
            <>
              <button onClick={() => setEditMode(true)} className="btn-secondary">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(false)} className="btn-secondary">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Info */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Package Information</h2>
            </div>
            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className="input resize-none h-16"
                  />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.weight ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, weight: parseFloat(e.target.value) || null }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Dimensions</label>
                  <input
                    type="text"
                    value={editForm.dimensions || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, dimensions: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">{shipment.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weight</p>
                    <p className="text-gray-900">{shipment.weight ? `${shipment.weight} kg` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dimensions</p>
                    <p className="text-gray-900">{shipment.dimensions || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sender/Receiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: "Sender", prefix: "sender" as const, color: "blue" },
              { title: "Receiver", prefix: "receiver" as const, color: "green" },
            ].map(({ title, prefix, color }) => (
              <div key={prefix} className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className={`w-4 h-4 text-${color}-600`} />
                  <h3 className="font-medium text-gray-900">{title}</h3>
                </div>
                {editMode ? (
                  <div className="space-y-3">
                    {(["Name", "Phone", "Email"] as const).map((field) => {
                      const key = `${prefix}${field}` as keyof Shipment;
                      return (
                        <div key={field}>
                          <label className="label">{field}</label>
                          <input
                            type={field === "Email" ? "email" : field === "Phone" ? "tel" : "text"}
                            value={(editForm[key] as string) || ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                            className="input"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{(shipment as Record<string, unknown>)[`${prefix}Name`] as string}</p>
                    <p className="text-sm text-gray-600">{(shipment as Record<string, unknown>)[`${prefix}Phone`] as string}</p>
                    {(shipment as Record<string, unknown>)[`${prefix}Email`] && (
                      <p className="text-sm text-gray-500">{(shipment as Record<string, unknown>)[`${prefix}Email`] as string}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Route */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Route & Schedule</h2>
            </div>
            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Origin Location</label>
                  <input
                    value={editForm.originLocation || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, originLocation: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Destination Location</label>
                  <input
                    value={editForm.destinationLocation || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, destinationLocation: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={editForm.expectedDeliveryDate?.split("T")[0] || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, expectedDeliveryDate: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <div className="w-0.5 h-8 bg-gray-200" />
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500">Origin</p>
                      <p className="font-medium text-gray-900">{shipment.originLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Destination</p>
                      <p className="font-medium text-gray-900">{shipment.destinationLocation}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Current Location</p>
                    <p className="font-medium text-blue-700">{shipment.currentLocation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected Delivery</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(shipment.expectedDeliveryDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Tracking History */}
        <div className="space-y-5">
          {/* Add Tracking */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Update Status</h2>
              <button
                onClick={() => setShowAddTracking(!showAddTracking)}
                className="btn-primary text-sm py-1.5 px-3"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Update
              </button>
            </div>

            {showAddTracking && (
              <form onSubmit={handleAddTracking} className="space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <label className="label">New Status *</label>
                  <select
                    value={trackingForm.status}
                    onChange={(e) => setTrackingForm((f) => ({ ...f, status: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select status...</option>
                    {SHIPMENT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Current Location *</label>
                  <input
                    type="text"
                    value={trackingForm.location}
                    onChange={(e) => setTrackingForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Nairobi Hub"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea
                    value={trackingForm.description}
                    onChange={(e) => setTrackingForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Package arrived at sorting facility"
                    className="input resize-none h-16 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingTracking}
                  className="w-full btn-primary"
                >
                  {addingTracking ? "Saving..." : "Save Update"}
                </button>
              </form>
            )}

            {/* Current Status Summary */}
            {!showAddTracking && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Current Status</span>
                  <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Location: </span>
                  <span className="text-gray-900">{shipment.currentLocation}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Created: </span>
                  <span className="text-gray-900">{formatDate(shipment.createdAt)}</span>
                </div>
                {shipment.deliveredAt && (
                  <div className="text-sm">
                    <span className="text-gray-500">Delivered: </span>
                    <span className="text-green-700">{formatDateTime(shipment.deliveredAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Tracking History</h2>
              <span className="text-xs text-gray-400 ml-auto">
                {shipment.trackingHistory.length} events
              </span>
            </div>

            {shipment.trackingHistory.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No tracking history yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {shipment.trackingHistory.map((entry, i) => {
                  const entryStatus = getStatusInfo(entry.status);
                  const isFirst = i === 0;
                  return (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                            isFirst ? "bg-blue-600 ring-4 ring-blue-100" : "bg-gray-300"
                          }`}
                        />
                        {i < shipment.trackingHistory.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-100 my-1 min-h-[24px]" />
                        )}
                      </div>
                      <div className={`pb-4 ${i === shipment.trackingHistory.length - 1 ? "pb-0" : ""}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`badge text-xs ${entryStatus.color}`}>
                            {entryStatus.label}
                          </span>
                          {isFirst && (
                            <span className="text-xs text-blue-600 font-medium">Latest</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{entry.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{entry.location}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDateTime(entry.timestamp)}
                          {entry.updatedBy && (
                            <> · {entry.updatedBy.name || entry.updatedBy.email}</>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
