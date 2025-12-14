"use client";

import { FirebaseClientProvider } from "@/firebase";
import type { ReactNode } from "react";
import { AuthAwareStoreInitializer } from "./AuthAwareStoreInitializer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
        <AuthAwareStoreInitializer />
        {children}
    </FirebaseClientProvider>
  );
}
