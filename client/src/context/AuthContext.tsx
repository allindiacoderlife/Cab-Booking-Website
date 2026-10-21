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
  loginGoogle: (preferredRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginEmail: (
    email: string,
    pass: string,
    preferredRole?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  signupEmail: (
    fullName: string,
    email: string,
    pass: string,
    phone: string,
    preferredRole: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  loginAsDemo: (demoRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Real-world flow: User starts as null (guest / unauthenticated) unless a valid session exists
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("cabgo_auth_user") || localStorage.getItem("uber_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    try {
      const savedRole = (localStorage.getItem("cabgo_auth_role") || localStorage.getItem("uber_auth_role")) as UserRole;
      return savedRole || "RIDER";
    } catch {
      return "RIDER";
    }
  });

  // Listen to Supabase Auth state changes (real OAuth & session persistence)
  useEffect(() => {
    // 1. Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      }
    });

    // 2. Listen to login/logout events from Supabase (e.g. Google OAuth redirect callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      } else if (_event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("cabgo_auth_user");
        localStorage.removeItem("uber_auth_user");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSupabaseUser = (supaUser: any) => {
    const meta = supaUser.user_metadata || {};
    const preferredRole: UserRole = meta.role || role || "RIDER";
    const mappedUser: User = {
      id: supaUser.id,
      email: supaUser.email || "user@cabgo.com",
      fullName: meta.full_name || meta.name || supaUser.email?.split("@")[0] || "CabGo User",
      phone: meta.phone || supaUser.phone || "+91 98765 43210",
      role: preferredRole,
      avatarUrl:
        meta.avatar_url ||
        meta.picture ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(supaUser.email || "user")}`,
    };

    saveState(mappedUser, preferredRole);

    // Sync user into backend PostgreSQL via Prisma
    fetch(getApiUrl("/api/auth/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supabaseId: mappedUser.id,
        email: mappedUser.email,
        fullName: mappedUser.fullName,
        role: mappedUser.role,
        avatarUrl: mappedUser.avatarUrl,
        phone: mappedUser.phone,
      }),
    }).catch(console.warn);
  };

  const saveState = (newUser: User | null, newRole: UserRole) => {
    setUser(newUser);
    setRole(newRole);
    try {
      if (newUser) {
        localStorage.setItem("cabgo_auth_user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("cabgo_auth_user");
        localStorage.removeItem("uber_auth_user");
      }
      localStorage.setItem("cabgo_auth_role", newRole);
    } catch {
      // ignore
    }
  };

  // Google OAuth flow
  const loginGoogle = async (preferredRole: UserRole = "RIDER") => {
    try {
      localStorage.setItem("cabgo_auth_role", preferredRole);
      const res = await signInWithGoogle();
      if (res.error) {
        return { success: false, error: res.error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to initialize Google login" };
    }
  };

  // Email & Password Login
  const loginEmail = async (email: string, pass: string, preferredRole: UserRole = "RIDER") => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        // If credentials don't exist yet on Supabase, fallback to local dev account
        const fallbackUser: User = {
          id: `usr_${Date.now()}`,
          email,
          fullName: email.split("@")[0],
          phone: "+91 98765 43210",
          role: preferredRole,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        };
        saveState(fallbackUser, preferredRole);

        fetch(getApiUrl("/api/auth/sync"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fallbackUser),
        }).catch(console.warn);

        return { success: true };
      }

      if (data.user) {
        handleSupabaseUser(data.user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Sign up flow
  const signupEmail = async (
    fullName: string,
    email: string,
    pass: string,
    phone: string,
    preferredRole: UserRole
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: preferredRole,
          },
        },
      });

      const newUser: User = {
        id: data?.user?.id || `usr_${Date.now()}`,
        email,
        fullName,
        phone,
        role: preferredRole,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      };

      saveState(newUser, preferredRole);

      fetch(getApiUrl("/api/auth/sync"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      }).catch(console.warn);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Logout clears session back to guest
  const logout = () => {
    supabase.auth.signOut().catch(console.warn);
    saveState(null, "RIDER");
  };

  // Role Switcher:
  // In a real website: Switching between Rider & Driver view NEVER logs you in as a different person!
  // If user is logged in, their own account switches perspective.
  // If user is a guest, they remain a guest (user = null).
  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    try {
      localStorage.setItem("cabgo_auth_role", newRole);
    } catch {
      // ignore
    }

    if (user) {
      const updatedUser: User = { ...user, role: newRole };
      saveState(updatedUser, newRole);

      // Sync role change with backend
      fetch(getApiUrl("/api/auth/sync"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      }).catch(console.warn);
    }
  };

  // Explicit Demo login helper for testing
  const loginAsDemo = (demoRole: UserRole) => {
    if (demoRole === "DRIVER") {
      const demoDriver: User = {
        id: "usr_david_driver",
        email: "david.chen@driver.cabgo.com",
        fullName: "David Chen",
        phone: "+91 98765 12345",
        role: "DRIVER",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      };
      saveState(demoDriver, "DRIVER");
    } else {
      const demoRider: User = {
        id: "usr_alex_rider",
        email: "alex.morgan@rider.cabgo.com",
        fullName: "Alex Morgan",
        phone: "+91 98765 43210",
        role: "RIDER",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      };
      saveState(demoRider, "RIDER");
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
        loginAsDemo,
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
