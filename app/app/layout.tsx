"use client";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <StoreProvider><AppShell>{children}</AppShell></StoreProvider>;
}
