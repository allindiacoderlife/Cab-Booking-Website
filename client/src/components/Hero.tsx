import React, { useState } from "react";
import {
  Car,
  DollarSign,
  Package,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";

interface HeroProps {
  onStartRide: (pickupText: string, dropoffText: string) => void;
  onGoToDrive: () => void;
}

export function Hero({ onStartRide, onGoToDrive }: HeroProps) {
  const [activeTab, setActiveTab] = useState<"ride" | "drive" | "package">("ride");
  const [pickup, setPickup] = useState("Connaught Place, New Delhi");
  const [dropoff, setDropoff] = useState("Indira Gandhi International Airport (DEL)");

  const handleSeePrices = (e: React.FormEvent) => {
    e.preventDefault();
    onStartRide(pickup, dropoff);
  };

  return (
    <section className="relative bg-white dark:bg-[#0a0a0c] text-black dark:text-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Tabbed Card */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tabs Header */}
            <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <button
                onClick={() => setActiveTab("ride")}
                className={`flex items-center gap-2 pb-2 text-sm font-black transition relative ${
                  activeTab === "ride"
                    ? "text-black dark:text-white after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-emerald-500"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Ride</span>
              </button>

              <button
                onClick={() => setActiveTab("drive")}
                className={`flex items-center gap-2 pb-2 text-sm font-black transition relative ${
                  activeTab === "drive"
                    ? "text-black dark:text-white after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-emerald-500"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <DollarSign className="h-4 w-4" />
                <span>Drive</span>
              </button>

              <button
                onClick={() => setActiveTab("package")}
                className={`flex items-center gap-2 pb-2 text-sm font-black transition relative ${
                  activeTab === "package"
                    ? "text-black dark:text-white after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-emerald-500"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Courier</span>
              </button>
            </div>

            {/* Tab 1: RIDE */}
            {activeTab === "ride" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-black dark:text-white">
                    Go anywhere with <span className="text-emerald-500">CabGo</span>
                  </h1>
                  <p className="text-base text-neutral-600 dark:text-neutral-400 font-normal">
                    Request a ride, hop in, and go. Upfront pricing, verified drivers, and real-time tracking.
                  </p>
                </div>

                <form onSubmit={handleSeePrices} className="space-y-3.5">
                  <div className="relative space-y-2.5">
                    {/* Connecting line */}
                    <div className="absolute left-[22px] top-6 bottom-6 w-0.5 bg-neutral-300 dark:bg-neutral-700 pointer-events-none" />

                    {/* Pickup Input */}
                    <div className="relative flex items-center">
                      <div className="absolute left-4.5 h-2.5 w-2.5 rounded-full bg-black dark:bg-emerald-400 z-10" />
                      <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Pickup location"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 border border-transparent focus:border-black dark:focus:border-emerald-500 text-sm font-semibold text-black dark:text-white placeholder-neutral-500 focus:outline-none transition shadow-sm"
                        required
                      />
                    </div>

                    {/* Dropoff Input */}
                    <div className="relative flex items-center">
                      <div className="absolute left-4.5 h-2.5 w-2.5 rounded-none bg-black dark:bg-emerald-400 z-10" />
                      <input
                        type="text"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        placeholder="Dropoff location"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 border border-transparent focus:border-black dark:focus:border-emerald-500 text-sm font-semibold text-black dark:text-white placeholder-neutral-500 focus:outline-none transition shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Date & Time pill */}
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer">
                      <Clock className="h-3.5 w-3.5" /> Pickup now
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer">
                      <Calendar className="h-3.5 w-3.5" /> Schedule for later
                    </span>
                  </div>

                  {/* See Prices Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-2xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-black text-sm transition shadow-lg flex items-center gap-2"
                    >
                      <span>See prices & book</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: DRIVE */}
            {activeTab === "drive" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black dark:text-white">
                    Drive with CabGo, make what you need
                  </h1>
                  <p className="text-base text-neutral-600 dark:text-neutral-400 font-normal">
                    Make money on your schedule. Flexible hours, instant payouts via Razorpay, and 24/7 driver support.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-400">Estimated Average Earnings:</span>
                    <span className="text-xl font-black text-black dark:text-emerald-400">₹35,000 – ₹55,000 / mo</span>
                  </div>
                  <p className="text-xs text-neutral-500">Based on standard weekly driving in metro Delhi NCR zones.</p>
                </div>

                <button
                  onClick={onGoToDrive}
                  className="px-8 py-3.5 rounded-2xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-black text-sm transition shadow-lg flex items-center gap-2"
                >
                  <span>Open Driver Partner Console</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Tab 3: PACKAGE */}
            {activeTab === "package" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black dark:text-white">
                    CabGo Courier: Same-day express
                  </h1>
                  <p className="text-base text-neutral-600 dark:text-neutral-400 font-normal">
                    Send packages across town in minutes. From forgotten keys to documents and gift parcels.
                  </p>
                </div>

                <button
                  onClick={() => onStartRide(pickup, "Delivery Hub")}
                  className="px-8 py-3.5 rounded-2xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-black text-sm transition shadow-lg flex items-center gap-2"
                >
                  <span>Send a parcel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: High-Impact Visual Graphic */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white p-8 lg:p-12 shadow-2xl min-h-[460px] flex flex-col justify-between border border-neutral-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-neutral-950 to-neutral-900 z-0" />
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black backdrop-blur-md border border-emerald-500/30">
                  <Zap className="h-3.5 w-3.5" />
                  CabGo Modern Mobility
                </div>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Always the ride you want, right at your fingertips.
                </h3>
                <p className="text-neutral-400 text-sm max-w-md">
                  Powered by React.js frontend, Express backend, Prisma PostgreSQL, Supabase Auth, and Razorpay Payments.
                </p>
              </div>

              {/* Ride Feature Cards Showcase */}
              <div className="relative z-10 grid grid-cols-2 gap-3 pt-6">
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400 font-medium">CabGo & Comfort</div>
                  <div className="text-base font-bold text-white">From ₹120</div>
                  <div className="text-[11px] text-emerald-400 font-medium">3 mins away</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-400 font-medium">Razorpay Verified</div>
                  <div className="text-base font-bold text-white">UPI & Cards</div>
                  <div className="text-[11px] text-neutral-400">Zero contact payments</div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="relative z-10 pt-4 flex items-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Door-to-door safety standard & 24/7 incident response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Quick Strip */}
        <div className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-black text-black dark:text-white mb-6">Suggestions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => onStartRide(pickup, dropoff)}
              className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition cursor-pointer flex flex-col justify-between h-40 group border border-transparent dark:border-neutral-800"
            >
              <div>
                <h4 className="font-bold text-base text-black dark:text-white group-hover:text-emerald-500 transition">Ride</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Go anywhere with CabGo. Request in seconds.</p>
              </div>
              <div className="self-end text-black dark:text-white group-hover:scale-110 transition-transform">
                <Car className="h-8 w-8" />
              </div>
            </div>

            <div
              onClick={() => onStartRide(pickup, "Airport Terminal")}
              className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition cursor-pointer flex flex-col justify-between h-40 group border border-transparent dark:border-neutral-800"
            >
              <div>
                <h4 className="font-bold text-base text-black dark:text-white group-hover:text-emerald-500 transition">Reserve</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Book up to 90 days in advance with locked-in rates.</p>
              </div>
              <div className="self-end text-black dark:text-white group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8" />
              </div>
            </div>

            <div
              onClick={onGoToDrive}
              className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition cursor-pointer flex flex-col justify-between h-40 group border border-transparent dark:border-neutral-800"
            >
              <div>
                <h4 className="font-bold text-base text-black dark:text-white group-hover:text-emerald-500 transition">Drive & Earn</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Drive when you want. Cash out with Razorpay.</p>
              </div>
              <div className="self-end text-black dark:text-white group-hover:scale-110 transition-transform">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>

            <div
              onClick={() => onStartRide(pickup, "Corporate Park")}
              className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition cursor-pointer flex flex-col justify-between h-40 group border border-transparent dark:border-neutral-800"
            >
              <div>
                <h4 className="font-bold text-base text-black dark:text-white group-hover:text-emerald-500 transition">Hourly</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Keep a car and driver for multi-stop errands.</p>
              </div>
              <div className="self-end text-black dark:text-white group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
