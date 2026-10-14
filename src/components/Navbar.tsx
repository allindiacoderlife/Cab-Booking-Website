"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Car,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  Radio,
  SlidersHorizontal,
} from "lucide-react";

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export function Navbar({ onOpenProfile, onOpenAuth }: NavbarProps) {
  const { user, role, switchRole, logout, driverProfile, toggleDriverOnline } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">CabGo</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Ride-Hailing</p>
          </div>
        </div>

        {/* Center: Quick Role Switcher */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => switchRole("RIDER")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === "RIDER"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Rider View
          </button>
          <button
            onClick={() => switchRole("DRIVER")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === "DRIVER"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            Driver View
          </button>
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-3">
          {/* Driver Live Online Toggle (if in driver mode) */}
          {role === "DRIVER" && driverProfile && (
            <button
              onClick={toggleDriverOnline}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                driverProfile.isOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750"
              }`}
            >
              <Radio
                className={`h-3.5 w-3.5 ${
                  driverProfile.isOnline ? "text-emerald-400 animate-pulse" : "text-slate-500"
                }`}
              />
              <span>{driverProfile.isOnline ? "Online" : "Offline"}</span>
            </button>
          )}

          {/* User profile dropdown or Sign-in button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                    <span className="text-amber-400">★</span> {user.rating} · {role}
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                />
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="font-semibold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                      Manage Profile & Settings
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        switchRole(role === "RIDER" ? "DRIVER" : "RIDER");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                    >
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      Switch to {role === "RIDER" ? "Driver" : "Rider"} Mode
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
