"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  User,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Car,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, role, driverProfile, updateProfile, updateDriverProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"general" | "emergency" | "payment" | "vehicle">(
    "general"
  );
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || "");
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || "");
  const [emergencyRelation, setEmergencyRelation] = useState(
    user?.emergencyContact?.relationship || "Family"
  );

  // Driver vehicle form
  const [make, setMake] = useState(driverProfile?.vehicle.make || "Tesla");
  const [model, setModel] = useState(driverProfile?.vehicle.model || "Model 3");
  const [year, setYear] = useState(driverProfile?.vehicle.year || 2024);
  const [plate, setPlate] = useState(driverProfile?.vehicle.licensePlate || "7XYZ982");
  const [category, setCategory] = useState(driverProfile?.vehicle.category || "Comfort");

  if (!isOpen || !user) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, phone });
    showSaveSuccess();
  };

  const handleSaveEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relationship: emergencyRelation,
      },
    });
    showSaveSuccess();
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverProfile) {
      updateDriverProfile({
        vehicle: {
          ...driverProfile.vehicle,
          make,
          model,
          year: Number(year),
          licensePlate: plate,
          category,
        },
      });
      showSaveSuccess();
    }
  };

  const showSaveSuccess = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{user.fullName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">{user.email}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 gap-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "general"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            General Info
          </button>
          <button
            onClick={() => setActiveTab("emergency")}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "emergency"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Emergency SOS
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "payment"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Payment Methods
          </button>
          {role === "DRIVER" && (
            <button
              onClick={() => setActiveTab("vehicle")}
              className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === "vehicle"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Car className="h-3.5 w-3.5" />
              Vehicle Info
            </button>
          )}
        </div>

        {/* Success Toast Notification */}
        {savedNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            Profile updates have been successfully saved!
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "general" && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Managed via Clerk Authentication
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "emergency" && (
            <form onSubmit={handleSaveEmergency} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Emergency SOS Feature (Use Case 12):</strong> In case of an emergency
                  during a ride, tapping the SOS button will instantly send your real-time GPS
                  location and trip status to this contact.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Sarah Morgan"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Emergency Phone Number
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 987-6543"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Relationship
                </label>
                <select
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Family">Family / Parent</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend / Colleague</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
                >
                  Save Emergency Contact
                </button>
              </div>
            </form>
          )}

          {activeTab === "payment" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-300">Saved Payment Methods</p>
                <span className="text-xs text-indigo-400 font-medium">Stripe Powered</span>
              </div>

              <div className="space-y-2.5">
                {user.paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{pm.brand || "Credit Card"}</span>
                          {pm.last4 && <span>•••• {pm.last4}</span>}
                          {pm.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Default
                            </span>
                          )}
                        </div>
                        {pm.expiry && (
                          <p className="text-[11px] text-slate-400">Expires {pm.expiry}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="w-full mt-3 py-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition"
              >
                <Plus className="h-4 w-4" />
                Add New Payment Method (Stripe)
              </button>
            </div>
          )}

          {activeTab === "vehicle" && role === "DRIVER" && (
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vehicle Make
                  </label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Tesla"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Model 3"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Model Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={2012}
                    max={2026}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="e.g. 7XYZ982"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ride Category Tier
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="Standard">Standard (Everyday affordable rides)</option>
                  <option value="Comfort">Comfort (Newer cars with extra legroom)</option>
                  <option value="XL">XL (SUV rides for up to 6 people)</option>
                  <option value="Black">Black (Premium luxury chauffeured rides)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/30"
                >
                  Save Vehicle Information
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
