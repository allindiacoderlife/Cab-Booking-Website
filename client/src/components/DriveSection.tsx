import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Map } from "./Map";
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
  Phone,
  KeyRound,
  Zap,
  Banknote,
  AlertCircle,
} from "lucide-react";

interface DriveSectionProps {
  onOpenAuth?: (mode?: "login" | "signup") => void;
}

type DriverTripStage = "IDLE" | "OFFER_INCOMING" | "NAVIGATING_TO_PICKUP" | "RIDER_ONBOARD" | "COMPLETED";

export function DriveSection({ onOpenAuth }: DriveSectionProps) {
  const { user, role, switchRole } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [tripStage, setTripStage] = useState<DriverTripStage>("OFFER_INCOMING");
  const [countdown, setCountdown] = useState<number>(15);

  const [todayEarnings, setTodayEarnings] = useState(2450);
  const [completedTrips, setCompletedTrips] = useState(6);

  // OTP Verification
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const correctOtp = "4821";

  // Coordinates
  const driverInitialCoords: [number, number] = [28.625, 77.228]; // Central Delhi
  const pickupCoords: [number, number] = [28.6315, 77.2167]; // Connaught Place
  const dropoffCoords: [number, number] = [28.5562, 77.1000]; // Airport T3

  // Active driver car position on map
  const [activeCarCoords, setActiveCarCoords] = useState<[number, number]>(driverInitialCoords);

  // Route Coordinates between Pickup and Airport
  const routeCoordinates: [number, number][] = [
    [28.6315, 77.2167], // CP
    [28.625, 77.209],
    [28.605, 77.195],
    [28.585, 77.172],
    [28.568, 77.142],
    [28.5562, 77.100], // Airport
  ];

  // Countdown timer for incoming offer
  useEffect(() => {
    if (!isOnline || tripStage !== "OFFER_INCOMING") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setTripStage("IDLE");
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline, tripStage]);

  // Car animation when driving
  useEffect(() => {
    if (tripStage === "NAVIGATING_TO_PICKUP") {
      setActiveCarCoords(pickupCoords);
    } else if (tripStage === "RIDER_ONBOARD") {
      let step = 0;
      const interval = setInterval(() => {
        if (step < routeCoordinates.length) {
          setActiveCarCoords(routeCoordinates[step]);
          step++;
        } else {
          clearInterval(interval);
        }
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [tripStage]);

  // Handle Accepting Ride
  const handleAcceptRide = () => {
    setTripStage("NAVIGATING_TO_PICKUP");
  };

  // Handle Decline
  const handleDeclineRide = () => {
    setTripStage("IDLE");
    setCountdown(15);
  };

  // Verify OTP and start trip
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() === correctOtp || enteredOtp.trim().length === 4) {
      setOtpError(false);
      setTripStage("RIDER_ONBOARD");
    } else {
      setOtpError(true);
    }
  };

  // Complete Trip
  const handleCompleteTrip = () => {
    setTodayEarnings((prev) => prev + 340);
    setCompletedTrips((prev) => prev + 1);
    setTripStage("COMPLETED");

    setTimeout(() => {
      setTripStage("IDLE");
      setEnteredOtp("");
      setActiveCarCoords(driverInitialCoords);
    }, 3500);
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-[#070709] text-black dark:text-white transition-colors duration-200">
      {/* LEFT PANEL: Driver Console Sidebar */}
      <div className="w-full lg:w-[480px] xl:w-[500px] h-full flex flex-col bg-white dark:bg-[#070709] border-r border-neutral-200 dark:border-neutral-800 shadow-2xl z-20 shrink-0">
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Customer Notice if logged in as RIDER */}
          {user && role === "RIDER" && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold">Signed in as Customer ({user.fullName})</p>
                <p className="text-[11px] text-neutral-400">You are previewing the Driver Partner Console</p>
              </div>
              <button
                onClick={() => switchRole("DRIVER")}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] transition shrink-0 ml-2 shadow-sm"
              >
                Switch to Driver
              </button>
            </div>
          )}

          {/* Guest Notice if not logged in */}
          {!user && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-white text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-emerald-400">Driver Partner Console (Demo Mode)</p>
                <p className="text-[11px] text-neutral-400">Sign up to become an official CabGo Driver Partner</p>
              </div>
              {onOpenAuth && (
                <button
                  onClick={() => onOpenAuth("signup")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] transition shrink-0 ml-2 shadow-sm"
                >
                  Join to Drive
                </button>
              )}
            </div>
          )}

          {/* Top Status & Online Switcher */}
          <div className="p-4 rounded-3xl bg-black dark:bg-[#0f0f13] text-white flex items-center justify-between shadow-xl border border-transparent dark:border-neutral-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isOnline ? "bg-emerald-400 animate-ping" : "bg-neutral-500"
                  }`}
                />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  {isOnline ? "Online & Receiving Rides" : "Offline"}
                </span>
              </div>
              <h2 className="text-base font-black text-white">
                {user && role === "DRIVER"
                  ? `${user.fullName} (Driver Partner)`
                  : user
                  ? `${user.fullName} (Customer View)`
                  : "David Chen (Driver Partner)"}
              </h2>
              <p className="text-[11px] text-neutral-400">Toyota Camry Hybrid · DL 01 AB 1234</p>
            </div>

            <button
              onClick={() => {
                setIsOnline(!isOnline);
                if (isOnline) setTripStage("IDLE");
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition shadow-md ${
                isOnline
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                  : "bg-neutral-800 hover:bg-neutral-700 text-white"
              }`}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>
          </div>

          {/* Earnings & Trips Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">Today's Earnings</span>
              <span className="text-lg font-black text-black dark:text-white">₹{todayEarnings}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">Completed</span>
              <span className="text-lg font-black text-black dark:text-white">{completedTrips} trips</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">Rating</span>
              <span className="text-lg font-black text-black dark:text-white flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-black text-black dark:fill-emerald-400 dark:text-emerald-400" /> 4.96
              </span>
            </div>
          </div>

          {/* DRIVER ACTIVE TRIP PHASES */}

          {/* PHASE 1: INCOMING RIDE OFFER */}
          {tripStage === "OFFER_INCOMING" && (
            <div className="p-5 rounded-3xl bg-neutral-900 text-white space-y-4 border border-neutral-800 shadow-2xl relative animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  NEW RIDE REQUEST!
                </span>
                <span className="h-7 w-7 rounded-full bg-neutral-800 flex items-center justify-center font-mono font-bold text-xs text-white">
                  {countdown}s
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white text-sm">
                    AM
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Alex Morgan</h3>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                      ★ 4.95 Rider Rating · CabGo Standard
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">₹340</span>
                  <p className="text-[10px] text-neutral-400 font-semibold">Guaranteed Payout</p>
                </div>
              </div>

              {/* Pickup and Dropoff addresses */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="h-3.5 w-3.5 rounded-full bg-black border-2 border-white flex items-center justify-center mt-0.5 shrink-0" />
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Pickup (1.2 km away)</span>
                    <span className="font-semibold text-white">Connaught Place Inner Circle</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-3.5 w-3.5 rounded-none bg-white flex items-center justify-center mt-0.5 shrink-0 text-black text-[8px] font-black">
                    ■
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Dropoff (18.5 km)</span>
                    <span className="font-semibold text-white">Terminal 3, IGI Airport (DEL)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDeclineRide}
                  className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={handleAcceptRide}
                  className="py-3 rounded-xl bg-white hover:bg-neutral-200 text-xs font-black text-black transition shadow-lg"
                >
                  Accept Ride (₹340)
                </button>
              </div>
            </div>
          )}

          {/* PHASE 2: NAVIGATING TO PICKUP & OTP ENTRY */}
          {tripStage === "NAVIGATING_TO_PICKUP" && (
            <div className="p-5 rounded-3xl bg-neutral-900 text-white space-y-4 border border-neutral-800 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 animate-pulse" />
                  Navigating to Pickup
                </span>
                <span className="text-xs font-bold text-neutral-400">ETA: 3 mins</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-800 space-y-1">
                <p className="text-[11px] text-neutral-400">Passenger Pickup Location:</p>
                <p className="text-sm font-bold text-white">Connaught Place Inner Circle, Gate 4</p>
                <p className="text-xs text-neutral-300">Passenger: Alex Morgan (+91 98765 43210)</p>
              </div>

              {/* Enter Rider PIN Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                    Enter Rider's 4-Digit PIN to Start Trip:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter PIN (e.g. 4821)"
                    className="w-full text-center text-xl font-mono font-black py-2.5 rounded-xl bg-black border border-neutral-700 text-white focus:outline-none focus:border-emerald-400 tracking-widest"
                  />
                  {otpError && (
                    <p className="text-[11px] text-rose-400 font-semibold">
                      Invalid PIN. Ask rider for their in-app PIN (Hint: 4821)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition"
                  >
                    Verify PIN & Start Trip
                  </button>
                  <a
                    href="tel:+919876543210"
                    className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition"
                    title="Call Rider"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </form>
            </div>
          )}

          {/* PHASE 3: RIDER ONBOARD & IN-TRANSIT */}
          {tripStage === "RIDER_ONBOARD" && (
            <div className="p-5 rounded-3xl bg-neutral-900 text-white space-y-4 border border-neutral-800 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  Trip In Progress
                </span>
                <span className="text-xs font-mono font-bold text-white">₹340.00</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-800 space-y-1.5">
                <p className="text-[11px] text-neutral-400">Navigating to Destination:</p>
                <p className="text-sm font-bold text-white">Terminal 3, Indira Gandhi International Airport</p>
                <p className="text-xs text-neutral-300">Remaining distance: 18.5 km (~22 mins)</p>
              </div>

              <button
                type="button"
                onClick={handleCompleteTrip}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Complete Trip & Collect ₹340</span>
              </button>
            </div>
          )}

          {/* PHASE 4: COMPLETED SUMMARY */}
          {tripStage === "COMPLETED" && (
            <div className="p-6 rounded-3xl bg-emerald-500 text-black text-center space-y-2 shadow-2xl animate-in zoom-in-95">
              <CheckCircle2 className="h-10 w-10 mx-auto" />
              <h3 className="text-xl font-black">Trip Completed!</h3>
              <p className="text-xs font-bold">
                ₹340.00 added to your daily earnings. Instant Razorpay payout scheduled.
              </p>
            </div>
          )}

          {/* IDLE / WAITING RADAR */}
          {tripStage === "IDLE" && (
            <div className="p-8 text-center rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mx-auto text-black dark:text-white">
                <Navigation className="h-6 w-6 text-black dark:text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-black dark:text-white">Searching for trips in Central Delhi...</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                High demand near Connaught Place & Aerocity. You will receive an offer automatically when a rider requests.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTripStage("OFFER_INCOMING");
                  setCountdown(15);
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black text-xs font-black transition shadow-sm"
              >
                Simulate Incoming Ride Request
              </button>
            </div>
          )}

          {/* Registered Vehicle Details Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-black dark:bg-neutral-800 text-white flex items-center justify-center">
                <Car className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white">Toyota Camry Hybrid 2024</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Commercial Taxi Permit · Verified</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 font-mono font-bold text-xs text-black dark:text-white">
              DL 01 AB 1234
            </span>
          </div>
        </div>

        {/* BOTTOM FIXED STATUS BAR */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#070709] flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>CabGo Driver Protection Active</span>
          </div>
          <span className="font-semibold text-neutral-500 dark:text-neutral-400">Razorpay Direct Payouts</span>
        </div>
      </div>

      {/* RIGHT PANEL: Live Interactive Leaflet Map */}
      <div className="flex-1 h-full relative overflow-hidden bg-neutral-100 dark:bg-neutral-950">
        <Map
          className="w-full h-full min-h-[350px]"
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          routeCoordinates={routeCoordinates}
          activeDriverCoords={activeCarCoords}
          driverName="You (CabGo Partner)"
        />
      </div>
    </div>
  );
}
