"use client";

import { AdminAccessGate } from "@/app/components/auth/AccessGate";
import { Providers } from "@/app/providers";
import type { ReactNode } from "react";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AdminAccessGate>{children}</AdminAccessGate>
    </Providers>
  );
}
