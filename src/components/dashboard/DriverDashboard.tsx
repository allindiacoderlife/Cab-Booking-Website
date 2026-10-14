"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Car,
  DollarSign,
  Clock,
  CheckCircle,
  Radio,
  Navigation,
  Star,
  Shield,
  Sliders,
  ChevronRight,
  TrendingUp,
  MapPin,
  X,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DriverDashboardProps {
  onOpenProfile: () => void;
}

export function DriverDashboard({ onOpenProfile }: DriverDashboardProps) {
  const { user, driverProfile, toggleDriverOnline } = useAuth();
  const [incomingRequest, setIncomingRequest] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);

  // Trigger simulated incoming ride request when driver is online
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (driverProfile?.isOnline) {
      timer = setTimeout(() => {
        setIncomingRequest(true);
        setCountdown(15);
      }, 5000);
    } else {
      setIncomingRequest(false);
    }
    return () => clearTimeout(timer);
  }, [driverProfile?.isOnline]);

  // Countdown timer for incoming ride
  useEffect(() => {
    if (!incomingRequest) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIncomingRequest(false);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingRequest]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Driver Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              Driver Console & Fleet Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good day, Captain {user?.fullName?.split(" ")[0]}!
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              You are currently{" "}
              <strong className={driverProfile?.isOnline ? "text-emerald-400" : "text-slate-400"}>
                {driverProfile?.isOnline ? "ONLINE & ready for ride requests" : "OFFLINE"}
              </strong>
              . Toggle status when you are prepared to accept riders.
            </p>
          </div>

          {/* Big Online/Offline Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDriverOnline}
              className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-3 transition shadow-lg ${
                driverProfile?.isOnline
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
              }`}
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  driverProfile?.isOnline ? "bg-white animate-ping" : "bg-slate-500"
                }`}
              />
              <span>{driverProfile?.isOnline ? "Go Offline" : "Go Online Now"}</span>
            </button>
          </div>
        </div>

        {/* Subtle glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Today&apos;s Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(driverProfile?.totalEarningsToday || 0)}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="h-3 w-3" /> +14% vs yesterday
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Completed Trips</span>
            <CheckCircle className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {driverProfile?.completedTripsToday || 0} rides
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Goal: 10 rides today</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Hours Online</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {driverProfile?.onlineHoursToday || 0} hrs
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Max 12 hrs/shift policy</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Driver Rating</span>
            <Star className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            ★ {driverProfile?.rating || 5.0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Acceptance Rate: {driverProfile?.acceptanceRate || 98}%
          </span>
        </div>
      </div>

      {/* Main Grid: Vehicle Info & Live Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Vehicle Card & Dispatch Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="h-4 w-4 text-emerald-400" />
                Active Registered Vehicle
              </h3>
              <button
                onClick={onOpenProfile}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                Edit Vehicle
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Car className="h-7 w-7 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">
                    {driverProfile?.vehicle.year} {driverProfile?.vehicle.make}{" "}
                    {driverProfile?.vehicle.model}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {driverProfile?.vehicle.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Color: {driverProfile?.vehicle.color}
                </p>
                <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">
                  {driverProfile?.vehicle.licensePlate}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Vehicle Inspection:</span>
                <span className="text-emerald-400 font-semibold">Passed & Valid</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Commercial Insurance:</span>
                <span className="text-emerald-400 font-semibold">Active (Coverage $1M)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Request Radar / Simulated Incoming Dispatch */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-400" />
                Live Dispatch & Nearby Demand
              </h3>
              <span className="text-xs text-slate-400">Downtown San Francisco Zone</span>
            </div>

            {/* If there is an incoming ride request */}
            {incomingRequest && driverProfile?.isOnline ? (
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-950 to-indigo-950/70 border-2 border-indigo-500 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      New Ride Request!
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center">
                    {countdown}s
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white">Sarah M.</h4>
                    <span className="text-xs text-amber-400">★ 4.98 Rider Rating</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-400">$26.40</div>
                    <span className="text-[11px] text-slate-400">Estimated Fare</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Pickup: 201 Mission St, Financial District</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Navigation className="h-4 w-4 text-rose-400 shrink-0" />
                    <span className="truncate">Dropoff: 1800 Owens St, Mission Bay</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setIncomingRequest(false)}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </button>
                  <button
                    onClick={() => {
                      alert("Ride accepted! Transitioning to live navigation in Phase 4.");
                      setIncomingRequest(false);
                    }}
                    className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                  >
                    <Check className="h-4 w-4" />
                    Accept Ride ($26.40)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Navigation className="h-8 w-8 text-emerald-400" />
                  </div>
                  {driverProfile?.isOnline && (
                    <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping" />
                  )}
                </div>

                <h4 className="text-base font-bold text-white">
                  {driverProfile?.isOnline
                    ? "Searching for nearby ride requests..."
                    : "You are currently offline"}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  {driverProfile?.isOnline
                    ? "High demand detected near Mission District & SFO corridor. Keep your phone mounted and eyes on the road."
                    : "Switch to Online to start receiving passenger ride requests in your area."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
