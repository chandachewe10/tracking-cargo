"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Search,
  MapPin,
  Clock,
  Shield,
  Truck,
  Globe,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (trimmed) {
      router.push(`/track/${encodeURIComponent(trimmed)}`);
    }
  };

  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: "Real-Time Location",
      description:
        "Track your package's exact location at every step of its journey.",
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Live Status Updates",
      description:
        "Get instant notifications whenever your shipment status changes.",
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Secure Tracking",
      description:
        "Your shipment data is protected with enterprise-grade security.",
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Global Coverage",
      description:
        "Track shipments across domestic and international destinations.",
    },
  ];

  const steps = [
    { step: "01", title: "Enter Tracking Number", desc: "Type the tracking number provided by your shipper." },
    { step: "02", title: "View Shipment Details", desc: "See origin, destination, current location and status." },
    { step: "03", title: "Follow the Journey", desc: "Watch every milestone from dispatch to delivery." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TrackIt</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/track"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Track Package
              </Link>
              <Link
                href="/login"
                className="btn-primary text-sm"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm border border-white/20">
              <Truck className="w-4 h-4" />
              <span>Real-time cargo & parcel tracking</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Track Your Shipment{" "}
              <span className="text-blue-200">Anywhere,</span>{" "}
              <span className="text-blue-200">Anytime</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-10 leading-relaxed">
              Enter your tracking number for real-time updates on your cargo.
              Know exactly where your package is — from origin to delivery.
            </p>

            {/* Tracking Search */}
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g. TRK-ABC123-XY12)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!trackingNumber.trim()}
                className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
              >
                Track Now
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>

            <p className="mt-4 text-blue-200 text-sm">
              No account needed. Just enter your tracking number to get started.
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Track Your Shipment
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Our platform gives you complete visibility into your cargo's journey with powerful, easy-to-use tracking tools.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-500">Track your package in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-100 z-0 -translate-x-1/2" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Guide */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Understand Every Status Update
              </h2>
              <p className="text-gray-500 mb-8">
                We keep you informed at every stage of your shipment's journey with clear, easy-to-understand status updates.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Received at Origin", color: "bg-blue-500" },
                  { label: "Dispatched", color: "bg-indigo-500" },
                  { label: "In Transit", color: "bg-yellow-500" },
                  { label: "Arrived at Hub", color: "bg-orange-500" },
                  { label: "Out for Delivery", color: "bg-purple-500" },
                  { label: "Delivered", color: "bg-green-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="text-gray-700">{s.label}</span>
                    <CheckCircle className="w-4 h-4 text-gray-300 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8">
              <div className="space-y-4">
                {[
                  { time: "Jun 8, 9:00 AM", status: "Out for Delivery", loc: "Kitwe CBD Hub", active: true },
                  { time: "Jun 8, 3:00 AM", status: "Arrived at Hub", loc: "Ndola Sorting Facility" },
                  { time: "Jun 7, 6:00 PM", status: "In Transit", loc: "Kapiri Mposhi Checkpoint" },
                  { time: "Jun 7, 10:00 AM", status: "Dispatched", loc: "Lusaka City Market" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${item.active ? "bg-blue-600" : "bg-gray-300"}`} />
                      {i < 3 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className={`font-medium text-sm ${item.active ? "text-blue-700" : "text-gray-700"}`}>
                        {item.status}
                      </p>
                      <p className="text-xs text-gray-500">{item.loc}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Track Your Package?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Enter your tracking number now and get instant updates on your shipment.
          </p>
          <Link
            href="/track"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            <Search className="w-5 h-5" />
            Start Tracking
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">TrackIt</span>
            </div>
            <p className="text-sm text-center">
              © {new Date().getFullYear()} TrackIt. Cargo & Parcel Tracking System.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/track" className="hover:text-white transition-colors">Track</Link>
              <Link href="/login" className="hover:text-white transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
