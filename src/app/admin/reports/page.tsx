"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import { getStatusInfo, formatDate } from "@/lib/utils";

interface ReportData {
  summary: {
    total: number;
    active: number;
    delivered: number;
    pending: number;
    last30Days: number;
    last7Days: number;
    deliveryRate: number;
  };
  statusBreakdown: { status: string; count: number }[];
  dailyTrend: { date: string; created: number; delivered: number }[];
  recentShipments: {
    trackingNumber: string;
    receiverName: string;
    status: string;
    createdAt: string;
    destinationLocation: string;
  }[];
  topDestinations: { location: string; count: number }[];
}

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, statusBreakdown, dailyTrend, recentShipments, topDestinations } = data;

  // Format daily trend to short dates
  const trendData = dailyTrend.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  // Pie chart data
  const pieData = statusBreakdown.map((s) => ({
    name: getStatusInfo(s.status).label,
    value: s.count,
  }));

  const statCards = [
    { label: "Total Shipments", value: summary.total, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Active Shipments", value: summary.active, icon: Truck, color: "text-yellow-600 bg-yellow-50" },
    { label: "Delivered", value: summary.delivered, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "Pending", value: summary.pending, icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Last 7 Days", value: summary.last7Days, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Last 30 Days", value: summary.last30Days, icon: BarChart2, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Statistics</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of shipment performance</p>
        </div>
        <button onClick={fetchReports} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Delivery Rate Banner */}
      <div className="card p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Overall Delivery Rate</p>
            <p className="text-5xl font-extrabold mt-1">{summary.deliveryRate}%</p>
            <p className="text-blue-200 text-sm mt-1">
              {summary.delivered} of {summary.total} shipments delivered
            </p>
          </div>
          <div className="w-24 h-24">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray={`${summary.deliveryRate}, 100`}
                strokeLinecap="round"
              />
              <text x="18" y="21" className="text-sm" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                {summary.deliveryRate}%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Activity (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval={4}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="created" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Created" />
              <Bar dataKey="delivered" fill="#10b981" radius={[3, 3, 0, 0]} name="Delivered" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded" /> Created
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 bg-green-500 rounded" /> Delivered
            </div>
          </div>
        </div>

        {/* Status Breakdown Pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Shipment Status Breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Trend Line */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Shipment Trend (Line Chart)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line
              type="monotone"
              dataKey="created"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Created"
            />
            <Line
              type="monotone"
              dataKey="delivered"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Delivered"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Top Destinations</h2>
          </div>
          {topDestinations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topDestinations.map((d, i) => (
                <div key={d.location} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900 truncate">{d.location}</span>
                      <span className="text-sm font-semibold text-gray-700 ml-2">{d.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-blue-500 rounded-full"
                        style={{ width: `${Math.round((d.count / (topDestinations[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Shipments */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Shipments</h2>
          {recentShipments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No shipments yet</p>
          ) : (
            <div className="space-y-3">
              {recentShipments.map((s) => {
                const info = getStatusInfo(s.status);
                return (
                  <div key={s.trackingNumber} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {s.trackingNumber}
                      </code>
                      <p className="text-sm text-gray-700 mt-0.5 truncate">{s.receiverName}</p>
                      <p className="text-xs text-gray-400">{formatDate(s.createdAt)}</p>
                    </div>
                    <span className={`badge ${info.color} text-xs whitespace-nowrap`}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
