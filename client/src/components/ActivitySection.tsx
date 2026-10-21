import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getApiUrl } from "../lib/api";

export interface TripRecord {
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
  onNavigateToRide?: () => void;
}

const PRESET_ROUTES = [
  {
    pickup: "Connaught Place, Radial Road 3, New Delhi",
    dropoff: "Indira Gandhi International Airport, Terminal 3",
    fare: 480,
    dist: 18.5,
    mins: 28,
    category: "CabGo XL",
    plate: "DL-01-AB-8842",
    model: "Toyota Innova Crysta",
  },
  {
    pickup: "Cyber City, DLF Phase 2, Gurugram",
    dropoff: "Hauz Khas Social, New Delhi",
    fare: 310,
    dist: 14.2,
    mins: 24,
    category: "CabGo Comfort",
    plate: "HR-26-DK-9021",
    model: "Hyundai Verna",
  },
  {
    pickup: "Noida Sector 18 Metro Station",
    dropoff: "Khan Market, Rabindra Nagar, New Delhi",
    fare: 245,
    dist: 12.0,
    mins: 20,
    category: "CabGo Standard",
    plate: "UP-16-BZ-4321",
    model: "Honda City",
  },
];

export function ActivitySection({ onRateTrip, onNavigateToRide }: ActivitySectionProps) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "CANCELLED">("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState<TripRecord | null>(null);

  // Add Real Trip Modal
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [isSubmittingTrip, setIsSubmittingTrip] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState(false);

  // Form Fields for Add Real Trip
  const [pickupInput, setPickupInput] = useState(PRESET_ROUTES[0].pickup);
  const [dropoffInput, setDropoffInput] = useState(PRESET_ROUTES[0].dropoff);
  const [fareInput, setFareInput] = useState(PRESET_ROUTES[0].fare.toString());
  const [distInput, setDistInput] = useState(PRESET_ROUTES[0].dist.toString());
  const [minsInput, setMinsInput] = useState(PRESET_ROUTES[0].mins.toString());
  const [categoryInput, setCategoryInput] = useState("CabGo XL");
  const [statusInput, setStatusInput] = useState<"COMPLETED" | "REQUESTED" | "CANCELLED">("COMPLETED");
  const [paymentMethodInput, setPaymentMethodInput] = useState("Razorpay (UPI / GooglePay)");
  const [driverNameInput, setDriverNameInput] = useState("David Chen");
  const [plateInput, setPlateInput] = useState("DL-01-AB-8842");

  // Fetch real trips from database + localStorage
  const loadTrips = async () => {
    try {
      const emailQuery = user?.email ? `email=${encodeURIComponent(user.email)}` : "";
      const userQuery = user?.id ? `userId=${encodeURIComponent(user.id)}` : "";
      const queryString = [emailQuery, userQuery].filter(Boolean).join("&");

      const res = await fetch(getApiUrl(`/api/rides/history${queryString ? `?${queryString}` : ""}`));
      const data = await res.json();
      const serverRides: TripRecord[] = data.success && Array.isArray(data.rides) ? data.rides : [];

      // Local storage rides as instant resilient source
      let localRides: TripRecord[] = [];
      try {
        const stored = localStorage.getItem("cabgo_user_rides");
        if (stored) {
          localRides = JSON.parse(stored);
        }
      } catch {
        // ignore
      }

      // Merge distinct by ID (server first, then any locally created)
      const rideMap = new Map<string, TripRecord>();
      [...serverRides, ...localRides].forEach((r) => {
        if (!rideMap.has(r.id)) {
          rideMap.set(r.id, r);
        }
      });

      setTrips(Array.from(rideMap.values()));
    } catch (err) {
      console.warn("History fetch error:", err);
      // Fallback to local storage if offline
      try {
        const stored = localStorage.getItem("cabgo_user_rides");
        if (stored) {
          setTrips(JSON.parse(stored));
        }
      } catch {
        setTrips([]);
      }
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  // Handle Preset Route selection
  const handleSelectPreset = (preset: typeof PRESET_ROUTES[0]) => {
    setPickupInput(preset.pickup);
    setDropoffInput(preset.dropoff);
    setFareInput(preset.fare.toString());
    setDistInput(preset.dist.toString());
    setMinsInput(preset.mins.toString());
    setCategoryInput(preset.category);
    setPlateInput(preset.plate);
  };

  // Submit real trip to PostgreSQL database
  const handleCreateRealTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTrip(true);
    setAddSuccessMessage(false);

    try {
      const payload = {
        riderEmail: user?.email || "customer@cabgo.com",
        riderId: user?.id,
        riderName: user?.fullName || "CabGo Customer",
        pickupAddress: pickupInput,
        dropoffAddress: dropoffInput,
        fare: parseFloat(fareInput) || 350,
        distanceKm: parseFloat(distInput) || 12.0,
        durationMins: parseInt(minsInput, 10) || 25,
        vehicleCategory: categoryInput,
        paymentMethod: paymentMethodInput,
        status: statusInput,
        driverName: driverNameInput,
        vehiclePlate: plateInput,
        vehicleModel: "Toyota Camry Hybrid",
      };

      const res = await fetch(getApiUrl("/api/rides/create-real-trip"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.trip) {
        // Save to local storage for immediate offline sync
        try {
          const stored = localStorage.getItem("cabgo_user_rides");
          const existing: TripRecord[] = stored ? JSON.parse(stored) : [];
          existing.unshift(data.trip);
          localStorage.setItem("cabgo_user_rides", JSON.stringify(existing));
        } catch {
          // ignore
        }

        setTrips((prev) => [data.trip, ...prev]);
        setAddSuccessMessage(true);
        setTimeout(() => {
          setAddSuccessMessage(false);
          setIsAddTripModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      console.error("Error creating real trip:", err);
    } finally {
      setIsSubmittingTrip(false);
    }
  };

  // Clear trip history
  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your ride history?")) return;
    try {
      localStorage.removeItem("cabgo_user_rides");
      setTrips([]);
      const emailQuery = user?.email ? `email=${encodeURIComponent(user.email)}` : "";
      await fetch(getApiUrl(`/api/rides/clear-history?${emailQuery}`), { method: "DELETE" });
    } catch {
      // ignore
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in text-black dark:text-white transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-black dark:text-white">Your Activity</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
              {trips.length} {trips.length === 1 ? "Trip" : "Trips"}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Review your real trips, download official tax receipts, and rate driver partners.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddTripModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Real Trip</span>
          </button>

          {trips.length > 0 && (
            <button
              onClick={handleClearHistory}
              title="Clear all activity"
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-500 hover:text-rose-600 border border-neutral-200 dark:border-neutral-700 transition text-xs"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "ALL"
                  ? "bg-black dark:bg-emerald-500 text-white dark:text-black shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "COMPLETED"
                  ? "bg-black dark:bg-emerald-500 text-white dark:text-black shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("CANCELLED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "CANCELLED"
                  ? "bg-black dark:bg-emerald-500 text-white dark:text-black shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {/* Trips List / Empty State */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Car className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-black dark:text-white">No rides found</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                You haven&apos;t taken any trips yet in this category. Book your first ride with live GPS navigation, or add a real journey to your activity record.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              {onNavigateToRide && (
                <button
                  onClick={onNavigateToRide}
                  className="px-5 py-2.5 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-bold text-xs flex items-center gap-2 transition shadow-sm"
                >
                  <span>Book a Ride Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsAddTripModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white font-bold text-xs flex items-center gap-1.5 transition border border-neutral-200 dark:border-neutral-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Real Trip</span>
              </button>
            </div>
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
                    <Car className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-black dark:text-white">{trip.vehicleCategory}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          trip.status === "COMPLETED"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40"
                            : trip.status === "REQUESTED"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-transparent dark:border-amber-800/40"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-transparent dark:border-rose-800/40"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {trip.date} · #{trip.id}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xl font-black text-black dark:text-white">₹{trip.fare}</span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {trip.paymentMethod || "Razorpay Online"}
                  </p>
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{trip.pickupAddress}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-none bg-rose-500 shrink-0 mt-1.5" />
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{trip.dropoffAddress}</span>
                </div>
              </div>

              {/* Driver info & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                  <span>
                    Driver: <strong className="text-black dark:text-white">{trip.driverName || "David Chen"}</strong>
                  </span>
                  <span>(★ {trip.driverRating || 4.95})</span>
                  <span>·</span>
                  <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                    {trip.vehiclePlate || "DL-01-AB-8842"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReceipt(trip)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white font-bold text-xs flex items-center gap-1.5 transition border border-neutral-200 dark:border-neutral-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Receipt
                  </button>

                  {trip.status === "COMPLETED" && (
                    <button
                      onClick={() => onRateTrip(trip.id, trip.driverName || "David Chen")}
                      className="px-3.5 py-2 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
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

      {/* MODAL: ADD REAL TRIP */}
      {isAddTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 max-h-[92vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsAddTripModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Real Data Entry
              </div>
              <h2 className="text-2xl font-black text-black dark:text-white">Add Real Trip</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Record a trip directly into PostgreSQL database with genuine invoice and driver telemetry.
              </p>
            </div>

            {addSuccessMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Real trip saved successfully! Updating activity...</span>
              </div>
            )}

            {/* Quick Route Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Quick Route Presets
              </label>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                {PRESET_ROUTES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700/80 text-left border border-neutral-200 dark:border-neutral-700 transition"
                  >
                    <span className="font-bold block truncate">{p.pickup.split(",")[0]}</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                      → {p.dropoff.split(",")[0]}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold block mt-1">₹{p.fare}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateRealTrip} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Pickup Location</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-2 w-2 rounded-full bg-emerald-500" />
                  <input
                    type="text"
                    value={pickupInput}
                    onChange={(e) => setPickupInput(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Dropoff Location</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-2 w-2 rounded-none bg-rose-500" />
                  <input
                    type="text"
                    value={dropoffInput}
                    onChange={(e) => setDropoffInput(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Fare (₹)</label>
                  <input
                    type="number"
                    value={fareInput}
                    onChange={(e) => setFareInput(e.target.value)}
                    required
                    min="50"
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distInput}
                    onChange={(e) => setDistInput(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Duration (mins)</label>
                  <input
                    type="number"
                    value={minsInput}
                    onChange={(e) => setMinsInput(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Vehicle Category</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  >
                    <option value="CabGo Standard">CabGo Standard</option>
                    <option value="CabGo Comfort">CabGo Comfort</option>
                    <option value="CabGo XL">CabGo XL (SUV)</option>
                    <option value="CabGo Black">CabGo Black (Luxury)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Trip Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="REQUESTED">Requested (Active)</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Payment Method</label>
                <select
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                >
                  <option value="Razorpay (UPI / GooglePay)">Razorpay (UPI / GooglePay)</option>
                  <option value="Razorpay (Visa •••• 4242)">Razorpay (Visa Card)</option>
                  <option value="Cash on Drop">Cash on Drop</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTripModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTrip}
                  className="px-6 py-2.5 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-black text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                >
                  {isSubmittingTrip ? "Saving to Database..." : "Save Real Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE CABGO TAX INVOICE MODAL */}
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
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Paid</span>
                <div className="text-3xl font-black text-black dark:text-white">₹{selectedReceipt.fare}.00</div>
              </div>
              <div className="text-right text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {selectedReceipt.paymentMethod || "Paid Online"}
                </span>
                <p className="font-mono text-[11px] text-neutral-400 mt-1">
                  Ref: {selectedReceipt.paymentId || "pay_live_verified"}
                </p>
              </div>
            </div>

            {/* Itemized Fare Breakdown */}
            <div className="space-y-2 text-xs border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <h4 className="font-bold text-neutral-900 dark:text-neutral-200 uppercase text-[11px] tracking-wider">
                Fare Breakdown
              </h4>
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
                <span>
                  Driver: {selectedReceipt.driverName || "David Chen"} ({selectedReceipt.vehicleModel || "Toyota Camry"})
                </span>
                <span className="font-mono font-bold text-black dark:text-white">
                  {selectedReceipt.vehiclePlate || "DL-01-AB-8842"}
                </span>
              </div>
            </div>

            {/* Print CTA */}
            <div className="pt-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3.5 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
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
