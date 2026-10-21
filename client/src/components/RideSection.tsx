import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Map } from "./Map";
import { CancelModal } from "./CancelModal";
import { RatingModal } from "./RatingModal";
import { processRazorpayPayment } from "../lib/razorpay";
import { getApiUrl } from "../lib/api";
import {
  Car,
  Clock,
  User,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  Tag,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  X,
  Phone,
  ShieldAlert,
  Star,
  Navigation,
  ArrowUpDown,
  MapPin,
  Search,
  KeyRound,
  Banknote,
  Sparkles,
} from "lucide-react";

interface RideSectionProps {
  initialPickup?: string;
  initialDropoff?: string;
  onOpenAuth: () => void;
}

interface LocationItem {
  id: string;
  title: string;
  subtitle: string;
  coords: [number, number]; // [lat, lng]
}

const POPULAR_LOCATIONS: LocationItem[] = [
  {
    id: "loc_cp",
    title: "Connaught Place",
    subtitle: "Inner Circle, New Delhi, Delhi",
    coords: [28.6315, 77.2167],
  },
  {
    id: "loc_igi",
    title: "Indira Gandhi International Airport (DEL)",
    subtitle: "Terminal 3, New Delhi, Delhi",
    coords: [28.5562, 77.1000],
  },
  {
    id: "loc_noida18",
    title: "Noida Sector 18",
    subtitle: "Mall of India & Wave Mall, Noida, UP",
    coords: [28.5677, 77.3240],
  },
  {
    id: "loc_noida62",
    title: "Noida Sector 62",
    subtitle: "Electronic City, Noida, UP",
    coords: [28.6256, 77.3621],
  },
  {
    id: "loc_cybercity",
    title: "DLF Cyber City",
    subtitle: "DLF Phase 2, Gurugram, Haryana",
    coords: [28.4908, 77.0890],
  },
  {
    id: "loc_hauzkhas",
    title: "Hauz Khas Social & Village",
    subtitle: "Hauz Khas, New Delhi, Delhi",
    coords: [28.5494, 77.2001],
  },
  {
    id: "loc_indiagate",
    title: "India Gate",
    subtitle: "Kartavya Path, New Delhi, Delhi",
    coords: [28.6129, 77.2295],
  },
  {
    id: "loc_selectcity",
    title: "Select CITYWALK Mall",
    subtitle: "Saket District Centre, New Delhi, Delhi",
    coords: [28.5284, 77.2185],
  },
  {
    id: "loc_ndls",
    title: "New Delhi Railway Station (NDLS)",
    subtitle: "Pahar Ganj, New Delhi, Delhi",
    coords: [28.6429, 77.2195],
  },
  {
    id: "loc_aerocity",
    title: "Aerocity Hospitality District",
    subtitle: "Near T3 Airport, New Delhi, Delhi",
    coords: [28.5504, 77.1218],
  },
  {
    id: "loc_akshardham",
    title: "Akshardham Temple",
    subtitle: "NH 24, Pramukh Swami Maharaj Marg, New Delhi",
    coords: [28.6127, 77.2773],
  },
  {
    id: "loc_chandnichowk",
    title: "Chandni Chowk Market",
    subtitle: "Old Delhi, Delhi",
    coords: [28.6506, 77.2303],
  },
];

interface VehicleTier {
  id: "CabGoX" | "Comfort" | "CabGoXL" | "Premier";
  name: string;
  desc: string;
  basePrice: number;
  perKm: number;
  seats: number;
  eta: string;
  badge?: string;
}

const VEHICLE_TIERS: VehicleTier[] = [
  {
    id: "CabGoX",
    name: "CabGo Standard",
    desc: "Affordable everyday reliable rides",
    basePrice: 60,
    perKm: 14,
    seats: 4,
    eta: "3 mins away",
    badge: "Popular",
  },
  {
    id: "Comfort",
    name: "CabGo Comfort",
    desc: "Spacious sedans with top drivers & extra legroom",
    basePrice: 90,
    perKm: 18,
    seats: 4,
    eta: "5 mins away",
  },
  {
    id: "CabGoXL",
    name: "CabGo XL",
    desc: "Spacious SUVs for up to 6 & extra luggage",
    basePrice: 130,
    perKm: 25,
    seats: 6,
    eta: "7 mins away",
    badge: "For groups",
  },
  {
    id: "Premier",
    name: "CabGo Premier",
    desc: "Executive luxury sedans & chauffeured ride",
    basePrice: 180,
    perKm: 32,
    seats: 4,
    eta: "6 mins away",
  },
];

