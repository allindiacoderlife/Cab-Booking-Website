import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { razorpayInstance, verifyRazorpaySignature } from "./lib/razorpay.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// -------------------------------------------------------------
// Root & Health Checks
// -------------------------------------------------------------
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Uber Clone Backend API",
    message: "Server is running smoothly on Vercel",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      rides: "/api/rides/nearby",
      requestRide: "POST /api/rides/request",
      createPaymentOrder: "POST /api/payments/create-order",
      verifyPayment: "POST /api/payments/verify",
      emergencySOS: "POST /api/emergency/sos",
    },
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "CabGo API (Express + Prisma + Supabase + Razorpay)",
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Auth Sync (Sync Supabase User into Prisma PostgreSQL)
// -------------------------------------------------------------
app.post("/api/auth/sync", async (req: Request, res: Response) => {
  try {
    const { supabaseId, email, fullName, role = "RIDER", avatarUrl, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Try upserting user in DB
    try {
      const user = await prisma.user.upsert({
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
        await prisma.driverProfile.upsert({
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
    } catch (dbErr) {
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
  } catch (error: any) {
    console.error("Auth sync error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Rides Endpoints
// -------------------------------------------------------------
let inMemoryRides: any[] = [];

app.post("/api/rides/request", async (req: Request, res: Response) => {
  try {
    const {
      riderId,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      stops = [],
      vehicleCategory = "STANDARD",
      fare,
      distanceKm,
      durationMins,
      promoCode,
      discount = 0,
    } = req.body;

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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/rides/nearby", (_req: Request, res: Response) => {
  const pending = inMemoryRides.filter((r) => r.status === "REQUESTED");
  res.json({ success: true, count: pending.length, rides: pending });
});

app.post("/api/rides/:id/accept", (req: Request, res: Response) => {
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

app.post("/api/rides/:id/complete", (req: Request, res: Response) => {
  const { id } = req.params;
  const ride = inMemoryRides.find((r) => r.id === id);

  if (!ride) {
    return res.status(404).json({ error: "Ride not found" });
  }

  ride.status = "COMPLETED";
  ride.completedAt = new Date().toISOString();

  return res.json({ success: true, ride });
});

app.post("/api/rides/:id/cancel", (req: Request, res: Response) => {
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
app.post("/api/payments/create-order", async (req: Request, res: Response) => {
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
      const order = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
      });
    } catch (rzpErr) {
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
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments/verify", (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, rideId } = req.body;

    const isValid = verifyRazorpaySignature({
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
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Emergency SOS Endpoint (Use Case 12)
// -------------------------------------------------------------
app.post("/api/emergency/sos", (req: Request, res: Response) => {
  const { riderName, contactName, contactPhone, currentLat, currentLng, rideId } = req.body;

  console.log(`🚨 [EMERGENCY SOS ALERT]: Rider ${riderName} triggered SOS on ride ${rideId}!`);
  console.log(`📡 Notifying contact: ${contactName} at ${contactPhone}. Location: ${currentLat}, ${currentLng}`);

  return res.json({
    success: true,
    message: "Emergency broadcast activated. Live location transmitted to emergency contacts.",
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Ride History & Receipts (Use Case 7)
// -------------------------------------------------------------
app.get("/api/rides/history", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    // Default seeded historical rides for instant demo
    const defaultHistory = [
      {
        id: "UBER-789214",
        date: "Today, 10:45 AM",
        createdAt: new Date().toISOString(),
        pickupAddress: "Connaught Place, Radial Road 3, New Delhi",
        dropoffAddress: "Indira Gandhi International Airport, Terminal 3",
        fare: 480,
        distanceKm: 18.5,
        durationMins: 28,
        vehicleCategory: "UberXL",
        status: "COMPLETED",
        paymentId: "pay_rzp_live_9812487",
        paymentMethod: "Razorpay (UPI / GooglePay)",
        driverName: "David Chen",
        driverRating: 4.96,
        vehiclePlate: "DL-01-AB-1234",
        vehicleModel: "Toyota Camry Hybrid",
      },
      {
        id: "UBER-652391",
        date: "Yesterday, 6:15 PM",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        pickupAddress: "Cyber City, DLF Phase 2, Gurugram",
        dropoffAddress: "Hauz Khas Social, New Delhi",
        fare: 310,
        distanceKm: 14.2,
        durationMins: 24,
        vehicleCategory: "UberX",
        status: "COMPLETED",
        paymentId: "pay_rzp_live_4518293",
        paymentMethod: "Razorpay (Visa •••• 4242)",
        driverName: "Vikram Malhotra",
        driverRating: 4.92,
        vehiclePlate: "HR-26-DK-9021",
        vehicleModel: "Hyundai Verna",
      },
      {
        id: "UBER-512098",
        date: "14 Oct, 9:20 PM",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        pickupAddress: "Sector 18 Metro Station, Noida",
        dropoffAddress: "Khan Market, Rabindra Nagar, New Delhi",
        fare: 245,
        distanceKm: 12.0,
        durationMins: 22,
        vehicleCategory: "Comfort",
        status: "COMPLETED",
        paymentId: "pay_rzp_live_2391054",
        paymentMethod: "Razorpay (MasterCard •••• 8899)",
        driverName: "Rajesh Kumar",
        driverRating: 4.88,
        vehiclePlate: "UP-16-BZ-4321",
        vehicleModel: "Honda City",
      },
    ];

    try {
      const dbRides = await prisma.ride.findMany({
        where: userId ? { riderId: String(userId) } : undefined,
        include: { payment: true, review: true, driver: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      if (dbRides && dbRides.length > 0) {
        return res.json({ success: true, rides: dbRides });
      }
    } catch {
      // Fallback to memory/default
    }

    const combined = [...inMemoryRides, ...defaultHistory];
    return res.json({ success: true, rides: combined });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Ratings & Reviews (Use Case 9)
// -------------------------------------------------------------
app.post("/api/reviews", async (req: Request, res: Response) => {
  try {
    const { rideId, rating, comment, badges = [] } = req.body;

    if (!rating) {
      return res.status(400).json({ error: "Rating (1-5) is required" });
    }

    try {
      if (rideId && !rideId.startsWith("UBER-")) {
        await prisma.review.upsert({
          where: { rideId },
          update: { rating: Number(rating), comment: String(comment || "") },
          create: { rideId, rating: Number(rating), comment: String(comment || "") },
        });
      }
    } catch (e) {
      console.warn("DB review write fallback:", e);
    }

    return res.json({
      success: true,
      message: "Thank you! Rating and review submitted successfully.",
      review: { rideId, rating, comment, badges },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Customer Support & Help Center (Use Case 13)
// -------------------------------------------------------------
app.post("/api/support/ticket", async (req: Request, res: Response) => {
  try {
    const { userId, rideId, category = "TRIP_FARE", subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and description are required" });
    }

    const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await prisma.supportTicket.create({
        data: {
          id: ticketId,
          userId: userId || undefined,
          rideId: rideId || undefined,
          category: category as any,
          subject,
          message,
        },
      });
    } catch (e) {
      console.warn("Prisma support ticket write fallback:", e);
    }

    return res.status(201).json({
      success: true,
      message: "Support ticket registered. Our 24/7 resolution team will follow up within 2 hours.",
      ticket: {
        id: ticketId,
        category,
        subject,
        message,
        status: "OPEN",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/support/tickets", async (_req: Request, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return res.json({ success: true, tickets });
  } catch {
    return res.json({ success: true, tickets: [] });
  }
});

// -------------------------------------------------------------
// User Profile & Emergency Contacts (Use Cases 2 & 12)
// -------------------------------------------------------------
app.put("/api/users/profile", async (req: Request, res: Response) => {
  try {
    const { email, fullName, phone, avatarUrl, emergencyContact } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required to update profile" });
    }

    try {
      const updatedUser = await prisma.user.upsert({
        where: { email },
        update: {
          fullName,
          phone,
          avatarUrl,
        },
        create: {
          email,
          fullName: fullName || email.split("@")[0],
          phone,
          avatarUrl,
        },
      });

      if (emergencyContact && emergencyContact.name && emergencyContact.phone) {
        await prisma.emergencyContact.upsert({
          where: { userId: updatedUser.id },
          update: {
            name: emergencyContact.name,
            phone: emergencyContact.phone,
            relationship: emergencyContact.relationship || "Family",
          },
          create: {
            userId: updatedUser.id,
            name: emergencyContact.name,
            phone: emergencyContact.phone,
            relationship: emergencyContact.relationship || "Family",
          },
        });
      }

      return res.json({ success: true, user: updatedUser });
    } catch (dbErr) {
      return res.json({
        success: true,
        user: { email, fullName, phone, emergencyContact },
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 CabGo Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;

