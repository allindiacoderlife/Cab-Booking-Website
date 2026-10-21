import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Globe,
  HelpCircle,
  User as UserIcon,
  Car,
  ChevronDown,
  LogOut,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  History,
  Shield,
  Settings,
  Sun,
  Moon,
  Zap,
} from "lucide-react";

export type NavTab = "home" | "ride" | "drive" | "activity" | "support" | "about";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onOpenProfile: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenProfile }: NavbarProps) {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 dark:bg-[#070709]/95 backdrop-blur-md text-white border-b border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-7">
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 group transition"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Car className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black tracking-tight text-white flex items-center">
              <span>Cab</span>
              <span className="text-emerald-400">Go</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("ride")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "ride"
                  ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              Ride
            </button>
            <button
              onClick={() => setActiveTab("drive")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "drive"
                  ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              Drive
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "activity"
                  ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Activity
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "support"
                  ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Help
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "about"
                  ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Right Menu: Theme Toggle, Role Switcher, & User Account */}
        <div className="flex items-center gap-3">
          {/* THEME SWITCHER TOGGLE (Light Mode vs Midnight Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition flex items-center gap-1.5 text-xs font-bold"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-sky-400" />
                <span className="hidden sm:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* Quick Role Switcher Pill */}
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => {
                switchRole("RIDER");
                setActiveTab("ride");
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                role === "RIDER" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              Rider
            </button>
            <button
              onClick={() => {
                switchRole("DRIVER");
                setActiveTab("drive");
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                role === "DRIVER" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              Driver
            </button>
          </div>

          {/* User profile dropdown or Sign-in button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
              >
                <span className="text-xs font-bold text-white max-w-[120px] truncate hidden sm:inline">
                  {user.fullName}
                </span>
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl z-50 p-2 text-xs">
                    <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                      <p className="font-bold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                        {role} Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Settings className="h-4 w-4 text-neutral-400" />
                      Account & Safety Settings
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setActiveTab("activity");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <History className="h-4 w-4 text-neutral-400" />
                      My Trips & Invoices
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        const nextRole = role === "RIDER" ? "DRIVER" : "RIDER";
                        switchRole(nextRole);
                        setActiveTab(nextRole === "DRIVER" ? "drive" : "ride");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Car className="h-4 w-4 text-emerald-400" />
                      Switch to {role === "RIDER" ? "Driver Console" : "Rider View"}
                    </button>

                    <div className="my-1 border-t border-neutral-800" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white hover:bg-neutral-900 transition"
              >
                Log in
              </button>
              <button
                onClick={() => onOpenAuth("signup")}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition shadow-sm"
              >
                Sign up
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-black px-4 py-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab("ride");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-white"
          >
            Ride
          </button>
          <button
            onClick={() => {
              setActiveTab("drive");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-white"
          >
            Drive
          </button>
          <button
            onClick={() => {
              setActiveTab("activity");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-white"
          >
            Activity & Invoices
          </button>
          <button
            onClick={() => {
              setActiveTab("support");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-white"
          >
            Help Center
          </button>
          <button
            onClick={() => {
              toggleTheme();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-semibold text-emerald-400 flex items-center gap-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Toggle {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>
      )}
    </header>
  );
}
