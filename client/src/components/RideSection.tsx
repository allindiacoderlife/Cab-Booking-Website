import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface RideSectionProps {
  initialPickup?: string;
  initialDropoff?: string;
  onOpenAuth: () => void;
}

interface VehicleTier {
  id: "UberX" | "Comfort" | "UberXL" | "Premier";
  name: string;
  desc: string;
  basePrice: number;
  perKm: number;
  seats: number;
  eta: string;
}

const VEHICLE_TIERS: VehicleTier[] = [
  {
    id: "UberX",
    name: "UberX",
    desc: "Affordable, everyday reliable rides",
    basePrice: 60,
    perKm: 14,
    seats: 4,
    eta: "3 mins away",
  },
  {
    id: "Comfort",
    name: "Comfort",
    desc: "Newer cars with top-rated drivers & extra legroom",
    basePrice: 90,
    perKm: 18,
    seats: 4,
    eta: "5 mins away",
  },
  {
    id: "UberXL",
    name: "UberXL",
    desc: "Spacious SUVs for up to 6 people & extra luggage",
    basePrice: 130,
    perKm: 25,
    seats: 6,
    eta: "7 mins away",
  },
  {
    id: "Premier",
    name: "Premier",
    desc: "Top-rated sedans and chauffeured experience",
    basePrice: 180,
    perKm: 32,
    seats: 4,
    eta: "6 mins away",
  },
];

type RideStage = "IDLE" | "SEARCHING" | "ASSIGNED" | "ARRIVING" | "ON_TRIP" | "COMPLETED";

