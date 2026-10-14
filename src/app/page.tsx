"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { RiderDashboard } from "@/components/dashboard/RiderDashboard";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  CheckCircle2,
  Layers,
  ShieldCheck,
  CreditCard,
  MapPin,
  Clock,
  Sparkles,
  Car,
  UserCheck,
} from "lucide-react";

export default function Home() {
  const { role } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <Navbar
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Dynamic View based on Active Role */}
        {role === "RIDER" ? (
          <RiderDashboard onOpenProfile={() => setProfileModalOpen(true)} />
        ) : (
          <DriverDashboard onOpenProfile={() => setProfileModalOpen(true)} />
        )}

        {/* Phase 1 Verification & Roadmap Progress Section */}
        <section className="pt-8 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Phase 1 Milestone Complete
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Project Setup, Authentication & Dashboards
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Next.js App Router, Tailwind CSS, TypeScript architecture, and role-based access
                  control for Riders and Drivers are operational.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-2 border border-slate-700"
                >
                  <UserCheck className="h-4 w-4 text-indigo-400" />
                  Switch / Switch User
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Manage Profile
                </button>
              </div>
            </div>

            {/* Checklist of Implemented Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Next.js + Tailwind v4
                </div>
                <p className="text-[11px] text-slate-400">
                  Full-stack architecture with App Router, TypeScript, and dark-mode styling.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Role Switching
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant toggling between Rider and Driver interfaces with persistent state.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  SOS & Safety Setup
                </div>
                <p className="text-[11px] text-slate-400">
                  Emergency contacts registration & one-tap emergency alert simulation (Use Case 12).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Vehicle Management
                </div>
                <p className="text-[11px] text-slate-400">
                  Driver vehicle tier selection (Standard, Comfort, XL, Black) and status tracking.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CabGo Inc. Uber Clone Application. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Phase 1 Complete</span>
            <span>•</span>
            <span className="text-indigo-400">Phase 2: Google Maps & Routing</span>
            <span>•</span>
            <span className="text-emerald-400">Phase 3: Real-Time Matching</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
