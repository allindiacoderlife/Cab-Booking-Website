import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Car,
  DollarSign,
  Clock,
  CheckCircle2,
  Radio,
  Navigation,
  MapPin,
  Check,
  X,
  TrendingUp,
  Star,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Zap,
} from "lucide-react";

interface DriveSectionProps {
  onOpenAuth?: (mode?: "login" | "signup") => void;
}

export function DriveSection({ onOpenAuth }: DriveSectionProps) {
  const { user, role, switchRole } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [incomingOffer, setIncomingOffer] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(15);

  const [todayEarnings, setTodayEarnings] = useState(2450);
  const [completedTrips, setCompletedTrips] = useState(6);

  useEffect(() => {
    if (!isOnline) {
      setIncomingOffer(false);
      return;
    }
    const timer = setTimeout(() => {
      setIncomingOffer(true);
      setCountdown(15);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOnline]);

  useEffect(() => {
    if (!incomingOffer) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIncomingOffer(false);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingOffer]);

  const handleAcceptRide = () => {
    alert("Ride accepted! Navigating to pickup at Connaught Place.");
    setIncomingOffer(false);
    setTodayEarnings((prev) => prev + 340);
    setCompletedTrips((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* If visitor is not logged in: Show Guest Banner with sign up CTA */}
      {!user && (
        <div className="p-6 rounded-3xl bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-800 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Zap className="h-3.5 w-3.5" />
              Drive with Uber
            </div>
            <h2 className="text-2xl font-black">Ready to earn on your own schedule?</h2>
            <p className="text-xs text-neutral-400 max-w-xl">
              Sign up as an official Uber driver partner to verify your commercial vehicle license, accept incoming ride requests, and get instant payouts directly through Razorpay.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth && onOpenAuth("signup")}
              className="px-6 py-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition shadow-sm"
            >
              Sign up to drive
            </button>
            <button
              onClick={() => onOpenAuth && onOpenAuth("login")}
              className="px-5 py-3 rounded-xl bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700 transition"
            >
              Driver Log in
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-3xl bg-black text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white mb-2">
            <Radio className={`h-3 w-3 ${isOnline ? "text-emerald-400 animate-pulse" : "text-neutral-500"}`} />
            {isOnline ? "Online & Ready" : "Offline"}
          </div>
          <h1 className="text-3xl font-black tracking-tight">Driver Partner Console</h1>
          <p className="text-sm text-neutral-400">
            Welcome, {user ? user.fullName : "Guest Partner (Demo Mode)"}. Control your driving schedule and track payouts.
          </p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-6 py-3.5 rounded-2xl font-black text-xs transition shadow-lg flex items-center gap-2 ${
            isOnline
              ? "bg-emerald-500 hover:bg-emerald-400 text-black"
              : "bg-neutral-800 hover:bg-neutral-700 text-white"
          }`}
        >
          <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-black animate-ping" : "bg-neutral-500"}`} />
          <span>{isOnline ? "Go Offline" : "Go Online Now"}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium mb-1">Today's Earnings</div>
          <div className="text-2xl font-black text-black">₹{todayEarnings}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Razorpay instant payout ready
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium mb-1">Trips Completed</div>
          <div className="text-2xl font-black text-black">{completedTrips}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Goal: 8 trips today</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium mb-1">Hours Online</div>
          <div className="text-2xl font-black text-black">4.8 hrs</div>
          <div className="text-[11px] text-neutral-500 mt-1">Active shift</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium mb-1">Driver Rating</div>
          <div className="text-2xl font-black text-black flex items-center gap-1">
            <Star className="h-5 w-5 fill-black text-black" />
            <span>4.96</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Top Tier Partner</div>
        </div>
      </div>

      {/* Main Grid: Incoming Offer Radar & Vehicle Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Incoming Dispatch Offer (Use Case 4 & 5) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-black" />
              <h2 className="text-base font-black text-black uppercase tracking-wider">
                Live Dispatch Radar
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">Central Delhi Zone</span>
          </div>

          {incomingOffer ? (
            <div className="rounded-3xl bg-neutral-900 text-white p-6 space-y-5 border border-neutral-800 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  NEW RIDE REQUEST!
                </div>
                <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center font-mono font-bold text-xs text-white">
                  {countdown}s
                </div>
              </div>

              <div className="flex items-baseline justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold">Alex Morgan</h3>
                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                    ★ 4.95 Rider Rating · UberX
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400">₹340</span>
                  <p className="text-[10px] text-neutral-400">Guaranteed Fare</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded-full bg-black border-2 border-white flex items-center justify-center mt-0.5 shrink-0" />
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Pickup</span>
                    <span className="font-semibold text-white">Connaught Place Inner Circle (1.2 km away)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded-none bg-white flex items-center justify-center mt-0.5 shrink-0 text-black text-[9px] font-black">
                    ■
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Dropoff</span>
                    <span className="font-semibold text-white">Terminal 3, IGI Airport (18.5 km)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIncomingOffer(false)}
                  className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Decline
                </button>
                <button
                  onClick={handleAcceptRide}
                  className="py-3 rounded-xl bg-white hover:bg-neutral-200 text-xs font-black text-black transition flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Check className="h-4 w-4" />
                  Accept Ride (₹340)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <Car className="h-8 w-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-black">Waiting for nearby trip dispatches...</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Keep your app open and stay in high demand areas to receive ride requests faster.
              </p>
              <button
                onClick={() => {
                  setIncomingOffer(true);
                  setCountdown(15);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-black text-xs font-bold transition"
              >
                Simulate Incoming Request
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Vehicle & Documentation status */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-black" />
            <h2 className="text-base font-black text-black uppercase tracking-wider">
              Registered Vehicle
            </h2>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center">
              <Car className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-black">Toyota Camry Hybrid</h4>
              <p className="text-xs text-neutral-500">Midnight Black · Comfort Tier</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-neutral-200 text-black text-[11px] font-mono font-bold">
                DL-01-AB-1234
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-neutral-100">
              <span className="text-neutral-500">Vehicle Inspection:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active & Verified
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-neutral-100">
              <span className="text-neutral-500">Insurance:</span>
              <span className="font-bold text-black">Comprehensive (Valid till 2027)</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-500">Direct Deposit:</span>
              <span className="font-bold text-black">HDFC Bank **** 5678 (Razorpay Payouts)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
