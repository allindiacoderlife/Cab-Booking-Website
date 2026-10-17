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
    <section className="relative bg-white text-black pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Authentic Uber Tabbed Card */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tabs Header */}
            <div className="flex items-center gap-6 border-b border-neutral-200 pb-3">
              <button
                onClick={() => setActiveTab("ride")}
                className={`flex items-center gap-2 pb-2 text-base font-bold transition relative ${
                  activeTab === "ride"
                    ? "text-black after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-black"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                <Car className="h-5 w-5" />
                <span>Ride</span>
              </button>

              <button
                onClick={() => setActiveTab("drive")}
                className={`flex items-center gap-2 pb-2 text-base font-bold transition relative ${
                  activeTab === "drive"
                    ? "text-black after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-black"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                <DollarSign className="h-5 w-5" />
                <span>Drive</span>
              </button>

              <button
                onClick={() => setActiveTab("package")}
                className={`flex items-center gap-2 pb-2 text-base font-bold transition relative ${
                  activeTab === "package"
                    ? "text-black after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[3px] after:bg-black"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Courier</span>
              </button>
            </div>

            {/* Tab 1: RIDE */}
            {activeTab === "ride" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-black">
                    Go anywhere with Uber
                  </h1>
                  <p className="text-base text-neutral-600 font-normal">
                    Request a ride, hop in, and go. Upfront pricing, verified drivers, and real-time tracking.
                  </p>
                </div>

                <form onSubmit={handleSeePrices} className="space-y-3.5">
                  <div className="relative space-y-2.5">
                    {/* Connecting line */}
                    <div className="absolute left-[22px] top-6 bottom-6 w-0.5 bg-neutral-300 pointer-events-none" />

                    {/* Pickup Input */}
                    <div className="relative flex items-center">
                      <div className="absolute left-4.5 h-2.5 w-2.5 rounded-full bg-black z-10" />
                      <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Pickup location"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-150 focus:bg-white border border-transparent focus:border-black text-sm font-semibold text-black placeholder-neutral-500 focus:outline-none transition shadow-sm"
                        required
                      />
                    </div>

                    {/* Dropoff Input */}
                    <div className="relative flex items-center">
                      <div className="absolute left-4.5 h-2.5 w-2.5 rounded-none bg-black z-10" />
                      <input
                        type="text"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        placeholder="Dropoff location"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-150 focus:bg-white border border-transparent focus:border-black text-sm font-semibold text-black placeholder-neutral-500 focus:outline-none transition shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Date & Time pill */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                    <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition cursor-pointer">
                      <Clock className="h-3.5 w-3.5" /> Pickup now
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition cursor-pointer">
                      <Calendar className="h-3.5 w-3.5" /> Schedule for later
                    </span>
                  </div>

                  {/* See Prices Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-7 py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm transition shadow-lg flex items-center gap-2"
                    >
                      <span>See prices</span>
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
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black">
                    Drive when you want, make what you need
                  </h1>
                  <p className="text-base text-neutral-600 font-normal">
                    Make money on your schedule. Flexible hours, instant payouts via Razorpay, and 24/7 support.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-100 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-700">Estimated Average Earnings:</span>
                    <span className="text-xl font-black text-black">₹35,000 – ₹55,000 / mo</span>
                  </div>
                  <p className="text-xs text-neutral-500">Based on standard 30–40 hours weekly driving in metro zones.</p>
                </div>

                <button
                  onClick={onGoToDrive}
                  className="px-7 py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm transition shadow-lg flex items-center gap-2"
                >
                  <span>Get started as a driver</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Tab 3: PACKAGE */}
            {activeTab === "package" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black">
                    Uber Connect: Same-day delivery
                  </h1>
                  <p className="text-base text-neutral-600 font-normal">
                    Send packages across town in minutes. From forgotten keys to surprise birthday gifts.
                  </p>
                </div>

                <button
                  onClick={() => onStartRide(pickup, "Delivery Hub")}
                  className="px-7 py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm transition shadow-lg flex items-center gap-2"
                >
                  <span>Send a package</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: High-Impact Visual Graphic */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-8 lg:p-12 shadow-2xl min-h-[460px] flex flex-col justify-between border border-neutral-800">
              {/* Background gradient & art */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-neutral-900 to-neutral-800 z-0" />
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/15">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Uber Clone Production Stack
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-tight">
                  Always the ride you want, right at your fingertips.
                </h3>
                <p className="text-neutral-400 text-sm max-w-md">
                  Powered by React.js frontend, Express.js backend, Prisma PostgreSQL schema, Supabase Auth, and Razorpay Payments.
                </p>
              </div>

              {/* Ride Feature Cards Showcase */}
              <div className="relative z-10 grid grid-cols-2 gap-3 pt-6">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-300 font-medium">UberX & Comfort</div>
                  <div className="text-base font-bold text-white">From ₹120</div>
                  <div className="text-[11px] text-emerald-400 font-medium">3 mins away</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="text-xs text-neutral-300 font-medium">Razorpay Verified</div>
                  <div className="text-base font-bold text-white">UPI & Cards</div>
                  <div className="text-[11px] text-neutral-400">Zero contact payments</div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="relative z-10 pt-4 flex items-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Door-to-door safety standard & 24/7 support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Quick Strip (Official Uber Style) */}
        <div className="mt-16 pt-12 border-t border-neutral-200">
          <h2 className="text-2xl font-black text-black mb-6">Suggestions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => onStartRide(pickup, dropoff)}
              className="p-5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 transition cursor-pointer flex flex-col justify-between h-40 group"
            >
              <div>
                <h4 className="font-bold text-base text-black group-hover:underline">Ride</h4>
                <p className="text-xs text-neutral-500 mt-1">Go anywhere with Uber. Request in seconds.</p>
              </div>
              <div className="self-end">
                <Car className="h-8 w-8 text-black" />
              </div>
            </div>

            <div
              onClick={() => onStartRide(pickup, "Airport Terminal")}
              className="p-5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 transition cursor-pointer flex flex-col justify-between h-40 group"
            >
              <div>
                <h4 className="font-bold text-base text-black group-hover:underline">Reserve</h4>
                <p className="text-xs text-neutral-500 mt-1">Book up to 90 days in advance with lock-in rates.</p>
              </div>
              <div className="self-end">
                <Calendar className="h-8 w-8 text-black" />
              </div>
            </div>

            <div
              onClick={onGoToDrive}
              className="p-5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 transition cursor-pointer flex flex-col justify-between h-40 group"
            >
              <div>
                <h4 className="font-bold text-base text-black group-hover:underline">Drive & Earn</h4>
                <p className="text-xs text-neutral-500 mt-1">Drive when you want. Cash out with Razorpay.</p>
              </div>
              <div className="self-end">
                <DollarSign className="h-8 w-8 text-black" />
              </div>
            </div>

            <div
              onClick={() => onStartRide(pickup, "Corporate Park")}
              className="p-5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 transition cursor-pointer flex flex-col justify-between h-40 group"
            >
              <div>
                <h4 className="font-bold text-base text-black group-hover:underline">Hourly</h4>
                <p className="text-xs text-neutral-500 mt-1">Keep a car and driver for multi-stop errands.</p>
              </div>
              <div className="self-end">
                <Clock className="h-8 w-8 text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
