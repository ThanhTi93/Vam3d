"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, getCurrentUser } from "@/lib/auth/actions";

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
  login: (formData: any) => Promise<any>;
  register: (formData: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load auth user session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (formData: any) => {
    setLoading(true);
    try {
      const loggedUser = await loginUser(formData);
      setUser(loggedUser);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
      login: async () => false,
      register: async () => false,
      logout: async () => {},
      refreshUser: async () => {},
    };
  }
  return context;
}
