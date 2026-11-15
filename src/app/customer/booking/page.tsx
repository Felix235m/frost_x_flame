import { Suspense } from "react";
import { connection } from "next/server";
import { ScreenSkeleton } from "@/components/customer/screen-skeleton";
import { daysAhead, todayIso } from "@/lib/content/booking";
import { ArenaFloorPlan } from "./arena-floor-plan";

/**
 * The day pills start at "today", so this subtree reads the clock per request.
 * `connection()` keeps it out of the prerendered shell, which cache components
 * requires; the static part of the page still paints immediately.
 */
async function LiveFloorPlan() {
  await connection();
  return <ArenaFloorPlan days={daysAhead(4, todayIso())} />;
}

export default function BookingPage() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <LiveFloorPlan />
    </Suspense>
  );
}
