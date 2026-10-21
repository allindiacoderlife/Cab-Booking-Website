import React, { useState, useEffect } from "react";
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  FileText,
  Star,
  Printer,
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getApiUrl } from "../lib/api";

interface TripRecord {
  id: string;
  date: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  distanceKm: number;
  durationMins: number;
  vehicleCategory: string;
  status: "COMPLETED" | "CANCELLED" | "REQUESTED";
  paymentId?: string;
  paymentMethod?: string;
  driverName?: string;
  driverRating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
}

interface ActivitySectionProps {
  onRateTrip: (rideId: string, driverName: string) => void;
}

export function ActivitySection({ onRateTrip }: ActivitySectionProps) {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "CANCELLED">("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState<TripRecord | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch(getApiUrl("/api/rides/history"));
        const data = await res.json();
        if (data.success && data.rides) {
          setTrips(data.rides);
        }
      } catch (err) {
        console.warn("History fetch error:", err);
      }
    }
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in text-black dark:text-white transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white">Your Activity</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Review past trips, download tax receipts, and rate your drivers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-transparent dark:border-neutral-700 self-start">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              filter === "ALL"
                ? "bg-black dark:bg-emerald-500 text-white dark:text-black shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            All Trips
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              filter === "COMPLETED"
                ? "bg-black dark:bg-emerald-500 text-white dark:text-black shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("CANCELLED")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              filter === "CANCELLED"
                ? "bg-black dark:bg-emerald-500 text-white dark:text-black shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-2">
            <Car className="h-10 w-10 mx-auto text-neutral-300" />
            <p className="text-sm font-semibold">No rides found in this category.</p>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white shrink-0">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-black dark:text-white">{trip.vehicleCategory}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          trip.status === "COMPLETED"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{trip.date} · #{trip.id}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xl font-black text-black dark:text-white">₹{trip.fare}</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{trip.paymentMethod || "Razorpay"}</p>
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span className="text-neutral-700 dark:text-neutral-300">{trip.pickupAddress}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-none bg-rose-500 shrink-0 mt-1.5" />
                  <span className="text-neutral-700 dark:text-neutral-300">{trip.dropoffAddress}</span>
                </div>
              </div>

              {/* Driver info & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                  <span>Driver: <strong className="text-black dark:text-white">{trip.driverName || "David Chen"}</strong></span>
                  <span>(★ {trip.driverRating || 4.96})</span>
                  <span>·</span>
                  <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">{trip.vehiclePlate || "DL-01-AB-1234"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReceipt(trip)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Receipt
                  </button>

                  {trip.status === "COMPLETED" && (
                    <button
                      onClick={() => onRateTrip(trip.id, trip.driverName || "David Chen")}
                      className="px-3.5 py-2 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-600 text-white dark:text-black font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Rate Driver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Printable CabGo Tax Invoice Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Receipt Header */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-black">
                  <Car className="h-4 w-4" />
                </div>
                <div className="text-3xl font-black tracking-tight text-black dark:text-white">CabGo</div>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Official Tax Invoice / Receipt
              </p>
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                <span>Invoice #{selectedReceipt.id}</span>
                <span>{selectedReceipt.date}</span>
              </div>
            </div>

            {/* Total Paid Hero */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Paid</span>
                <div className="text-3xl font-black text-black dark:text-white">₹{selectedReceipt.fare}.00</div>
              </div>
              <div className="text-right text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Paid via Razorpay
                </span>
                <p className="font-mono text-[11px] text-neutral-400 mt-1">
                  Ref: {selectedReceipt.paymentId || "pay_rzp_live_9812487"}
                </p>
              </div>
            </div>

            {/* Itemized Fare Breakdown */}
            <div className="space-y-2 text-xs border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <h4 className="font-bold text-neutral-900 dark:text-neutral-200 uppercase text-[11px] tracking-wider">Fare Breakdown</h4>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Trip Fare ({selectedReceipt.distanceKm} km · {selectedReceipt.durationMins} mins)</span>
                <span>₹{(selectedReceipt.fare * 0.88).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Booking & Platform Fee</span>
                <span>₹25.00</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Central GST (2.5%)</span>
                <span>₹{(selectedReceipt.fare * 0.025).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>State GST (2.5%)</span>
                <span>₹{(selectedReceipt.fare * 0.025).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-black dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800 text-sm">
                <span>Total Amount Charged</span>
                <span>₹{selectedReceipt.fare}.00</span>
              </div>
            </div>

            {/* Route & Driver details */}
            <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div>
                <span className="font-bold text-black dark:text-white block mb-0.5">Pickup:</span>
                <p className="text-neutral-600 dark:text-neutral-400">{selectedReceipt.pickupAddress}</p>
              </div>
              <div>
                <span className="font-bold text-black dark:text-white block mb-0.5">Dropoff:</span>
                <p className="text-neutral-600 dark:text-neutral-400">{selectedReceipt.dropoffAddress}</p>
              </div>
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>Driver: {selectedReceipt.driverName || "David Chen"} ({selectedReceipt.vehicleModel || "Toyota Camry"})</span>
                <span className="font-mono font-bold text-black dark:text-white">{selectedReceipt.vehiclePlate || "DL-01-AB-1234"}</span>
              </div>
            </div>

            {/* Print CTA */}
            <div className="pt-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3.5 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-600 text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Printer className="h-4 w-4" />
                Print or Save PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
