"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser } from "@/lib/auth/actions";

interface UserType {
  id: number;
  username: string;
  email: string;
  role?: string | null;
  imgUrl?: string | null;
  gender?: string | null;
  phone?: string | null;
  level?: number | null;
  views?: number | null;
  expiredAt?: Date | string | null;
  vipDebugInfo?: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  freeVipMode: boolean;
  login: (formData: any) => Promise<any>;
  register: (formData: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [freeVipMode, setFreeVipModeState] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchAuthData = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const serverUser = data.user || null;
        setUser(serverUser);
        setFreeVipModeState(!!data.freeVipMode);

        if (serverUser && typeof window !== "undefined") {
          try {
            localStorage.setItem("vam3d_user", JSON.stringify(serverUser));
          } catch (_) {}
        } else if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("vam3d_user");
          } catch (_) {}
        }
      }
    } catch (err) {
      console.warn("Auth check fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchAuthData();
  };

  const refreshUser = async () => {
    await fetchAuthData();
  };

  useEffect(() => {
    // Instantly restore cached user from localStorage on client side
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("vam3d_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) {
            setUser(parsed);
          }
        }
      } catch (_) {}
    }

    setMounted(true);
    fetchAuthData();
  }, []);

  const login = async (formData: any) => {
    setLoading(true);
    try {
      const loggedUser = await loginUser(formData);
      setUser(loggedUser);
      if (loggedUser && typeof window !== "undefined") {
        try {
          localStorage.setItem("vam3d_user", JSON.stringify(loggedUser));
        } catch (_) {}
      }
      await refreshSettings();
      return loggedUser;
    } catch (error) {
      setUser(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("vam3d_user");
        } catch (_) {}
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const registeredUser = await registerUser(formData);
      setUser(registeredUser);
      if (registeredUser && typeof window !== "undefined") {
        try {
          localStorage.setItem("vam3d_user", JSON.stringify(registeredUser));
        } catch (_) {}
      }
      await refreshSettings();
      return registeredUser;
    } catch (error) {
      setUser(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("vam3d_user");
        } catch (_) {}
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("vam3d_user");
        } catch (_) {}
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: mounted ? user : null, 
      loading: mounted ? loading : true, 
      freeVipMode: mounted ? freeVipMode : false, 
      login, 
      register, 
      logout, 
      refreshUser, 
      refreshSettings 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      loading: false,
      freeVipMode: false,
      login: async () => false,
      register: async () => false,
      logout: async () => {},
      refreshUser: async () => {},
      refreshSettings: async () => {},
    };
  }
  return context;
}