type RideStage = "IDLE" | "SEARCHING" | "ASSIGNED" | "ARRIVING" | "ON_TRIP" | "COMPLETED";

// Helper: Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c * 1.32).toFixed(1)); // 1.32 multiplier for city road curvature
}

// Helper: generate intermediate waypoints along a leg
function generateCurvedWaypoints(start: [number, number], end: [number, number], count = 3): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 1; i <= count; i++) {
    const fraction = i / (count + 1);
    const lat = start[0] + (end[0] - start[0]) * fraction + (Math.sin(fraction * Math.PI) * 0.008);
    const lng = start[1] + (end[1] - start[1]) * fraction - (Math.cos(fraction * Math.PI) * 0.006);
    points.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  }
  return points;
}

// Helper: persist rides locally for instant Activity sync
function saveRideToLocal(ride: any) {
  try {
    const existingStr = localStorage.getItem("cabgo_user_rides");
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const index = existing.findIndex((r: any) => r.id === ride.id);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...ride };
    } else {
      existing.unshift(ride);
    }
    localStorage.setItem("cabgo_user_rides", JSON.stringify(existing));
  } catch (e) {
    console.warn("Local ride save failed:", e);
  }
}

export function RideSection({
  initialPickup = "Connaught Place, New Delhi",
  initialDropoff = "Indira Gandhi International Airport (DEL)",
  onOpenAuth,
}: RideSectionProps) {
  const { user } = useAuth();

  // Locations state
  const [pickupText, setPickupText] = useState(initialPickup);
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([28.6315, 77.2167]);

  const [dropoffText, setDropoffText] = useState(initialDropoff);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number]>([28.5562, 77.1000]);

  const [stops, setStops] = useState<{ id: string; address: string; lat: number; lng: number }[]>([]);
  const [newStopText, setNewStopText] = useState("");
  const [isAddingStop, setIsAddingStop] = useState(false);

  // Active autocomplete dropdown target
  const [activeDropdown, setActiveDropdown] = useState<"pickup" | "dropoff" | "stop" | null>(null);

  // Vehicle & pricing
  const [selectedTier, setSelectedTier] = useState<VehicleTier>(VEHICLE_TIERS[0]);
  const [distanceKm, setDistanceKm] = useState<number>(18.5);
  const [durationMins, setDurationMins] = useState<number>(28);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  // Promo code & payment mode
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [paymentMode, setPaymentMode] = useState<"RAZORPAY" | "CASH">("RAZORPAY");

  // Ride booking & lifecycle
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [rideStage, setRideStage] = useState<RideStage>("IDLE");
  const [driverCoordIndex, setDriverCoordIndex] = useState(0);
  const [ridePin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Nearby simulated drivers
  const [nearbyDrivers] = useState([
    { id: "d1", lat: 28.618, lng: 77.215, angle: 45 },
    { id: "d2", lat: 28.608, lng: 77.202, angle: 120 },
    { id: "d3", lat: 28.625, lng: 77.228, angle: 260 },
    { id: "d4", lat: 28.595, lng: 77.210, angle: 180 },
  ]);

  // Recalculate route and distance whenever locations change
  useEffect(() => {
    // Collect all journey points: pickup -> stop1 -> stop2 -> dropoff
    const points: [number, number][] = [pickupCoords];
    stops.forEach((s) => points.push([s.lat, s.lng]));
    points.push(dropoffCoords);

    // Build curved polyline
    const fullRoute: [number, number][] = [];
    let totalDist = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      fullRoute.push(p1);
      fullRoute.push(...generateCurvedWaypoints(p1, p2, 4));
      totalDist += calculateDistanceKm(p1[0], p1[1], p2[0], p2[1]);
    }
    fullRoute.push(points[points.length - 1]);

    const finalDist = Math.max(2.5, Number(totalDist.toFixed(1)));
    const finalDuration = Math.round(finalDist * 1.8 + stops.length * 6);

    setRouteCoordinates(fullRoute);
    setDistanceKm(finalDist);
    setDurationMins(finalDuration);
  }, [pickupCoords, dropoffCoords, stops]);

  // Ride stage progression simulation when ride is booked
  useEffect(() => {
    if (!activeRide) {
      setRideStage("IDLE");
      setDriverCoordIndex(0);
      return;
    }

    setRideStage("SEARCHING");
    const t1 = setTimeout(() => {
      setRideStage("ASSIGNED");
    }, 2500);

    const t2 = setTimeout(() => {
      setRideStage("ARRIVING");
    }, 6000);

    const t3 = setTimeout(() => {
      setRideStage("ON_TRIP");
    }, 11000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeRide?.id]);

  // Move vehicle on map during active trip
  useEffect(() => {
    if (rideStage !== "ON_TRIP" || routeCoordinates.length === 0) return;

    const interval = setInterval(() => {
      setDriverCoordIndex((prev) => {
        if (prev >= routeCoordinates.length - 1) {
          clearInterval(interval);
          setRideStage("COMPLETED");
          setIsRatingModalOpen(true);
          if (activeRide) {
            saveRideToLocal({ ...activeRide, status: "COMPLETED" });
            fetch(getApiUrl(`/api/rides/${activeRide.id}/complete`), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }).catch(console.warn);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [rideStage, routeCoordinates]);

  // Pricing calculations
  const rawFare = selectedTier.basePrice + distanceKm * selectedTier.perKm + stops.length * 60;
  const finalFare = Math.max(70, Math.round(rawFare - discountAmount));

  // Swap pickup & dropoff
  const handleSwapLocations = () => {
    const tempText = pickupText;
    const tempCoords = pickupCoords;
    setPickupText(dropoffText);
    setPickupCoords(dropoffCoords);
    setDropoffText(tempText);
    setDropoffCoords(tempCoords);
  };

  // Autocomplete selection
  const handleSelectLocation = (loc: LocationItem, target: "pickup" | "dropoff" | "stop") => {
    if (target === "pickup") {
      setPickupText(loc.title);
      setPickupCoords(loc.coords);
    } else if (target === "dropoff") {
      setDropoffText(loc.title);
      setDropoffCoords(loc.coords);
    } else if (target === "stop") {
      setStops([
        ...stops,
        {
          id: `stop_${Date.now()}`,
          address: loc.title,
          lat: loc.coords[0],
          lng: loc.coords[1],
        },
      ]);
      setNewStopText("");
      setIsAddingStop(false);
    }
    setActiveDropdown(null);
  };

  const handleCustomStopSubmit = () => {
    if (!newStopText.trim()) return;
    // Generate slight offset coordinates near central Delhi NCR
    const lat = 28.58 + Math.random() * 0.08;
    const lng = 77.22 + Math.random() * 0.08;
    setStops([
      ...stops,
      {
        id: `stop_${Date.now()}`,
        address: newStopText.trim(),
        lat,
        lng,
      },
    ]);
    setNewStopText("");
    setIsAddingStop(false);
    setActiveDropdown(null);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "CABGOFIRST" || code === "WELCOME50" || code === "UBERFIRST") {
      setDiscountAmount(75);
      setPromoMessage("Coupon applied! ₹75 discount active.");
    } else if (code === "RAZORPAY") {
      setDiscountAmount(50);
      setPromoMessage("Razorpay Promo: ₹50 discount applied.");
    } else {
      setDiscountAmount(0);
      setPromoMessage("Invalid promo code. Try 'CABGOFIRST'");
    }
  };

  // Booking action
  const handleBookRide = () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (paymentMode === "CASH") {
      // Cash Booking
      const rideData = {
        id: `CABGO-${Math.floor(100000 + Math.random() * 900000)}`,
        pickupAddress: pickupText,
        dropoffAddress: dropoffText,
        fare: finalFare,
        paymentId: "CASH_ON_DROP",
        paymentMethod: "Cash on Drop",
        status: "REQUESTED" as const,
        vehicleCategory: selectedTier.name,
        isPaid: false,
        driverName: "David Chen",
        driverRating: 4.95,
        vehiclePlate: "DL 01 AB 8842",
        vehicleModel: `${selectedTier.name} (White Camry)`,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        distanceKm,
        durationMins,
      };
      setActiveRide(rideData);
      saveRideToLocal(rideData);

      fetch(getApiUrl("/api/rides/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rideData.id,
          riderId: user.id,
          riderEmail: user.email,
          riderName: user.fullName,
          pickupAddress: pickupText,
          pickupLat: pickupCoords[0],
          pickupLng: pickupCoords[1],
          dropoffAddress: dropoffText,
          dropoffLat: dropoffCoords[0],
          dropoffLng: dropoffCoords[1],
          stops,
          vehicleCategory: selectedTier.id.toUpperCase(),
          fare: finalFare,
          distanceKm,
          durationMins,
          promoCode: promoCode || undefined,
          discount: discountAmount,
          paymentMethod: "CASH",
        }),
      }).catch(console.warn);

      return;
    }

    // Razorpay Online Payment Booking
    setIsProcessingPayment(true);
    processRazorpayPayment({
      amount: finalFare,
      currency: "INR",
      rideId: `CABGO-${Math.floor(100000 + Math.random() * 900000)}`,
      riderName: user.fullName,
      riderEmail: user.email,
      riderPhone: user.phone || "+919876543210",
      onSuccess: async (paymentId) => {
        setIsProcessingPayment(false);
        const rideData = {
          id: `CABGO-${Math.floor(100000 + Math.random() * 900000)}`,
          pickupAddress: pickupText,
          dropoffAddress: dropoffText,
          fare: finalFare,
          paymentId,
          paymentMethod: "Razorpay (UPI / Online)",
          status: "REQUESTED" as const,
          vehicleCategory: selectedTier.name,
          isPaid: true,
          driverName: "David Chen",
          driverRating: 4.95,
          vehiclePlate: "DL 01 AB 8842",
          vehicleModel: `${selectedTier.name} (White Camry)`,
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          distanceKm,
          durationMins,
        };
        setActiveRide(rideData);
        saveRideToLocal(rideData);

        fetch(getApiUrl("/api/rides/request"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: rideData.id,
            riderId: user.id,
            riderEmail: user.email,
            riderName: user.fullName,
            pickupAddress: pickupText,
            pickupLat: pickupCoords[0],
            pickupLng: pickupCoords[1],
            dropoffAddress: dropoffText,
            dropoffLat: dropoffCoords[0],
            dropoffLng: dropoffCoords[1],
            stops,
            vehicleCategory: selectedTier.id.toUpperCase(),
            fare: finalFare,
            distanceKm,
            durationMins,
            promoCode: promoCode || undefined,
            discount: discountAmount,
            paymentId,
            paymentMethod: "Razorpay",
          }),
        }).catch(console.warn);
      },
      onFailure: (err) => {
        setIsProcessingPayment(false);
        console.error("Razorpay failed", err);
      },
    });
  };

  const handleTriggerSOS = async () => {
    setSosActive(true);
    fetch(getApiUrl("/api/emergency/sos"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        riderName: user?.fullName || "Guest Rider",
        contactName: "Emergency Services / Police (112)",
        contactPhone: "112",
        currentLat: pickupCoords[0],
        currentLng: pickupCoords[1],
        rideId: activeRide?.id || "CABGO-SOS-ACTIVE",
      }),
    }).catch(console.warn);

    setTimeout(() => setSosActive(false), 5000);
  };

  const currentDriverCoords =
    rideStage === "ON_TRIP" && routeCoordinates.length > 0
      ? routeCoordinates[driverCoordIndex]
      : rideStage === "ASSIGNED" || rideStage === "ARRIVING"
      ? [pickupCoords[0] + 0.005, pickupCoords[1] + 0.004] as [number, number]
      : undefined;

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-[#0a0a0c] text-black dark:text-white transition-colors duration-200">
      {/* LEFT PANEL: Authentic CabGo Booking Sidebar */}
      <div className="w-full lg:w-[480px] xl:w-[500px] h-full flex flex-col bg-white dark:bg-[#0c0c10] border-r border-neutral-200 dark:border-neutral-800 shadow-2xl z-20 shrink-0 transition-colors duration-200">
        {/* Top Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ACTIVE RIDE DRAWER (Appears immediately upon booking) */}
          {activeRide ? (
            <div className="space-y-4 animate-in slide-in-from-top-3">
              <div className="p-5 rounded-3xl bg-black text-white space-y-4 shadow-2xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        rideStage === "COMPLETED" ? "bg-emerald-400" : "bg-emerald-400 animate-ping"
                      }`}
                    />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      {rideStage === "SEARCHING" && "Locating nearest driver..."}
                      {rideStage === "ASSIGNED" && "Driver Assigned · 2 mins away"}
                      {rideStage === "ARRIVING" && "Driver Arriving at Pickup"}
                      {rideStage === "ON_TRIP" && "Heading to Destination"}
                      {rideStage === "COMPLETED" && "Trip Completed!"}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">#{activeRide.id}</span>
                </div>

                {/* CabGo Safety PIN Code */}
                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-[11px] font-bold text-neutral-300">Share PIN with Driver</p>
                      <p className="text-[10px] text-neutral-500">Only share once in vehicle</p>
                    </div>
                  </div>
                  <div className="text-xl font-mono font-black tracking-widest text-white px-3 py-1 rounded-xl bg-neutral-800 border border-neutral-700">
                    {ridePin}
                  </div>
                </div>

                {/* Driver Profile Card */}
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-neutral-800 border-2 border-white/20 flex items-center justify-center font-black text-white text-base">
                      DC
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white">David Chen</h4>
                        <span className="text-[11px] text-amber-400 flex items-center gap-0.5 font-bold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.92
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{activeRide.vehicleModel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-mono font-black text-white">
                      DL 01 AB 8842
                    </span>
                  </div>
                </div>

                {/* Fare and payment status */}
                <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
                  <span>Fare & Method:</span>
                  <span className="font-bold text-white">
                    ₹{activeRide.fare} ({activeRide.isPaid ? "Paid via Razorpay" : "Cash on Drop"})
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {rideStage !== "COMPLETED" ? (
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition"
                    >
                      Cancel Ride
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRatingModalOpen(true)}
                      className="flex-1 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Star className="h-3.5 w-3.5 fill-black" />
                      Rate Driver
                    </button>
                  )}

                  <a
                    href="tel:+919876543210"
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">Get a ride</h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Reliable rides across Delhi NCR with live fare estimates.
                </p>
              </div>

              {/* ROUTE INPUTS CARD */}
              <div className="relative rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-3 space-y-2 border border-neutral-200 dark:border-neutral-800">
                {/* Visual Route Connector Line */}
                <div className="absolute left-[25px] top-[26px] bottom-[26px] w-[2px] bg-neutral-400 dark:bg-neutral-700 pointer-events-none" />

                {/* 1. Pickup Input */}
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 h-2.5 w-2.5 rounded-full bg-emerald-500 z-10" />
                  <input
                    type="text"
                    value={pickupText}
                    onFocus={() => setActiveDropdown("pickup")}
                    onChange={(e) => {
                      setPickupText(e.target.value);
                      setActiveDropdown("pickup");
                    }}
                    placeholder="Pickup location"
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-neutral-800 text-xs font-semibold text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-black dark:focus:border-emerald-400 shadow-sm"
                  />
                  {pickupText && (
                    <button
                      onClick={() => setPickupText("")}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {/* Pickup Autocomplete Dropdown */}
                  {activeDropdown === "pickup" && (
                    <div className="absolute top-12 left-0 right-0 z-30 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 shadow-2xl p-2 max-h-56 overflow-y-auto space-y-1 animate-in fade-in">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase px-3 py-1">
                        Suggested Pickup Locations
                      </div>
                      {POPULAR_LOCATIONS.filter(
                        (l) =>
                          l.title.toLowerCase().includes(pickupText.toLowerCase()) ||
                          l.subtitle.toLowerCase().includes(pickupText.toLowerCase())
                      ).map((loc) => (
                        <div
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc, "pickup")}
                          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-2.5 transition text-left"
                        >
                          <div className="h-7 w-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-black dark:text-emerald-400" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-black dark:text-white truncate">{loc.title}</p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{loc.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Intermediate Stops (Use Case 10) */}
                {stops.map((stop, idx) => (
                  <div key={stop.id} className="relative flex items-center animate-in slide-in-from-top-1">
                    <div className="absolute left-2.5 h-4 w-4 rounded-full bg-neutral-800 text-white text-[9px] font-black flex items-center justify-center z-10">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={stop.address}
                      disabled
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white dark:bg-neutral-800 text-xs font-semibold text-black dark:text-white border border-neutral-200 dark:border-neutral-700"
                    />
                    <button
                      onClick={() => handleRemoveStop(stop.id)}
                      className="absolute right-2.5 text-neutral-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Add Stop Drawer */}
                {isAddingStop ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 space-y-2 relative animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-black dark:text-white">
                      <span>Add intermediate stop</span>
                      <button onClick={() => setIsAddingStop(false)}>
                        <X className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={newStopText}
                        onChange={(e) => {
                          setNewStopText(e.target.value);
                          setActiveDropdown("stop");
                        }}
                        placeholder="Search stop address (e.g. Noida, Delhi, Cyber City)"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:bg-white dark:focus:bg-neutral-800 focus:border focus:border-black dark:focus:border-emerald-400"
                      />

                      {/* Dropdown suggestions for stop */}
                      {activeDropdown === "stop" && (
                        <div className="absolute top-10 left-0 right-0 z-30 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-2xl p-1 max-h-48 overflow-y-auto space-y-1">
                          {POPULAR_LOCATIONS.filter((l) =>
                            l.title.toLowerCase().includes(newStopText.toLowerCase())
                          ).map((loc) => (
                            <div
                              key={loc.id}
                              onClick={() => handleSelectLocation(loc, "stop")}
                              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-left text-xs font-semibold text-black dark:text-white"
                            >
                              {loc.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCustomStopSubmit}
                      className="w-full py-2 rounded-lg bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-600 text-white dark:text-black text-xs font-bold transition"
                    >
                      Confirm Stop (+₹60)
                    </button>
                  </div>
                ) : (
                  stops.length < 3 && (
                    <div className="flex justify-between items-center pl-9 pr-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingStop(true)}
                        className="text-xs font-bold text-black dark:text-emerald-400 hover:opacity-70 flex items-center gap-1 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add stop
                      </button>
                      <button
                        type="button"
                        onClick={handleSwapLocations}
                        className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition"
                        title="Swap pickup & dropoff"
                      >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                )}

                {/* 2. Dropoff Input */}
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 h-2.5 w-2.5 rounded-none bg-rose-500 z-10" />
                  <input
                    type="text"
                    value={dropoffText}
                    onFocus={() => setActiveDropdown("dropoff")}
                    onChange={(e) => {
                      setDropoffText(e.target.value);
                      setActiveDropdown("dropoff");
                    }}
                    placeholder="Dropoff destination"
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-neutral-800 text-xs font-semibold text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-black dark:focus:border-emerald-400 shadow-sm"
                  />
                  {dropoffText && (
                    <button
                      onClick={() => setDropoffText("")}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {/* Dropoff Autocomplete Dropdown */}
                  {activeDropdown === "dropoff" && (
                    <div className="absolute top-12 left-0 right-0 z-30 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 shadow-2xl p-2 max-h-56 overflow-y-auto space-y-1 animate-in fade-in">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase px-3 py-1">
                        Suggested Dropoff Destinations
                      </div>
                      {POPULAR_LOCATIONS.filter(
                        (l) =>
                          l.title.toLowerCase().includes(dropoffText.toLowerCase()) ||
                          l.subtitle.toLowerCase().includes(dropoffText.toLowerCase())
                      ).map((loc) => (
                        <div
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc, "dropoff")}
                          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-2.5 transition text-left"
                        >
                          <div className="h-7 w-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-black dark:text-rose-400" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-black dark:text-white truncate">{loc.title}</p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{loc.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* VEHICLE TIERS SELECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 px-1">
                  <span>Available rides</span>
                  <span>{distanceKm} km · ~{durationMins} mins</span>
                </div>

                <div className="space-y-2">
                  {VEHICLE_TIERS.map((tier) => {
                    const isSelected = selectedTier.id === tier.id;
                    const tierFare = Math.round(
                      tier.basePrice + distanceKm * tier.perKm + stops.length * 60 - discountAmount
                    );

                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-neutral-50 dark:bg-neutral-800/80 border-black dark:border-emerald-400 ring-2 ring-black dark:ring-emerald-400"
                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white shrink-0">
                            <Car className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-black dark:text-white">{tier.name}</h4>
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-0.5 font-bold">
                                <User className="h-2.5 w-2.5" /> {tier.seats}
                              </span>
                              {tier.badge && (
                                <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-emerald-400 text-[9px] font-black uppercase">
                                  {tier.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{tier.eta} · {tier.desc}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-black dark:text-white">₹{tierFare}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PAYMENT METHOD & PROMO CODE TOGGLES */}
              <div className="space-y-2.5 pt-1">
                {/* Payment Option Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("RAZORPAY")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMode === "RAZORPAY"
                        ? "border-black dark:border-emerald-400 bg-neutral-900 dark:bg-neutral-800 text-white shadow-sm"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Razorpay / UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("CASH")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMode === "CASH"
                        ? "border-black dark:border-emerald-400 bg-neutral-900 dark:bg-neutral-800 text-white shadow-sm"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <Banknote className="h-3.5 w-3.5 text-amber-400" />
                    <span>Cash on Drop</span>
                  </button>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (CABGOFIRST)"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-black dark:focus:border-emerald-400 text-xs font-semibold text-black dark:text-white uppercase placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-xs font-bold text-black dark:text-white transition"
                  >
                    Apply
                  </button>
                </form>

                {promoMessage && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold px-1">{promoMessage}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* BOTTOM FIXED ACTION BAR */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c10] space-y-2 transition-colors duration-200">
          {!activeRide && (
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleBookRide}
              className="w-full py-4 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-600 disabled:opacity-50 text-white dark:text-black font-black text-sm shadow-xl flex items-center justify-center gap-2 transition"
            >
              <span>
                {isProcessingPayment
                  ? "Opening Razorpay..."
                  : paymentMode === "RAZORPAY"
                  ? `Pay ₹${finalFare} & Book ${selectedTier.name}`
                  : `Book ${selectedTier.name} (₹${finalFare} Cash)`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Door-to-Door Safety & SOS */}
          <div className="flex items-center justify-between text-xs px-1 text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
              <Shield className="h-3.5 w-3.5 text-black dark:text-emerald-400" />
              <span>Safety standard verified</span>
            </div>

            {sosActive ? (
              <span className="text-xs font-bold text-rose-600 animate-pulse flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Alert Broadcasted!
              </span>
            ) : (
              <button
                onClick={handleTriggerSOS}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
              >
                <AlertTriangle className="h-3 w-3" /> SOS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Edge-to-Edge Interactive Live Map */}
      <div className="flex-1 h-full relative overflow-hidden bg-neutral-100 dark:bg-[#0a0a0c]">
        <Map
          className="w-full h-full min-h-[350px]"
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          stops={stops}
          routeCoordinates={routeCoordinates}
          nearbyDrivers={nearbyDrivers}
          activeDriverCoords={currentDriverCoords}
          driverName="David Chen (CabGo)"
        />
      </div>

      {/* Cancellation Modal (Use Case 8) */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        rideId={activeRide?.id}
        onCancelled={() => {
          if (activeRide) {
            saveRideToLocal({ ...activeRide, status: "CANCELLED" });
          }
          setActiveRide(null);
          setRideStage("IDLE");
        }}
      />

      {/* Driver Rating & Review Modal (Use Case 9) */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        rideId={activeRide?.id}
        driverName="David Chen"
        onSubmitted={() => {
          setActiveRide(null);
          setRideStage("IDLE");
        }}
      />
    </div>
  );
}
