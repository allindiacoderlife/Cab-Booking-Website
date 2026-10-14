"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, DriverProfile, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  driverProfile: DriverProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  signup: (userData: { fullName: string; email: string; phone: string; role: UserRole }) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (updates: Partial<User>) => void;
  updateDriverProfile: (updates: Partial<DriverProfile>) => void;
  toggleDriverOnline: () => void;
}

const defaultRider: User = {
  id: "usr_rider_101",
  email: "alex.morgan@example.com",
  fullName: "Alex Morgan",
  phone: "+1 (555) 234-5678",
  role: "RIDER",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  createdAt: "2024-01-15T09:00:00Z",
  emergencyContact: {
    name: "Sarah Morgan",
    phone: "+1 (555) 987-6543",
    relationship: "Sister",
  },
  paymentMethods: [
    {
      id: "pm_1",
      type: "card",
      brand: "Visa",
      last4: "4242",
      expiry: "08/28",
      isDefault: true,
    },
    {
      id: "pm_2",
      type: "apple_pay",
      isDefault: false,
    },
  ],
  rating: 4.95,
  totalRides: 42,
};

const defaultDriverUser: User = {
  id: "usr_driver_202",
  email: "david.chen@example.com",
  fullName: "David Chen",
  phone: "+1 (555) 876-5432",
  role: "DRIVER",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  createdAt: "2023-11-10T14:30:00Z",
  paymentMethods: [
    {
      id: "pm_bank_1",
      type: "card",
      brand: "MasterCard Direct Deposit",
      last4: "8899",
      expiry: "12/29",
      isDefault: true,
    },
  ],
  rating: 4.92,
  totalRides: 618,
};

const defaultDriverProfile: DriverProfile = {
  id: "drv_prof_202",
  userId: "usr_driver_202",
  vehicle: {
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2024,
    color: "Midnight Silver",
    licensePlate: "7XYZ982",
    category: "Comfort",
  },
  isOnline: true,
  currentLat: 37.7749,
  currentLng: -122.4194,
  acceptanceRate: 98,
  rating: 4.92,
  totalEarningsToday: 148.5,
  completedTripsToday: 7,
  onlineHoursToday: 4.5,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultRider);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(defaultDriverProfile);
  const [role, setRole] = useState<UserRole>("RIDER");

  // Load from local storage if available on client
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("uber_clone_user");
      const savedRole = localStorage.getItem("uber_clone_role") as UserRole;
      const savedDriver = localStorage.getItem("uber_clone_driver");

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedRole) setRole(savedRole);
      if (savedDriver) setDriverProfile(JSON.parse(savedDriver));
    } catch {
      // Fallback to default
    }
  }, []);

  const saveState = (updatedUser: User | null, updatedRole: UserRole, updatedDriver: DriverProfile | null) => {
    setUser(updatedUser);
    setRole(updatedRole);
    setDriverProfile(updatedDriver);
    try {
      if (updatedUser) localStorage.setItem("uber_clone_user", JSON.stringify(updatedUser));
      localStorage.setItem("uber_clone_role", updatedRole);
      if (updatedDriver) localStorage.setItem("uber_clone_driver", JSON.stringify(updatedDriver));
    } catch {
      // ignore storage errors
    }
  };

  const login = (email: string, preferredRole: UserRole = "RIDER") => {
    if (preferredRole === "DRIVER") {
      saveState(
        { ...defaultDriverUser, email },
        "DRIVER",
        defaultDriverProfile
      );
    } else {
      saveState(
        { ...defaultRider, email },
        "RIDER",
        null
      );
    }
  };

  const signup = ({
    fullName,
    email,
    phone,
    role: newRole,
  }: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
  }) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      fullName,
      phone,
      role: newRole,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      createdAt: new Date().toISOString(),
      paymentMethods: [
        {
          id: `pm_${Date.now()}`,
          type: "card",
          brand: "Visa",
          last4: "1234",
          expiry: "12/28",
          isDefault: true,
        },
      ],
      rating: 5.0,
      totalRides: 0,
    };

    const newDriver: DriverProfile | null =
      newRole === "DRIVER"
        ? {
            id: `drv_${Date.now()}`,
            userId: newUser.id,
            vehicle: {
              make: "Toyota",
              model: "Camry Hybrid",
              year: 2023,
              color: "Black",
              licensePlate: "NEW-RIDE",
              category: "Standard",
            },
            isOnline: true,
            currentLat: 37.7749,
            currentLng: -122.4194,
            acceptanceRate: 100,
            rating: 5.0,
            totalEarningsToday: 0,
            completedTripsToday: 0,
            onlineHoursToday: 0,
          }
        : null;

    saveState(newUser, newRole, newDriver);
  };

  const logout = () => {
    setUser(null);
    setDriverProfile(null);
    setRole("RIDER");
    try {
      localStorage.removeItem("uber_clone_user");
      localStorage.removeItem("uber_clone_role");
      localStorage.removeItem("uber_clone_driver");
    } catch {
      // ignore
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === "DRIVER") {
      const activeUser = user && user.role === "DRIVER" ? user : defaultDriverUser;
      saveState(activeUser, "DRIVER", driverProfile || defaultDriverProfile);
    } else {
      const activeUser = user && user.role === "RIDER" ? user : defaultRider;
      saveState(activeUser, "RIDER", null);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      localStorage.setItem("uber_clone_user", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const updateDriverProfile = (updates: Partial<DriverProfile>) => {
    if (!driverProfile) return;
    const updated = { ...driverProfile, ...updates };
    setDriverProfile(updated);
    try {
      localStorage.setItem("uber_clone_driver", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const toggleDriverOnline = () => {
    if (!driverProfile) return;
    updateDriverProfile({ isOnline: !driverProfile.isOnline });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driverProfile,
        role,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        switchRole,
        updateProfile,
        updateDriverProfile,
        toggleDriverOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
