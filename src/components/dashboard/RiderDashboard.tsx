"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Navigation,
  Car,
  Clock,
  Shield,
  CreditCard,
  Tag,
  Star,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  History,
  Compass,
} from "lucide-react";

interface RiderDashboardProps {
  onOpenProfile: () => void;
}

export function RiderDashboard({ onOpenProfile }: RiderDashboardProps) {
  const { user } = useAuth();
  const [pickup, setPickup] = useState("Market St & 4th St, San Francisco");
  const [destination, setDestination] = useState("SFO International Airport, Terminal 2");
  const [sosSent, setSosSent] = useState(false);

  const vehicleTiers = [
    {
      id: "standard",
      name: "CabGo Standard",
      desc: "Affordable, everyday reliable rides",
      eta: "3 mins away",
      price: "$24.50",
      seats: 4,
      tag: "Popular",
    },
    {
      id: "comfort",
      name: "CabGo Comfort",
      desc: "Newer cars with top-rated drivers & extra legroom",
      eta: "5 mins away",
      price: "$32.80",
      seats: 4,
      tag: "Recommended",
    },
    {
      id: "xl",
      name: "CabGo XL",
      desc: "Spacious SUVs for groups up to 6 & extra luggage",
      eta: "7 mins away",
      price: "$48.00",
      seats: 6,
    },
    {
      id: "black",
      name: "CabGo Black",
      desc: "Premium luxury sedans with professional chauffeurs",
      eta: "8 mins away",
      price: "$65.20",
      seats: 4,
      tag: "Luxury",
    },
  ];

  const handleTriggerSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Rider Portal & Booking Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Where to today, {user?.fullName?.split(" ")[0]}?
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Reliable on-demand rides, upfront transparent fares, and 24/7 passenger safety
              monitoring.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-medium">Passenger Rating</span>
              <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                ★ {user?.rating || 5.0}
              </span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block font-medium">Completed Trips</span>
              <span className="text-lg font-black text-white">{user?.totalRides || 0}</span>
            </div>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid: Ride Booking Selector & Vehicle Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ride Request Quick Console */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-400" />
                Plan Your Ride
              </h2>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Estimates
              </span>
            </div>

            {/* Pickup & Destination Inputs */}
            <div className="space-y-3 relative">
              {/* Connecting route line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-dashed bg-slate-700 pointer-events-none" />

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Drop-off Destination
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Quick Saved Locations */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                Quick Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDestination("Home • 742 Evergreen Terrace")}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-left transition flex items-center gap-2 text-xs text-slate-300"
                >
                  <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="truncate">Home</span>
                </button>
                <button
                  onClick={() => setDestination("Office • Financial District")}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-left transition flex items-center gap-2 text-xs text-slate-300"
                >
                  <Navigation className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Office</span>
                </button>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter Promo Code (e.g. UBERFIRST20)"
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 uppercase"
              />
              <button className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition">
                Apply
              </button>
            </div>
          </div>

          {/* Safety & SOS Quick Trigger Card (Use Case 12) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Shield className="h-4 w-4 text-indigo-400" />
                Ride Safety & SOS Hub
              </div>
              <button
                onClick={onOpenProfile}
                className="text-[11px] text-indigo-400 hover:underline font-semibold"
              >
                Configure Contacts
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Assigned emergency contact:{" "}
              <strong className="text-white">
                {user?.emergencyContact?.name || "Not Configured Yet"}
              </strong>{" "}
              ({user?.emergencyContact?.phone || "No phone"})
            </p>

            {sosSent ? (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                Emergency Alert Sent! Live GPS broadcasted to emergency contacts.
              </div>
            ) : (
              <button
                onClick={handleTriggerSOS}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <AlertTriangle className="h-4 w-4" />
                Test Emergency SOS Alert
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Available Rides & Vehicle Selection */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="h-5 w-5 text-indigo-400" />
              Available Ride Options
            </h2>
            <span className="text-xs text-slate-400">Estimated 14.8 miles · ~22 mins</span>
          </div>

          <div className="space-y-3">
            {vehicleTiers.map((tier) => (
              <div
                key={tier.id}
                className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850/50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition">
                    <Car className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
                        {tier.name}
                      </h3>
                      {tier.tag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                          {tier.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{tier.desc}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Clock className="h-3 w-3" /> {tier.eta}
                      </span>
                      <span>·</span>
                      <span>{tier.seats} passengers max</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-white block">{tier.price}</span>
                  <span className="text-[10px] text-slate-400">All taxes incl.</span>
                </div>
              </div>
            ))}
          </div>

          {/* Book Ride CTA Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <div className="text-xs">
                <span className="font-semibold text-white block">Paying with Visa •••• 4242</span>
                <span className="text-[11px] text-slate-400">Tap profile to change method</span>
              </div>
            </div>
            <button
              onClick={() => alert("Booking engine ready for Phase 2 (Google Maps & Ride Matching)!")}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <span>Confirm & Request Ride</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
