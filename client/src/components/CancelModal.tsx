import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck } from "lucide-react";
import { getApiUrl } from "../lib/api";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId?: string;
  onCancelled: () => void;
}

const CANCELLATION_REASONS = [
  "Driver is arriving too slowly",
  "Driver is heading in the wrong direction",
  "Changed my plans",
  "Booked wrong pickup or destination",
  "Driver asked me to cancel",
  "Found alternative transportation",
];

export function CancelModal({ isOpen, onClose, rideId = "UBER-CURRENT", onCancelled }: CancelModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      await fetch(getApiUrl(`/api/rides/${rideId}/cancel`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: selectedReason }),
      });
    } catch {
      // ignore
    }
    setIsSubmitting(false);
    onCancelled();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-black border border-neutral-200 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-black">Cancel this ride?</h2>
          <p className="text-xs text-neutral-500">Trip #{rideId}</p>
        </div>

        {/* Free Cancellation Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Zero Cancellation Fee: You are cancelling within the free 2-minute window.</span>
        </div>

        {/* Reason selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-700">Select a reason:</label>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {CANCELLATION_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                  selectedReason === reason
                    ? "border-black bg-neutral-50 text-black"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-black"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs transition"
          >
            Keep Ride
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmCancel}
            className="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md"
          >
            {isSubmitting ? "Cancelling..." : "Cancel Ride"}
          </button>
        </div>
      </div>
    </div>
  );
}
