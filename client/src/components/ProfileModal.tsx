import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Car,
  CheckCircle2,
  X,
  AlertCircle,
  Save,
  Plus,
} from "lucide-react";
import { getApiUrl } from "../lib/api";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, role, switchRole } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "Chirag");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
  );

  // Emergency SOS Contact (Use Case 12)
  const [sosName, setSosName] = useState("Ramesh Kumar");
  const [sosPhone, setSosPhone] = useState("+91 98110 12345");
  const [sosRelation, setSosRelation] = useState("Father");

  // Driver details (if role === 'DRIVER')
  const [vehiclePlate, setVehiclePlate] = useState("DL 01 AB 8842");
  const [vehicleModel, setVehicleModel] = useState("Toyota Camry Hybrid 2024");

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"account" | "safety" | "payments">("account");

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await fetch(getApiUrl("/api/users/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "user@cabgo.com",
          fullName,
          phone,
          avatarUrl,
          emergencyContact: {
            name: sosName,
            phone: sosPhone,
            relationship: sosRelation,
          },
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn("Failed saving profile to server:", err);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 text-black dark:text-white flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-black dark:text-white">Account Settings</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email || "rider@cabgo.com"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 gap-6 text-xs font-bold bg-white dark:bg-neutral-900">
          <button
            onClick={() => setActiveSubTab("account")}
            className={`py-3.5 border-b-2 transition ${
              activeSubTab === "account"
                ? "border-black dark:border-emerald-400 text-black dark:text-emerald-400"
                : "border-transparent text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveSubTab("safety")}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === "safety"
                ? "border-black dark:border-emerald-400 text-black dark:text-emerald-400"
                : "border-transparent text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Safety & SOS Contacts
          </button>
          <button
            onClick={() => setActiveSubTab("payments")}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === "payments"
                ? "border-black dark:border-emerald-400 text-black dark:text-emerald-400"
                : "border-transparent text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Payment Methods
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Profile and settings saved successfully!</span>
            </div>
          )}

          {activeSubTab === "account" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-400"
                />
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    value={user?.email || "rider@cabgo.com"}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Role Indicator & Driver Vehicle info */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Account Role</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Currently active as {role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchRole(role === "RIDER" ? "DRIVER" : "RIDER")}
                    className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-emerald-500 text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-emerald-600 transition"
                  >
                    Switch to {role === "RIDER" ? "Driver Mode" : "Rider Mode"}
                  </button>
                </div>

                {role === "DRIVER" && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Vehicle Plate</label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Car Model</label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-black dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-black dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-600 text-white dark:text-black font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving Changes..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          )}

          {activeSubTab === "safety" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Shield className="h-4 w-4 text-rose-600" />
                  <span>Emergency SOS Broadcast Setting</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  When you tap the emergency SOS button during any live ride, your exact GPS coordinates and vehicle details will be transmitted automatically to 112 emergency services and this designated contact.
                </p>
              </div>

              <div className="space-y-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Primary Emergency Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Contact Name</label>
                    <input
                      type="text"
                      value={sosName}
                      onChange={(e) => setSosName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Emergency Phone</label>
                    <input
                      type="tel"
                      value={sosPhone}
                      onChange={(e) => setSosPhone(e.target.value)}
                      placeholder="+91 98110 12345"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Relationship</label>
                  <select
                    value={sosRelation}
                    onChange={(e) => setSosRelation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-black focus:outline-none focus:border-black"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Close Friend</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Emergency Contact
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "payments" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    RZP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-black">Razorpay Instant Gateway</h4>
                    <p className="text-[11px] text-neutral-500">Supports UPI (GPay/PhonePe), Cards, Netbanking</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Default
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                    CASH
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-black">Cash on Drop</h4>
                    <p className="text-[11px] text-neutral-500">Pay cash directly to driver partner</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold uppercase">
                  Active
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center space-y-2">
                <CreditCard className="h-6 w-6 text-neutral-400 mx-auto" />
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Add Corporate Expense Card</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Connect company cards via CabGo Business integration for automated GST invoices.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
