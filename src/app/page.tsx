"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  Globe,
  Clock,
} from "lucide-react";

const LOGO = "/images/logo.svg";
const ACCENT = "#F07B3F";
const NAVY = "#0F2D52";
const NAVY_DARK = "#081A33";

const services = [
  {
    emoji: "✈️",
    title: "Air Freight",
    description:
      "Express air cargo services with real-time tracking and priority handling for time-sensitive shipments worldwide.",
    image: "/images/air-freight.jpg",
  },
  {
    emoji: "⛴️",
    title: "Marine Freight",
    description:
      "Cost-effective ocean shipping solutions for bulk cargo with comprehensive port-to-port and door-to-door services.",
    image: "/images/marine-freight.jpg",
  },
  {
    emoji: "🚛",
    title: "Road & Rail",
    description:
      "Reliable ground transportation across continents with flexible scheduling and multi-modal integration.",
    image: "/images/road-rail.jpg",
  },
  {
    emoji: "⛰️",
    title: "Minerals Shipping",
    description:
      "Specialized handling and secure transport for minerals and raw materials across global supply chains.",
    image: "/images/minerals.jpg",
  },
  {
    emoji: "🛡️",
    title: "Cargo Insurance",
    description:
      "Comprehensive cargo insurance coverage to protect your valuable shipments against all risks.",
    image: "/images/insurance.jpg",
  },
];

const newsArticles = [
  {
    date: "Mar 20, 2026",
    title: "Global Shipping Rates Stabilize After Recent Volatility",
    excerpt:
      "Ocean freight rates are showing signs of stabilization following months of fluctuation, bringing relief to global supply chains and logistics planners.",
    image: "/images/news-1.jpg",
  },
  {
    date: "Mar 18, 2026",
    title: "New Sustainable Aviation Fuel Mandates Impact Air Cargo",
    excerpt:
      "Major air freight carriers are accelerating their transition to sustainable aviation fuels ahead of new international environmental regulations.",
    image: "/images/news-2.jpg",
  },
  {
    date: "Mar 15, 2026",
    title: "Cross-Border Rail Infrastructure Gets Major Investment",
    excerpt:
      "A new multi-billion dollar investment package aims to modernize cross-border rail networks, significantly reducing transit times for continental freight.",
    image: "/images/news-3.jpg",
  },
  {
    date: "Mar 12, 2026",
    title: "AI-Driven Route Optimization Reduces Fleet Emissions by 15%",
    excerpt:
      "Leading logistics providers report significant emission reductions and cost savings after implementing next-generation AI routing algorithms.",
    image: "/images/news-4.jpg",
  },
  {
    date: "Mar 10, 2026",
    title: "Port Automation Projects Accelerate Globally",
    excerpt:
      "Major international ports are fast-tracking automation initiatives to handle increased cargo volumes and mitigate labor shortage impacts.",
    image: "/images/news-5.jpg",
  },
  {
    date: "Mar 8, 2026",
    title: "Last-Mile Delivery Innovations Reshaping Urban Logistics",
    excerpt:
      "From cargo bikes to autonomous delivery droids, urban centers are seeing a rapid transformation in how final-mile deliveries are executed.",
    image: "/images/news-6.jpg",
  },
];

const trustBadges = [
  { icon: Shield, label: "Fully Insured" },
  { icon: Award, label: "ISO 9001" },
  { icon: Clock, label: "24/7 Tracking" },
  { icon: Globe, label: "150+ Countries" },
];

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#news", label: "News" },
  { href: "#track", label: "Track Shipment" },
  { href: "#contact", label: "Contact" },
];

const heroSlides = ["/images/hero-1.jpg", "/images/hero-2.jpg", "/images/hero-3.jpg"];

