import { Suspense } from "react";
import { connection } from "next/server";
import { ScreenSkeleton } from "@/components/customer/screen-skeleton";
import { getStation } from "@/lib/content/booking";
import { GamesLibrary } from "./games-library";

type GamesSearchParams = Record<string, string | string[] | undefined>;

async function GamesRoute({
  searchParams,
}: {
  searchParams: Promise<GamesSearchParams>;
}) {
  await connection();

  const params = await searchParams;
  const station = Array.isArray(params.station) ? params.station[0] : params.station;
  const selected = getStation(station);

  return <GamesLibrary stationCode={selected?.code} stationId={selected?.id} />;
}

export default function GamesPage({
  searchParams,
}: {
  searchParams: Promise<GamesSearchParams>;
}) {
  return (
    <Suspense fallback={<ScreenSkeleton variant="focused" titleWidth="w-56" />}>
      <GamesRoute searchParams={searchParams} />
    </Suspense>
  );
}
