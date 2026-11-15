import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ScreenSkeleton } from "@/components/customer/screen-skeleton";
import { OPENING_HOUR, getStation, todayIso } from "@/lib/content/booking";
import { StationTelemetryScreen } from "./station-telemetry-screen";

interface StationRouteProps {
  params: Promise<{ station: string }>;
  searchParams: Promise<{ date?: string; time?: string }>;
}

async function StationRoute({ params, searchParams }: StationRouteProps) {
  await connection();

  const { station: stationId } = await params;
  const { date, time } = await searchParams;

  const station = getStation(stationId);
  if (!station) notFound();

  const parsedHour = Number((time ?? "").split(":")[0]);
  const initialHour =
    Number.isFinite(parsedHour) && parsedHour >= OPENING_HOUR && parsedHour <= 24
      ? parsedHour
      : 18;

  return (
    <StationTelemetryScreen
      date={date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIso()}
      initialHour={initialHour}
      station={station}
    />
  );
}

export default function StationPage(props: StationRouteProps) {
  return (
    <Suspense fallback={<ScreenSkeleton variant="focused" />}>
      <StationRoute {...props} />
    </Suspense>
  );
}
