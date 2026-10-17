import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, signInWithGoogle } from "../lib/supabase";
import { getApiUrl } from "../lib/api";

export type UserRole = "RIDER" | "DRIVER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginGoogle: (preferredRole?: UserRole) => Promise<void>;
  loginEmail: (email: string, pass: string, preferredRole?: UserRole) => Promise<void>;
  signupEmail: (fullName: string, email: string, pass: string, phone: string, preferredRole: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const defaultRider: User = {
  id: "usr_alex_rider",
  email: "alex.morgan@example.com",
  fullName: "Alex Morgan",
  phone: "+91 98765 43210",
  role: "RIDER",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

const defaultDriver: User = {
  id: "usr_david_driver",
  email: "david.chen@example.com",
  fullName: "David Chen",
  phone: "+91 98765 12345",
  role: "DRIVER",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultRider);
  const [role, setRole] = useState<UserRole>("RIDER");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("uber_auth_user");
      const savedRole = localStorage.getItem("uber_auth_role") as UserRole;
      if (saved) setUser(JSON.parse(saved));
      if (savedRole) setRole(savedRole);
    } catch {
      // ignore
    }
  }, []);

  const saveState = (newUser: User | null, newRole: UserRole) => {
    setUser(newUser);
    setRole(newRole);
    try {
      if (newUser) localStorage.setItem("uber_auth_user", JSON.stringify(newUser));
      else localStorage.removeItem("uber_auth_user");
      localStorage.setItem("uber_auth_role", newRole);
    } catch {
      // ignore
    }
  };

  const loginGoogle = async (preferredRole: UserRole = "RIDER") => {
    const res = await signInWithGoogle();
    const targetUser: User =
      preferredRole === "DRIVER"
        ? defaultDriver
        : {
            id: `usr_g_${Date.now()}`,
            email: "google.user@gmail.com",
            fullName: "Google Account User",
            role: "RIDER",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser",
          };

    // Sync with backend Prisma
    fetch(getApiUrl("/api/auth/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(targetUser),
    }).catch(console.warn);

    saveState(targetUser, preferredRole);
  };

  const loginEmail = async (email: string, _pass: string, preferredRole: UserRole = "RIDER") => {
    const isDriver = preferredRole === "DRIVER";
    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      email,
      fullName: isDriver ? "David Chen (Driver)" : email.split("@")[0],
      phone: "+91 98765 00000",
      role: preferredRole,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    };

    fetch(getApiUrl("/api/auth/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loggedUser),
    }).catch(console.warn);

    saveState(loggedUser, preferredRole);
  };

  const signupEmail = async (
    fullName: string,
    email: string,
    _pass: string,
    phone: string,
    preferredRole: UserRole
  ) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      fullName,
      phone,
      role: preferredRole,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
    };

    fetch(getApiUrl("/api/auth/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }).catch(console.warn);

    saveState(newUser, preferredRole);
  };

  const logout = () => {
    supabase.auth.signOut().catch(console.warn);
    saveState(null, "RIDER");
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === "DRIVER") {
      saveState(user?.role === "DRIVER" ? user : defaultDriver, "DRIVER");
    } else {
      saveState(user?.role === "RIDER" ? user : defaultRider, "RIDER");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        loginGoogle,
        loginEmail,
        signupEmail,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
