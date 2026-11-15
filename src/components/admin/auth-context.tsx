"use client";

import { createContext, useContext, ReactNode } from "react";

interface StaffSession {
  staff_id: string;
  name: string;
  role: "owner" | "staff";
  session_token: string;
  expires_at: string;
}

interface AdminAuthContextType {
  session: StaffSession | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  isOwner: () => boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

interface AdminAuthProviderProps {
  value: AdminAuthContextType;
  children: ReactNode;
}

export function AdminAuthProvider({ value, children }: AdminAuthProviderProps) {
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