function HexIcon() {
  return (
    <div
      className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl"
      style={{
        clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        background: `linear-gradient(135deg, ${ACCENT}, #F4A261)`,
      }}
    >
      📦
    </div>
  );
}

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [slide, setSlide] = useState(0);
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (trimmed) {
      router.push(`/track/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: NAVY }}>
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md"
        style={{ backgroundColor: `${NAVY}e6` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src={LOGO} alt="FastCargo Logo" width={40} height={40} unoptimized />
              <span className="text-lg font-bold tracking-wide">
                Fast<span style={{ color: ACCENT }}>Cargo</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 text-sm text-white/80">
              {navLinks.map((link, i) => (
                <span key={link.href} className="flex items-center">
                  <a
                    href={link.href}
                    className="px-3 py-2 hover:text-[#F07B3F] transition-colors"
                  >
                    {link.label}
                  </a>
                  {i < navLinks.length - 1 && <span className="text-white/30">•</span>}
                </span>
              ))}
            </div>

            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        <div className="absolute inset-0">
          <Image
            src={heroSlides[slide]}
            alt="Cargo logistics"
            fill
            className="object-cover opacity-25"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${NAVY}cc, ${NAVY}f2 60%, ${NAVY})`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
          <div className="flex justify-center gap-3 mb-8">
            <HexIcon />
            <HexIcon />
            <HexIcon />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Global Reach.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F07B3F] to-[#F4A261]">
              Trusted Delivery.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Air • Marine • Road • Rail • Minerals Shipping &amp; Cargo Insurance | Fast. Secure.
            Reliable.
          </p>

          <div id="track" className="max-w-xl mx-auto">
            <form onSubmit={handleTrack} className="space-y-3">
              <label className="block text-xs font-semibold tracking-widest uppercase text-left" style={{ color: ACCENT }}>
                Enter Airway Bill / Tracking Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="FC100234"
                  className="w-full px-5 py-4 pr-12 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#F07B3F] shadow-xl"
                />
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={!trackingNumber.trim()}
                className="w-full py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <Search className="w-5 h-5" />
                TRACK CARGO
              </button>
            </form>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <a
                href="#contact"
                className="flex-1 py-3 px-6 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors text-center"
              >
                GET A QUOTE
              </a>
              <Link
                href="/track"
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <Package className="w-4 h-4" />
                TRACK YOUR CARGO
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              type="button"
              onClick={() => setSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length)}
              className="p-2 rounded-full border border-white/20 hover:border-[#F07B3F] transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === slide ? "bg-[#F07B3F]" : "bg-white/30"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSlide((s) => (s + 1) % heroSlides.length)}
              className="p-2 rounded-full border border-white/20 hover:border-[#F07B3F] transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Comprehensive logistics solutions tailored to your cargo needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-xl glass-effect hover-lift border-[#F07B3F]/20 h-full group cursor-pointer overflow-hidden flex flex-col hover:shadow-[0_8px_30px_rgb(240,123,63,0.12)] hover:border-[#F07B3F]/50"
              >
                <div className="relative h-40 overflow-hidden bg-white/5">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${NAVY}, transparent)` }}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-2xl mb-2">{service.emoji}</span>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section
        id="news"
        className="py-24 relative z-10 border-y border-white/5 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: `${NAVY}4d` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Latest Industry News</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Stay informed with the latest updates, trends, and insights from the global shipping
              and logistics sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.map((article) => (
              <article
                key={article.title}
                className="group relative flex flex-col glass-effect rounded-2xl overflow-hidden hover:border-[#F07B3F]/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(240,123,63,0.12)] hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden bg-white/5">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <time className="text-xs font-medium mb-2" style={{ color: ACCENT }}>
                    {article.date}
                  </time>
                  <h3 className="font-bold text-base mb-2 leading-snug group-hover:text-[#F07B3F] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">{article.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-6 rounded-xl glass-effect text-center"
            >
              <Icon className="w-8 h-8" style={{ color: ACCENT }} />
              <span className="text-sm font-semibold text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="border-t border-white/10 py-14 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: NAVY_DARK }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src={LOGO} alt="FastCargo Logo" width={36} height={36} unoptimized />
              <span className="font-bold text-lg">
                Fast<span style={{ color: ACCENT }}>Cargo</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Global reach with trusted protection. Fast, secure logistics solutions for all your
              cargo needs.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[#F07B3F] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li className="flex items-start gap-2 min-h-[20px]">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 opacity-40" style={{ color: ACCENT }} />
                <span>&nbsp;</span>
              </li>
              <li className="flex items-center gap-2 min-h-[20px]">
                <Mail className="w-4 h-4 shrink-0 opacity-40" style={{ color: ACCENT }} />
                <span>&nbsp;</span>
              </li>
              <li className="flex items-center gap-2 min-h-[20px]">
                <Phone className="w-4 h-4 shrink-0 opacity-40" style={{ color: ACCENT }} />
                <span>&nbsp;</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} FastCargo. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/70 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
