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
} from "lucide-react";

export function DriveSection() {
  const { user } = useAuth();
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
      {/* Top Banner */}
      <div className="rounded-3xl bg-black text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white mb-2">
            <Radio className={`h-3 w-3 ${isOnline ? "text-emerald-400 animate-pulse" : "text-neutral-500"}`} />
            {isOnline ? "Online & Ready" : "Offline"}
          </div>
          <h1 className="text-3xl font-black tracking-tight">Driver Partner Console</h1>
          <p className="text-sm text-neutral-400">
            Welcome, {user?.fullName || "Partner"}. Control your driving schedule and track payouts.
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
            <Star className="h-5 w-5 fill-black" /> 4.96
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Top Tier Partner</div>
        </div>
      </div>

      {/* Main Grid: Incoming Offer Card & Vehicle Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Incoming Ride Offer */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm min-h-[360px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Live Dispatch Radar
              </h3>
              <span className="text-xs text-neutral-500">Central Delhi Zone</span>
            </div>

            {incomingOffer && isOnline ? (
              <div className="p-6 rounded-2xl bg-black text-white space-y-5 animate-in zoom-in-95 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      New Ride Request!
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-neutral-800 text-xs font-bold flex items-center justify-center">
                    {countdown}s
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold">Alex Morgan</h4>
                    <span className="text-xs text-neutral-400">★ 4.95 Rider Rating · UberX</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-400">₹340</div>
                    <span className="text-[11px] text-neutral-400">Guaranteed Fare</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-neutral-800 pt-3">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Pickup: Connaught Place Inner Circle (1.2 km away)</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Navigation className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Dropoff: Terminal 3, IGI Airport (18.5 km)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setIncomingOffer(false)}
                    className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <X className="h-4 w-4" /> Decline
                  </button>
                  <button
                    onClick={handleAcceptRide}
                    className="py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Check className="h-4 w-4" /> Accept Ride (₹340)
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-black">
                  <Navigation className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-base text-black">
                  {isOnline ? "Searching for nearby passenger requests..." : "You are currently offline"}
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {isOnline
                    ? "Demand is high around Connaught Place and Airport routes. Keep the app open."
                    : "Toggle your status to Online in the top banner to begin receiving rides."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Vehicle & Account Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-black flex items-center gap-2">
              <Car className="h-4 w-4" />
              Registered Vehicle
            </h3>

            <div className="p-4 rounded-2xl bg-neutral-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">Toyota Camry Hybrid</h4>
                <p className="text-xs text-neutral-500">Midnight Black · Comfort Tier</p>
                <div className="mt-1 font-mono text-xs font-bold text-neutral-800">DL-01-AB-1234</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Vehicle Inspection:</span>
                <span className="font-bold text-emerald-600">Active & Verified</span>
              </div>
              <div className="flex justify-between">
                <span>Insurance:</span>
                <span className="font-bold text-emerald-600">Comprehensive (Valid till 2027)</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Deposit:</span>
                <span className="font-bold text-black">HDFC Bank •••• 5678 (Razorpay)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
