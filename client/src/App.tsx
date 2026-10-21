import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar, type NavTab } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { RideSection } from "./components/RideSection";
import { DriveSection } from "./components/DriveSection";
import { ActivitySection } from "./components/ActivitySection";
import { SupportSection } from "./components/SupportSection";
import { AuthModal } from "./components/AuthModal";
import { ProfileModal } from "./components/ProfileModal";
import { RatingModal } from "./components/RatingModal";
import { Footer } from "./components/Footer";
import {
  Car,
  Briefcase,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Database,
  Lock,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

function MainContent() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Rating modal state for past trips from ActivitySection
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingRideInfo, setRatingRideInfo] = useState<{ id: string; driver: string }>({
    id: "CABGO-TRIP",
    driver: "David Chen",
  });

  const [selectedPickup, setSelectedPickup] = useState("Connaught Place, New Delhi");
  const [selectedDropoff, setSelectedDropoff] = useState("Indira Gandhi International Airport (DEL)");

  const handleStartRide = (pickupText: string, dropoffText: string) => {
    setSelectedPickup(pickupText);
    setSelectedDropoff(dropoffText);
    setActiveTab("ride");
  };

  const handleGoToDrive = () => {
    setActiveTab("drive");
  };

  const handleOpenAuth = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleRatePastTrip = (rideId: string, driverName: string) => {
    setRatingRideInfo({ id: rideId, driver: driverName });
    setRatingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#070709] text-black dark:text-white font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Official CabGo Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <main className="flex-1">
        {/* TAB 1: HOMEPAGE (CabGo Leading Page) */}
        {activeTab === "home" && (
          <div>
            <Hero onStartRide={handleStartRide} onGoToDrive={handleGoToDrive} />

            {/* CabGo for Business Section */}
            <section className="py-20 bg-neutral-100 dark:bg-[#0c0c10] border-b border-neutral-200 dark:border-neutral-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-black">
                      <Briefcase className="h-3.5 w-3.5" />
                      Corporate Mobility
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
                      CabGo for Business
                    </h2>
                    <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Transform the way your company moves, travels, and expenses. Simplify corporate travel, meal perks for employees, and delivery services worldwide.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => handleOpenAuth("signup")}
                        className="px-6 py-3.5 rounded-2xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-black text-xs transition shadow-sm flex items-center gap-2"
                      >
                        <span>Get started with CabGo Business</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-neutral-900 dark:bg-neutral-900 text-white space-y-4 shadow-2xl border border-neutral-800">
                    <div className="h-10 w-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                      <Briefcase className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold">Automated GST & Expense Reporting</h3>
                    <p className="text-xs text-neutral-400">
                      Seamless monthly billing, custom travel allowances, and Razorpay corporate card integration.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Driver Partner Feature Section */}
            <section className="py-20 bg-white dark:bg-[#070709] border-b border-neutral-200 dark:border-neutral-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="p-8 rounded-3xl bg-neutral-950 text-white space-y-4 shadow-2xl border border-neutral-800">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Car className="h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-black">Make money when you want</h3>
                    <p className="text-xs text-neutral-400">
                      Drive your own car or rent with low deposit. Instant cashouts straight to your bank account via Razorpay.
                    </p>
                    <button
                      onClick={handleGoToDrive}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition"
                    >
                      Open Driver Partner Console
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
                      Drive when you want, make what you need
                    </h2>
                    <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Make money on your schedule with rides or parcel deliveries. You can use your own car or choose a rental through CabGo Fleet.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleGoToDrive}
                        className="px-6 py-3.5 rounded-2xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-black font-black text-xs transition"
                      >
                        Sign up to drive
                      </button>
                      <button
                        onClick={() => handleOpenAuth("login")}
                        className="px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white font-bold text-xs transition"
                      >
                        Already have an account?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Safety Commitment Section */}
            <section className="py-16 bg-white dark:bg-[#0a0a0c] border-b border-neutral-200 dark:border-neutral-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-black dark:text-white">Our commitment to your safety</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Every feature, policy, and standard is designed with passenger and driver security first.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    <h3 className="text-lg font-bold text-black dark:text-white">24/7 Incident Support</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Emergency SOS button with instant broadcast to police (112) and designated emergency contacts with GPS telemetry.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <h3 className="text-lg font-bold text-black dark:text-white">Verified Drivers & Vehicles</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Rigorous multi-step background checks, vehicle inspections, and live ratings review.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: RIDE SECTION */}
        {activeTab === "ride" && (
          <RideSection
            initialPickup={selectedPickup}
            initialDropoff={selectedDropoff}
            onOpenAuth={() => handleOpenAuth("login")}
          />
        )}

        {/* TAB 3: DRIVE SECTION */}
        {activeTab === "drive" && <DriveSection onOpenAuth={handleOpenAuth} />}

        {/* TAB 4: ACTIVITY & INVOICES */}
        {activeTab === "activity" && (
          <ActivitySection
            onRateTrip={handleRatePastTrip}
            onNavigateToRide={() => setActiveTab("ride")}
          />
        )}

        {/* TAB 5: HELP & SUPPORT */}
        {activeTab === "support" && <SupportSection />}

        {/* TAB 6: ABOUT & ARCHITECTURE SECTION */}
        {activeTab === "about" && (
          <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-black">
                <Sparkles className="h-3.5 w-3.5" />
                Technical Architecture
              </div>
              <h1 className="text-4xl font-black text-black dark:text-white">CabGo Production Stack</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                React.js + Tailwind CSS, Express.js Backend, Prisma ORM, Supabase Auth, and Razorpay Payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                  <Database className="h-5 w-5 text-emerald-500" />
                  Prisma ORM & PostgreSQL
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Full relational schema with User, DriverProfile, Ride, RideStop, Razorpay Payment, and Review tables.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                  <Lock className="h-5 w-5 text-emerald-500" />
                  Supabase & Google Auth
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Secure session token exchange, Google OAuth, and backend user synchronization.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                  <CreditCard className="h-5 w-5 text-emerald-500" />
                  Razorpay Payment Gateway
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Server order creation (`/api/payments/create-order`), client checkout SDK, and HMAC SHA256 signature verification.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                  <Car className="h-5 w-5 text-emerald-500" />
                  Dynamic Theme Switcher
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Instant toggle between Clean Light Mode and Midnight OLED Dark Mode with saved localStorage state.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official CabGo Footer (Hidden on full-screen Ride & Drive map modes) */}
      {activeTab !== "ride" && activeTab !== "drive" && <Footer />}

      {/* Login & Sign Up Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* User Account & Emergency Contact Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Driver Rating & Review Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        rideId={ratingRideInfo.id}
        driverName={ratingRideInfo.driver}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
