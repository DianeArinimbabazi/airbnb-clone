import { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

import { config } from '../../../config/env';
const BASE = config.apiUrl;

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: "GUEST" | "HOST" | "ADMIN";
  avatar?: string | null;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, username: string, phone: string, password: string, role: "GUEST" | "HOST") => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch {}
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const jwt = data.token as string;
    localStorage.setItem("token", jwt);
    setToken(jwt);

    const meRes = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const me: User = await meRes.json();
    setUser(me);
    localStorage.setItem("user", JSON.stringify(me));
  }, []);

  const signup = useCallback(async (
    name: string, email: string, username: string,
    phone: string, password: string, role: "GUEST" | "HOST"
  ) => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, username, phone, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
