import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { RideSection } from "./components/RideSection";
import { DriveSection } from "./components/DriveSection";
import { AuthModal } from "./components/AuthModal";
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
} from "lucide-react";

function MainContent() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<"home" | "ride" | "drive" | "about">("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

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

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Official Uber Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1">
        {/* TAB 1: HOMEPAGE (Authentic Uber Leading Page) */}
        {activeTab === "home" && (
          <div>
            <Hero onStartRide={handleStartRide} onGoToDrive={handleGoToDrive} />

            {/* Uber for Business Section */}
            <section className="py-20 bg-neutral-100 border-b border-neutral-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                      Uber for Business
                    </h2>
                    <p className="text-base text-neutral-600 leading-relaxed">
                      Transform the way your company moves, eats, and works. Simplify corporate travel, meal perks for employees, and delivery services worldwide.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => handleOpenAuth("signup")}
                        className="px-6 py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm transition shadow-sm flex items-center gap-2"
                      >
                        <span>Get started with Uber Business</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-black text-white space-y-4 shadow-xl">
                    <div className="h-10 w-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold">Automated expense reporting</h3>
                    <p className="text-xs text-neutral-400">
                      Seamless monthly billing, custom travel allowances, and Razorpay corporate card integration.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Driver Partner Feature Section */}
            <section className="py-20 bg-white border-b border-neutral-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="p-8 rounded-3xl bg-neutral-900 text-white space-y-4 shadow-xl">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Car className="h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-black">Make money when you want</h3>
                    <p className="text-xs text-neutral-300">
                      Drive your own car or rent with low deposit. Instant cashouts straight to your bank account via Razorpay.
                    </p>
                    <button
                      onClick={handleGoToDrive}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition"
                    >
                      Open Driver Console
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                      Drive when you want, make what you need
                    </h2>
                    <p className="text-base text-neutral-600 leading-relaxed">
                      Make money on your schedule with rides or deliveries. You can use your own car or choose a rental through Uber.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleGoToDrive}
                        className="px-6 py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm transition"
                      >
                        Sign up to drive
                      </button>
                      <button
                        onClick={() => handleOpenAuth("login")}
                        className="px-6 py-3.5 rounded-xl bg-neutral-150 hover:bg-neutral-200 text-black font-bold text-sm transition"
                      >
                        Already have an account?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Safety Commitment Section */}
            <section className="py-16 bg-white border-b border-neutral-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-black">Our commitment to your safety</h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    Every feature, policy, and standard is designed with passenger and driver security first.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <ShieldCheck className="h-6 w-6 text-black" />
                    <h3 className="text-lg font-bold text-black">24/7 Incident Support</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Emergency SOS button with instant broadcast to police and designated emergency contacts with GPS telemetry.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <CheckCircle2 className="h-6 w-6 text-black" />
                    <h3 className="text-lg font-bold text-black">Verified Drivers & Vehicles</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
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
        {activeTab === "drive" && <DriveSection />}

        {/* TAB 4: ABOUT & ARCHITECTURE SECTION */}
        {activeTab === "about" && (
          <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-black border border-neutral-200">
                <Sparkles className="h-3.5 w-3.5" />
                Technical Overview
              </div>
              <h1 className="text-4xl font-black text-black">Uber Full-Stack Architecture</h1>
              <p className="text-sm text-neutral-600">
                Built strictly to specifications: React.js + Tailwind CSS, Express.js Backend, Prisma ORM, Supabase Auth, and Razorpay Payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black">
                  <Database className="h-5 w-5" />
                  Prisma ORM & PostgreSQL
                </div>
                <p className="text-xs text-neutral-600">
                  Full relational schema with User, DriverProfile, Ride, RideStop, Razorpay Payment, and Review tables.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black">
                  <Lock className="h-5 w-5" />
                  Supabase & Google Auth
                </div>
                <p className="text-xs text-neutral-600">
                  Secure session token exchange, Google OAuth, and backend user synchronization.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black">
                  <CreditCard className="h-5 w-5" />
                  Razorpay Payment Gateway
                </div>
                <p className="text-xs text-neutral-600">
                  Server order creation (`/api/payments/create-order`), client checkout SDK, and HMAC SHA256 signature verification.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-black">
                  <Car className="h-5 w-5" />
                  Uber Look & Feel
                </div>
                <p className="text-xs text-neutral-600">
                  Official Uber typography, black/white minimalist aesthetic, tabbed hero, and multi-stop route planner.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official Uber Footer */}
      <Footer />

      {/* Login & Sign Up Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
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
