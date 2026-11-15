"use client";

import { Navbar, BottomNav } from "@/components/customer/navbar";

export interface CustomerLayoutProps {
  children: React.ReactNode;
  /**
   * "shell" is the tabbed experience (top nav + bottom nav).
   * "focused" drops both chrome so a step-by-step flow can render its own
   * back header and sticky action bar without competing navigation.
   */
  variant?: "shell" | "focused";
}

export function CustomerLayout({ children, variant = "shell" }: CustomerLayoutProps) {
  if (variant === "focused") {
    return <div className="min-h-screen bg-obsidian-root text-on-surface">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-obsidian-root text-on-surface">
      <Navbar />
      {/*
        The container lives on <main> itself so screens keep a single source of
        horizontal gutters and `h-full` keeps resolving against main's height.
      */}
      <main className="relative mx-auto w-full max-w-app flex-1 px-4 pt-20 pb-24 md:px-10 lg:pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
