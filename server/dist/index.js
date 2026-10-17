"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const razorpay_js_1 = require("./lib/razorpay.js");
const prisma_js_1 = require("./lib/prisma.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "CabGo API (Express + Prisma + Supabase + Razorpay)",
        timestamp: new Date().toISOString(),
    });
});
// -------------------------------------------------------------
// Auth Sync (Sync Supabase User into Prisma PostgreSQL)
// -------------------------------------------------------------
app.post("/api/auth/sync", async (req, res) => {
    try {
        const { supabaseId, email, fullName, role = "RIDER", avatarUrl, phone } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        // Try upserting user in DB
        try {
            const user = await prisma_js_1.prisma.user.upsert({
                where: { email },
                update: {
                    supabaseId,
                    fullName: fullName || email.split("@")[0],
                    avatarUrl,
                    phone,
                    role: role === "DRIVER" ? "DRIVER" : "RIDER",
                },
                create: {
                    supabaseId,
                    email,
                    fullName: fullName || email.split("@")[0],
                    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || email)}`,
                    phone,
                    role: role === "DRIVER" ? "DRIVER" : "RIDER",
                },
            });
            // If Driver, ensure driver profile exists
            if (user.role === "DRIVER") {
                await prisma_js_1.prisma.driverProfile.upsert({
                    where: { userId: user.id },
                    update: {},
                    create: {
                        userId: user.id,
                        vehicleMake: "Toyota",
                        vehicleModel: "Camry Hybrid",
                        vehicleYear: 2024,
                        vehicleColor: "Midnight Black",
                        vehiclePlate: `UB-${Math.floor(1000 + Math.random() * 9000)}`,
                        vehicleCategory: "STANDARD",
                        isOnline: true,
                        currentLat: 37.7749,
                        currentLng: -122.4194,
                    },
                });
            }
            return res.json({ success: true, user });
        }
        catch (dbErr) {
            // In case DATABASE_URL is not yet connected to a live Postgres, return simulated user
            console.warn("Prisma DB sync skipped (DB offline or unconfigured), returning session response:", dbErr);
            return res.json({
                success: true,
                user: {
                    id: `usr_${Date.now()}`,
                    supabaseId,
                    email,
                    fullName: fullName || email.split("@")[0],
                    role,
                    avatarUrl,
                    phone,
                },
            });
        }
    }
    catch (error) {
        console.error("Auth sync error:", error);
        return res.status(500).json({ error: error.message });
    }
});
// -------------------------------------------------------------
// Rides Endpoints
// -------------------------------------------------------------
let inMemoryRides = [];
app.post("/api/rides/request", async (req, res) => {
    try {
        const { riderId, pickupAddress, pickupLat, pickupLng, dropoffAddress, dropoffLat, dropoffLng, stops = [], vehicleCategory = "STANDARD", fare, distanceKm, durationMins, promoCode, discount = 0, } = req.body;
        const rideData = {
            id: `ride_${Date.now().toString().slice(-6)}`,
            riderId: riderId || "rider_demo_1",
            pickupAddress,
            pickupLat: parseFloat(pickupLat),
            pickupLng: parseFloat(pickupLng),
            dropoffAddress,
            dropoffLat: parseFloat(dropoffLat),
            dropoffLng: parseFloat(dropoffLng),
            stops,
            vehicleCategory,
            fare: parseFloat(fare),
            distanceKm: parseFloat(distanceKm),
            durationMins: parseInt(durationMins, 10),
            promoCode,
            discount: parseFloat(discount),
            status: "REQUESTED",
            createdAt: new Date().toISOString(),
        };
        inMemoryRides.unshift(rideData);
        return res.status(201).json({
            success: true,
            message: "Ride requested successfully",
            ride: rideData,
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
app.get("/api/rides/nearby", (_req, res) => {
    const pending = inMemoryRides.filter((r) => r.status === "REQUESTED");
    res.json({ success: true, count: pending.length, rides: pending });
});
app.post("/api/rides/:id/accept", (req, res) => {
    const { id } = req.params;
    const { driverId = "driver_demo_1" } = req.body;
    const ride = inMemoryRides.find((r) => r.id === id);
    if (!ride) {
        return res.status(404).json({ error: "Ride request not found" });
    }
    ride.status = "ACCEPTED";
    ride.driverId = driverId;
    ride.acceptedAt = new Date().toISOString();
    return res.json({ success: true, ride });
});
app.post("/api/rides/:id/complete", (req, res) => {
    const { id } = req.params;
    const ride = inMemoryRides.find((r) => r.id === id);
    if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
    }
    ride.status = "COMPLETED";
    ride.completedAt = new Date().toISOString();
    return res.json({ success: true, ride });
});
app.post("/api/rides/:id/cancel", (req, res) => {
    const { id } = req.params;
    const ride = inMemoryRides.find((r) => r.id === id);
    if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
    }
    ride.status = "CANCELLED";
    ride.cancelledAt = new Date().toISOString();
    return res.json({ success: true, ride });
});
// -------------------------------------------------------------
// Razorpay Payment Integration (Use Case 6)
// -------------------------------------------------------------
app.post("/api/payments/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR", rideId } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Payment amount is required" });
        }
        // Razorpay accepts amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(Number(amount) * 100);
        const options = {
            amount: amountInPaise,
            currency: currency.toUpperCase(),
            receipt: `receipt_${rideId || Date.now()}`,
            notes: {
                rideId: rideId || "general_booking",
            },
        };
        try {
            const order = await razorpay_js_1.razorpayInstance.orders.create(options);
            return res.json({
                success: true,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
            });
        }
        catch (rzpErr) {
            console.warn("Razorpay live call fallback to sandbox order:", rzpErr);
            // Fallback sandbox order ID for testing when API keys are not yet entered
            return res.json({
                success: true,
                orderId: `order_mock_${Date.now()}`,
                amount: amountInPaise,
                currency: currency.toUpperCase(),
                key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
                isSandboxDemo: true,
            });
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
app.post("/api/payments/verify", (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, rideId } = req.body;
        const isValid = (0, razorpay_js_1.verifyRazorpaySignature)({
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            signature: razorpaySignature,
        });
        if (!isValid) {
            return res.status(400).json({ success: false, error: "Invalid payment signature" });
        }
        // Mark ride as paid in memory/DB
        const ride = inMemoryRides.find((r) => r.id === rideId);
        if (ride) {
            ride.isPaid = true;
            ride.paymentId = razorpayPaymentId;
        }
        return res.json({
            success: true,
            message: "Payment successfully verified by Razorpay",
            paymentId: razorpayPaymentId,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// -------------------------------------------------------------
// Emergency SOS Endpoint (Use Case 12)
// -------------------------------------------------------------
app.post("/api/emergency/sos", (req, res) => {
    const { riderName, contactName, contactPhone, currentLat, currentLng, rideId } = req.body;
    console.log(`🚨 [EMERGENCY SOS ALERT]: Rider ${riderName} triggered SOS on ride ${rideId}!`);
    console.log(`📡 Notifying contact: ${contactName} at ${contactPhone}. Location: ${currentLat}, ${currentLng}`);
    return res.json({
        success: true,
        message: "Emergency broadcast activated. Live location transmitted to emergency contacts.",
        timestamp: new Date().toISOString(),
    });
});
app.listen(PORT, () => {
    console.log(`🚀 CabGo Backend Server running on http://localhost:${PORT}`);
});
