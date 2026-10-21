import React, { useState } from "react";
import { Star, X, Check, ThumbsUp, Sparkles } from "lucide-react";
import { getApiUrl } from "../lib/api";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId?: string;
  driverName?: string;
  onSubmitted?: () => void;
}

const COMPLIMENT_BADGES = [
  "Clean car",
  "Great conversation",
  "Smooth driving",
  "On time",
  "Safe driving",
  "Polite & professional",
];

export function RatingModal({
  isOpen,
  onClose,
  rideId = "CABGO-TRIP",
  driverName = "David Chen",
  onSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedBadges, setSelectedBadges] = useState<string[]>(["Clean car", "Smooth driving"]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleBadge = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch(getApiUrl("/api/reviews"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId,
          rating,
          comment,
          badges: selectedBadges,
        }),
      });
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      if (onSubmitted) onSubmitted();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black text-black dark:text-white">Thank you!</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Your rating and compliments have been shared with {driverName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-emerald-400 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Rate Your Trip
              </div>
              <h2 className="text-2xl font-black text-black dark:text-white">How was your ride with {driverName}?</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Trip #{rideId}</p>
            </div>

            {/* Interactive Stars */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300 dark:text-neutral-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Compliment Badges */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">Give a compliment</label>
              <div className="flex flex-wrap gap-2">
                {COMPLIMENT_BADGES.map((badge) => {
                  const isSelected = selectedBadges.includes(badge);
                  return (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => toggleBadge(badge)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-black dark:bg-emerald-500 text-white dark:text-black"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {isSelected && <ThumbsUp className="h-3 w-3" />}
                      <span>{badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Comment */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Add a comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share more details about your experience..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-black dark:focus:border-emerald-400 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-600 disabled:opacity-50 text-white dark:text-black font-extrabold text-xs transition shadow-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
