import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Map } from "./Map";
import { processRazorpayPayment } from "../lib/razorpay";
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
  Check,
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
  const [sosActive, setSosActive] = useState(false);

  // Simulated nearby drivers in New Delhi NCR
  const [nearbyDrivers] = useState([
    { id: "d1", lat: 28.618, lng: 77.215, angle: 45 },
    { id: "d2", lat: 28.608, lng: 77.202, angle: 120 },
    { id: "d3", lat: 28.625, lng: 77.228, angle: 260 },
    { id: "d4", lat: 28.595, lng: 77.210, angle: 180 },
  ]);

  // Simulated road polyline coordinates between Connaught Place and Airport
  const routeCoordinates: [number, number][] = [
    [28.6315, 77.2167], // CP
    [28.625, 77.209],
    [28.605, 77.195],
    [28.585, 77.172],
    [28.568, 77.142],
    [28.5562, 77.100], // Airport
  ];

  // Calculate fare
  const rawFare = selectedTier.basePrice + distanceKm * selectedTier.perKm + stops.length * 60;
  const finalFare = Math.max(80, Math.round(rawFare - discountAmount));

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
          const res = await fetch("/api/rides/request", {
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
            });
          }
        } catch (err) {
          console.warn("Backend error, using local active ride:", err);
          setActiveRide({
            id: `UBER-${Date.now().toString().slice(-6)}`,
            pickupAddress: pickup,
            dropoffAddress: dropoff,
            fare: finalFare,
            paymentId,
            status: "REQUESTED",
            vehicleCategory: selectedTier.name,
            isPaid: true,
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
    fetch("/api/emergency/sos", {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authentic Uber Ride Configurator */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Ride Card (If booked) */}
          {activeRide && (
            <div className="p-5 rounded-2xl bg-black text-white border border-neutral-800 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Ride Confirmed & Paid via Razorpay!
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">#{activeRide.id}</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment ID:</span>
                  <span className="font-mono text-emerald-400">{activeRide.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Fare Paid:</span>
                  <span className="font-bold text-white">₹{activeRide.fare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Driver Dispatch:</span>
                  <span className="font-semibold text-white">Assigning nearest partner (2 mins)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveRide(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition"
                >
                  Cancel Ride (Free)
                </button>
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
              <span className="text-xs font-bold text-rose-600 animate-pulse">
                Emergency Alert Broadcasted!
              </span>
            ) : (
              <button
                onClick={handleTriggerSOS}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
