import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  Lock,
  ArrowRight,
  QrCode,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getApiUrl } from "../lib/api";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  rideId: string;
  riderName: string;
  riderEmail: string;
  riderPhone?: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "WALLET";

export function RazorpayModal({
  isOpen,
  onClose,
  amount,
  rideId,
  riderName,
  riderEmail,
  riderPhone = "+91 98765 43210",
  onSuccess,
  onFailure,
}: RazorpayModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentMethod>("UPI");
  const [selectedUpiApp, setSelectedUpiApp] = useState<"gpay" | "phonepe" | "paytm" | "qr" | "id">("gpay");
  const [upiIdInput, setUpiIdInput] = useState("rider@okhdfcbank");

  // Card details
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("789");
  const [cardName, setCardName] = useState(riderName || "Chirag Saxena");

  // Netbanking
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<"gateway" | "authorizing" | "success" | null>(null);
  const [generatedPaymentId, setGeneratedPaymentId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setProcessingStep(null);
      setGeneratedPaymentId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setIsProcessing(true);
    setProcessingStep("gateway");

    const paymentId = `pay_rzp_live_${Math.floor(10000000 + Math.random() * 90000000)}`;
    setGeneratedPaymentId(paymentId);

    // Simulated 2-stage authentication
    setTimeout(() => {
      setProcessingStep("authorizing");
    }, 1100);

    setTimeout(async () => {
      setProcessingStep("success");

      // Verify on backend to save payment record into PostgreSQL
      try {
        await fetch(getApiUrl("/api/payments/verify"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: `order_${rideId}`,
            razorpayPaymentId: paymentId,
            razorpaySignature: "test_verified_signature",
            rideId,
          }),
        });
      } catch (err) {
        console.warn("Backend payment record sync notice:", err);
      }

      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(paymentId);
        onClose();
      }, 1000);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0c1322] rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 text-black dark:text-white flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#0b284c] to-[#072654] p-5 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Razorpay Official Diagonal Icon */}
            <div className="h-10 w-10 rounded-xl bg-[#0284c7] flex items-center justify-center shadow-lg shadow-sky-900/50">
              <span className="text-xl font-black italic tracking-tighter text-white">R</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">Razorpay</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-500/30 text-sky-200 border border-sky-400/30">
                  Trusted Gateway
                </span>
              </div>
              <p className="text-xs text-sky-200/80">CabGo Mobility Solutions · #{rideId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-sky-200/70 tracking-wider block">Payable</span>
              <span className="text-xl font-black text-white">₹{amount}.00</span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition disabled:opacity-30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Processing State Overlay */}
        {isProcessing ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-5 min-h-[380px] bg-white dark:bg-[#0c1322]">
            {processingStep === "gateway" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-sky-200 dark:border-sky-950 animate-ping opacity-25" />
                  <div className="h-16 w-16 rounded-full border-4 border-sky-500 border-t-transparent animate-spin flex items-center justify-center" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-black dark:text-white">Connecting to Razorpay</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Establishing secure 256-bit encrypted bank tunnel...
                  </p>
                </div>
              </div>
            )}

            {processingStep === "authorizing" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="h-16 w-16 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center mx-auto animate-pulse">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-black dark:text-white">Authorizing ₹{amount}.00</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Awaiting UPI / Bank payment confirmation...
                  </p>
                </div>
              </div>
            )}

            {processingStep === "success" && (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">Payment Successful!</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Transaction ID: <span className="font-mono font-bold text-black dark:text-white">{generatedPaymentId}</span>
                  </p>
                  <p className="text-[11px] text-neutral-400">Confirming your CabGo ride driver now...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* Left Method Tabs */}
            <div className="w-full sm:w-48 bg-neutral-50 dark:bg-[#080d17] border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-neutral-800 p-2 sm:p-3 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("UPI")}
                className={`w-full px-3 py-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between transition ${
                  activeTab === "UPI"
                    ? "bg-[#0284c7] text-white shadow-md shadow-sky-600/20"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>UPI / QR</span>
                </div>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-black/20 text-white">
                  Fast
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("CARD")}
                className={`w-full px-3 py-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between transition ${
                  activeTab === "CARD"
                    ? "bg-[#0284c7] text-white shadow-md shadow-sky-600/20"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Cards</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("NETBANKING")}
                className={`w-full px-3 py-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between transition ${
                  activeTab === "NETBANKING"
                    ? "bg-[#0284c7] text-white shadow-md shadow-sky-600/20"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Netbanking</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("WALLET")}
                className={`w-full px-3 py-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between transition ${
                  activeTab === "WALLET"
                    ? "bg-[#0284c7] text-white shadow-md shadow-sky-600/20"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>Wallets</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            </div>

            {/* Right Tab Content */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* TAB 1: UPI */}
              {activeTab === "UPI" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Select UPI Application
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Instant Zero Fee
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp("gpay")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        selectedUpiApp === "gpay"
                          ? "border-[#0284c7] bg-sky-50 dark:bg-sky-950/40 text-black dark:text-white ring-2 ring-[#0284c7]/40"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-black text-xs text-sky-600">
                        GPay
                      </div>
                      <div>
                        <p className="text-xs font-bold">Google Pay</p>
                        <p className="text-[10px] text-neutral-500">Tap to pay</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp("phonepe")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        selectedUpiApp === "phonepe"
                          ? "border-[#0284c7] bg-sky-50 dark:bg-sky-950/40 text-black dark:text-white ring-2 ring-[#0284c7]/40"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                        Pe
                      </div>
                      <div>
                        <p className="text-xs font-bold">PhonePe</p>
                        <p className="text-[10px] text-neutral-500">Instant UPI</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp("paytm")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        selectedUpiApp === "paytm"
                          ? "border-[#0284c7] bg-sky-50 dark:bg-sky-950/40 text-black dark:text-white ring-2 ring-[#0284c7]/40"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-[10px]">
                        Paytm
                      </div>
                      <div>
                        <p className="text-xs font-bold">Paytm UPI</p>
                        <p className="text-[10px] text-neutral-500">Fast checkout</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp("qr")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        selectedUpiApp === "qr"
                          ? "border-[#0284c7] bg-sky-50 dark:bg-sky-950/40 text-black dark:text-white ring-2 ring-[#0284c7]/40"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-xs">
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Scan QR Code</p>
                        <p className="text-[10px] text-neutral-500">Any UPI app</p>
                      </div>
                    </button>
                  </div>

                  {/* QR Code view */}
                  {selectedUpiApp === "qr" ? (
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-2">
                      <div className="p-3 bg-white rounded-xl inline-block shadow-sm">
                        {/* Simulated QR Code SVG */}
                        <svg className="w-28 h-28" viewBox="0 0 100 100" fill="black">
                          <rect x="10" y="10" width="30" height="30" fill="black" />
                          <rect x="15" y="15" width="20" height="20" fill="white" />
                          <rect x="20" y="20" width="10" height="10" fill="black" />
                          <rect x="60" y="10" width="30" height="30" fill="black" />
                          <rect x="65" y="15" width="20" height="20" fill="white" />
                          <rect x="70" y="20" width="10" height="10" fill="black" />
                          <rect x="10" y="60" width="30" height="30" fill="black" />
                          <rect x="15" y="65" width="20" height="20" fill="white" />
                          <rect x="20" y="70" width="10" height="10" fill="black" />
                          <rect x="45" y="15" width="10" height="15" fill="black" />
                          <rect x="45" y="45" width="10" height="10" fill="black" />
                          <rect x="65" y="45" width="25" height="10" fill="black" />
                          <rect x="45" y="65" width="15" height="25" fill="black" />
                          <rect x="65" y="65" width="25" height="25" fill="black" />
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Scan with GPay, PhonePe, Paytm or BHIM
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        Enter UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="username@bank"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CARDS */}
              {activeTab === "CARD" && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Credit / Debit Card
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-bold">Visa · Master · RuPay</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold text-black dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold text-black dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold text-black dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {activeTab === "NETBANKING" && (
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Select Your Bank
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Punjab National"].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                          selectedBank === bank
                            ? "border-[#0284c7] bg-sky-50 dark:bg-sky-950/40 text-black dark:text-white ring-2 ring-[#0284c7]/40"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <span className="text-xs font-bold">{bank} Bank</span>
                        <Building2 className="h-4 w-4 text-neutral-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: WALLETS */}
              {activeTab === "WALLET" && (
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Popular Wallets
                  </h4>

                  <div className="space-y-2">
                    {["Amazon Pay", "Paytm Wallet", "Mobikwik", "Airtel Payments Bank"].map((w) => (
                      <div
                        key={w}
                        className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Wallet className="h-4 w-4 text-sky-500" />
                          <span className="text-xs font-bold">{w}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Banner & CTA Button */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <Lock className="h-3.5 w-3.5 text-emerald-500" />
                    256-Bit SSL Encrypted
                  </span>
                  <span>Razorpay Verified Merchant</span>
                </div>

                <button
                  type="button"
                  onClick={handlePayNow}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/30 active:scale-[0.99]"
                >
                  <Lock className="h-4 w-4" />
                  <span>Pay ₹{amount}.00</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