export function RideSection({
  initialPickup = "Connaught Place, New Delhi",
  initialDropoff = "Indira Gandhi International Airport (DEL)",
  onOpenAuth,
}: RideSectionProps) {
  const { user } = useAuth();

  const [pickup, setPickup] = useState(initialPickup);
  const [dropoff, setDropoff] = useState(initialDropoff);
  const [stops, setStops] = useState<{ id: string; address: string; lat: number; lng: number }[]>([]);
  const [newStopText, setNewStopText] = useState("");
  const [isAddingStop, setIsAddingStop] = useState(false);

  const [selectedTier, setSelectedTier] = useState<VehicleTier>(VEHICLE_TIERS[0]);
  const [distanceKm, setDistanceKm] = useState<number>(18.5);
  const [durationMins, setDurationMins] = useState<number>(28);

  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [rideStage, setRideStage] = useState<RideStage>("IDLE");
  const [driverCoordIndex, setDriverCoordIndex] = useState(0);

  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Simulated nearby drivers in New Delhi NCR
  const [nearbyDrivers] = useState([
    { id: "d1", lat: 28.618, lng: 77.215, angle: 45 },
    { id: "d2", lat: 28.608, lng: 77.202, angle: 120 },
    { id: "d3", lat: 28.625, lng: 77.228, angle: 260 },
    { id: "d4", lat: 28.595, lng: 77.210, angle: 180 },
  ]);

  // Route Polyline Coordinates between Connaught Place and Airport
  const routeCoordinates: [number, number][] = [
    [28.6315, 77.2167], // CP
    [28.625, 77.209],
    [28.6139, 77.209],
    [28.605, 77.195],
    [28.585, 77.172],
    [28.568, 77.142],
    [28.5562, 77.100], // Airport
  ];

  // Calculate fare
  const rawFare = selectedTier.basePrice + distanceKm * selectedTier.perKm + stops.length * 60;
  const finalFare = Math.max(80, Math.round(rawFare - discountAmount));

  // Ride lifecycle simulation
  useEffect(() => {
    if (!activeRide) {
      setRideStage("IDLE");
      setDriverCoordIndex(0);
      return;
    }

    // Step 1: SEARCHING -> ASSIGNED (after 2s)
    setRideStage("SEARCHING");
    const t1 = setTimeout(() => {
      setRideStage("ASSIGNED");
    }, 2500);

    // Step 2: ASSIGNED -> ARRIVING (after 5s)
    const t2 = setTimeout(() => {
      setRideStage("ARRIVING");
    }, 6000);

    // Step 3: ARRIVING -> ON_TRIP (after 10s)
    const t3 = setTimeout(() => {
      setRideStage("ON_TRIP");
    }, 11000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeRide?.id]);

  // Animate driver moving along route during ON_TRIP
  useEffect(() => {
    if (rideStage !== "ON_TRIP") return;

    const interval = setInterval(() => {
      setDriverCoordIndex((prev) => {
        if (prev >= routeCoordinates.length - 1) {
          clearInterval(interval);
          setRideStage("COMPLETED");
          setIsRatingModalOpen(true);
          return prev;
        }
        return prev + 1;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [rideStage]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "UBERFIRST" || code === "WELCOME50") {
      setDiscountAmount(75);
      setPromoMessage("Coupon applied! ₹75 discount activated.");
    } else if (code === "RAZORPAY") {
      setDiscountAmount(50);
      setPromoMessage("Razorpay Promo: ₹50 discount applied.");
    } else {
      setDiscountAmount(0);
      setPromoMessage("Invalid promo code. Try 'UBERFIRST'");
    }
  };

  const handleAddStop = () => {
    if (!newStopText.trim()) return;
    setStops([
      ...stops,
      {
        id: `stop_${Date.now()}`,
        address: newStopText,
        lat: 28.600 + Math.random() * 0.02,
        lng: 77.180 + Math.random() * 0.02,
      },
    ]);
    setNewStopText("");
    setIsAddingStop(false);
    setDistanceKm((prev) => prev + 3.2);
    setDurationMins((prev) => prev + 8);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id));
    setDistanceKm((prev) => Math.max(12, prev - 3.2));
    setDurationMins((prev) => Math.max(18, prev - 8));
  };

  // Initiate Razorpay checkout & booking
  const handleBookRideWithRazorpay = () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsProcessingPayment(true);

    processRazorpayPayment({
      amount: finalFare,
      currency: "INR",
      rideId: `UBER-${Math.floor(100000 + Math.random() * 900000)}`,
      riderName: user.fullName,
      riderEmail: user.email,
      riderPhone: user.phone || "+919876543210",
      onSuccess: async (paymentId) => {
        setIsProcessingPayment(false);

        // Submit ride to backend
        try {
          const res = await fetch(getApiUrl("/api/rides/request"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              riderId: user.id,
              pickupAddress: pickup,
              pickupLat: 28.6139,
              pickupLng: 77.209,
              dropoffAddress: dropoff,
              dropoffLat: 28.5562,
              dropoffLng: 77.1,
              stops,
              vehicleCategory: selectedTier.id.toUpperCase(),
              fare: finalFare,
              distanceKm,
              durationMins,
              promoCode: promoCode || undefined,
              discount: discountAmount,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setActiveRide({
              ...data.ride,
              paymentId,
              isPaid: true,
              driverName: "David Chen",
              driverPhone: "+91 98765 43210",
              driverRating: 4.92,
              vehiclePlate: "DL 01 AB 8842",
              vehicleModel: `${selectedTier.name} (White Camry)`,
            });
          }
        } catch {
          setActiveRide({
            id: `UBER-${Date.now().toString().slice(-6)}`,
            pickupAddress: pickup,
            dropoffAddress: dropoff,
            fare: finalFare,
            paymentId,
            status: "REQUESTED",
            vehicleCategory: selectedTier.name,
            isPaid: true,
            driverName: "David Chen",
            driverPhone: "+91 98765 43210",
            driverRating: 4.92,
            vehiclePlate: "DL 01 AB 8842",
            vehicleModel: `${selectedTier.name} (White Camry)`,
          });
        }
      },
      onFailure: (err) => {
        setIsProcessingPayment(false);
        console.error("Payment failed", err);
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
        currentLat: 28.6139,
        currentLng: 77.209,
        rideId: activeRide?.id || "UBER-SOS-ACTIVE",
      }),
    }).catch(console.warn);

    setTimeout(() => setSosActive(false), 5000);
  };

  const currentDriverCoords =
    rideStage === "ON_TRIP"
      ? routeCoordinates[driverCoordIndex]
      : rideStage === "ASSIGNED" || rideStage === "ARRIVING"
      ? [28.625, 77.212] as [number, number]
      : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authentic Uber Ride Configurator */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Ride Card (If booked) */}
          {activeRide && (
            <div className="p-5 rounded-3xl bg-black text-white border border-neutral-800 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      rideStage === "COMPLETED"
                        ? "bg-emerald-400"
                        : "bg-emerald-400 animate-ping"
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {rideStage === "SEARCHING" && "Locating nearest driver..."}
                    {rideStage === "ASSIGNED" && "Driver Confirmed!"}
                    {rideStage === "ARRIVING" && "Driver Arriving (2 mins)"}
                    {rideStage === "ON_TRIP" && "Trip in progress to Destination"}
                    {rideStage === "COMPLETED" && "Trip Completed!"}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">#{activeRide.id}</span>
              </div>

              {/* Driver Details Card (Use Case 4 & 5) */}
              {(rideStage === "ASSIGNED" ||
                rideStage === "ARRIVING" ||
                rideStage === "ON_TRIP" ||
                rideStage === "COMPLETED") && (
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-neutral-800 border-2 border-white/20 flex items-center justify-center font-bold text-white text-base">
                        DC
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">David Chen</h4>
                          <span className="text-[11px] text-amber-400 flex items-center gap-0.5 font-bold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            4.92
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">Toyota Camry · White</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-white">
                        DL 01 AB 8842
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                    <span className="text-neutral-400">Paid via Razorpay:</span>
                    <span className="font-mono text-emerald-400">₹{activeRide.fare} ({activeRide.paymentId})</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Cancel Ride or Rate Trip */}
              <div className="flex items-center gap-2 pt-1">
                {rideStage !== "COMPLETED" ? (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition"
                  >
                    Cancel Ride
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRatingModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-extrabold transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Star className="h-3.5 w-3.5 fill-black" />
                    Rate Driver & Leave Tip
                  </button>
                )}

                <a
                  href="tel:+919876543210"
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Driver
                </a>
              </div>
            </div>
          )}

          {/* Location Inputs Card */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-2xl font-black text-black">Get a ride</h2>

            <div className="relative space-y-2.5">
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-neutral-300 pointer-events-none" />

              {/* Pickup */}
              <div className="relative flex items-center">
                <div className="absolute left-3.5 h-2.5 w-2.5 rounded-full bg-black z-10" />
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Pickup location"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-150 focus:bg-white border border-transparent focus:border-black text-xs font-semibold text-black placeholder-neutral-500 focus:outline-none transition"
                />
              </div>

              {/* Intermediate Stops (Use Case 10) */}
              {stops.map((stop, idx) => (
                <div key={stop.id} className="relative flex items-center animate-in slide-in-from-top-1">
                  <div className="absolute left-3.5 h-4 w-4 rounded-full bg-neutral-800 text-white text-[9px] font-bold flex items-center justify-center z-10">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={stop.address}
                    disabled
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-black"
                  />
                  <button
                    onClick={() => handleRemoveStop(stop.id)}
                    className="absolute right-3 text-neutral-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add Stop Drawer */}
              {isAddingStop ? (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-300 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-black">
                    <span>Add Stop (Multi-Stop Ride)</span>
                    <button onClick={() => setIsAddingStop(false)}>
                      <X className="h-4 w-4 text-neutral-500" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newStopText}
                    onChange={(e) => setNewStopText(e.target.value)}
                    placeholder="Enter stop address (e.g. Cyber Hub)"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-200 text-xs text-black focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="w-full py-2 rounded-lg bg-black text-white text-xs font-bold"
                  >
                    Confirm Stop (+₹60)
                  </button>
                </div>
              ) : (
                stops.length < 3 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingStop(true)}
                    className="text-xs font-bold text-black hover:opacity-75 flex items-center gap-1.5 py-1 px-1 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add stop
                  </button>
                )
              )}

              {/* Dropoff */}
              <div className="relative flex items-center">
                <div className="absolute left-3.5 h-2.5 w-2.5 rounded-none bg-black z-10" />
                <input
                  type="text"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="Dropoff location"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-150 focus:bg-white border border-transparent focus:border-black text-xs font-semibold text-black placeholder-neutral-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Tiers Selection */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-black">Choose a ride</h3>
              <span className="text-xs text-neutral-500 font-medium">
                {distanceKm} km · ~{durationMins} mins
              </span>
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
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-neutral-50 border-black ring-1 ring-black"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
                        <Car className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-black">{tier.name}</h4>
                          <span className="text-[11px] text-neutral-500 flex items-center gap-0.5">
                            <User className="h-3 w-3" /> {tier.seats}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">{tier.eta}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-black">₹{tierFare}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Input (Use Case 11) */}
            <form onSubmit={handleApplyPromo} className="pt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo Code (UBERFIRST)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-100 border border-transparent focus:border-black text-xs font-semibold text-black placeholder-neutral-500 focus:outline-none uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-xs font-bold text-black transition"
              >
                Apply
              </button>
            </form>

            {promoMessage && (
              <p className="text-[11px] text-emerald-600 font-semibold">{promoMessage}</p>
            )}

            {/* Razorpay Booking Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleBookRideWithRazorpay}
                className="w-full py-4 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition"
              >
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span>
                  {isProcessingPayment
                    ? "Connecting to Razorpay..."
                    : `Pay ₹${finalFare} & Request ${selectedTier.name}`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 mt-2 font-medium">
                <span>Secured by Razorpay</span>
                <span>•</span>
                <span>Instant Refund on Cancellation</span>
              </div>
            </div>
          </div>

          {/* Safety & SOS Hub (Use Case 12) */}
          <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-black">
              <Shield className="h-4 w-4 text-black" />
              <span>Door-to-door safety standard</span>
            </div>
            {sosActive ? (
              <span className="text-xs font-bold text-rose-600 animate-pulse flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Emergency Alert Broadcasted!
              </span>
            ) : (
              <button
                onClick={handleTriggerSOS}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Emergency SOS
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[620px] w-full">
            <Map
              stops={stops}
              routeCoordinates={routeCoordinates}
              nearbyDrivers={nearbyDrivers}
              activeDriverCoords={currentDriverCoords}
              driverName="David Chen (Uber)"
            />
          </div>
        </div>
      </div>

      {/* Cancellation Modal (Use Case 8) */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        rideId={activeRide?.id}
        onCancelled={() => {
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
