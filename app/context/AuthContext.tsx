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

  const fetchAuthData = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setFreeVipModeState(!!data.freeVipMode);
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
    fetchAuthData();
  }, []);

  const login = async (formData: any) => {
    setLoading(true);
    try {
      const loggedUser = await loginUser(formData);
      setUser(loggedUser);
      await refreshSettings();
      return loggedUser;
    } catch (error) {
      setUser(null);
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
      await refreshSettings();
      return registeredUser;
    } catch (error) {
      setUser(null);
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
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, freeVipMode, login, register, logout, refreshUser, refreshSettings }}>
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

