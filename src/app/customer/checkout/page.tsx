import { Suspense } from "react";
import { connection } from "next/server";
import { ScreenSkeleton } from "@/components/customer/screen-skeleton";
import { OPENING_HOUR, getStation, todayIso } from "@/lib/content/booking";
import { CheckoutScreen } from "./checkout-screen";

type CheckoutSearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function CheckoutRoute({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  await connection();

  const params = await searchParams;

  const station = getStation(single(params.station)) ?? getStation("ps2")!;

  const requestedPlayers = Number(single(params.players));
  const players =
    Number.isFinite(requestedPlayers) && requestedPlayers > 0
      ? requestedPlayers
      : station.defaultPlayers;

  const requestedHours = Number(single(params.hours));
  const hours =
    Number.isFinite(requestedHours) && requestedHours > 0
      ? Math.min(12, Math.round(requestedHours))
      : 2;

  const requestedStart = Number((single(params.start) ?? "").split(":")[0]);
  const startHour =
    Number.isFinite(requestedStart) && requestedStart >= OPENING_HOUR && requestedStart <= 24
      ? requestedStart
      : 18;

  const today = todayIso();
  const dateParam = single(params.date);
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;

  return (
    <CheckoutScreen
      date={date}
      hours={hours}
      isToday={date === today}
      players={players}
      startHour={startHour}
      station={station}
    />
  );
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  return (
    <Suspense fallback={<ScreenSkeleton variant="focused" titleWidth="w-48" />}>
      <CheckoutRoute searchParams={searchParams} />
    </Suspense>
  );
}
