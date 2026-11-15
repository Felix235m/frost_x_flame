"use client";

import { Navbar, BottomNav } from "@/components/customer/navbar";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
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
