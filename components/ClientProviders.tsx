"use client";

import { AuthProvider } from "@/components/AuthContext";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
