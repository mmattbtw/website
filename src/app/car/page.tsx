import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";

import { Title } from "#/components/typography";
import { getCarRecords } from "#/lib/api";

import { CarStatsClient } from "./car-stats-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://mmatt.net"),
  title: "my car - mmatt.net",
  description: "various statistics about my car and how I drive.",
  other: {
    "fediverse:creator": "@matt@mmatt.net",
  },
};

export default async function CarStatsPage() {
  const { records: carRecords, cursor } = await getCarRecords();

  // Sort by date, oldest first for charts
  const sortedRecords = [...carRecords].sort(
    (a, b) =>
      new Date(a.value.createdAt).getTime() -
      new Date(b.value.createdAt).getTime(),
  );

  const latestRecord = carRecords[0]?.value;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-dvh p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
        <NextLink
          href="/"
          className="hover:underline hover:underline-offset-4 font-medium"
        >
          <ArrowLeftIcon className="inline size-4 align-middle mb-px mr-1" />
          Back
        </NextLink>

        <h1 className="text-2xl font-bold">so my car got rear ended...</h1>
        <p>
          {
            "so this page won't update for a while until I get a new car. I'm sad right now. T-T"
          }
        </p>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative aspect-4/3 w-full min-h-0">
            <Image
              src={"/cardone.webp"}
              alt="Cardone"
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 896px) 50vw, 448px"
              priority
            />
          </div>
          <div className="relative aspect-4/3 w-full min-h-0">
            <Image
              src={"/cardone2.webp"}
              alt="Cardtwo"
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 896px) 50vw, 448px"
              priority
            />
          </div>
        </div>
 
        <div className="w-full">
          <Title level="h1">Car Stats</Title>
          {latestRecord && (
            <div className="mt-4 p-4 border rounded-lg bg-white/5">
              <p className="text-2xl font-bold">
                {latestRecord.carYear} {latestRecord.carMake}{" "}
                {latestRecord.carModel}
              </p>
            </div>
          )}
        </div>

        <CarStatsClient
          initialRecords={sortedRecords.map((r) => ({
            createdAt: r.value.createdAt,
            carFuelRange: r.value.carFuelRange,
            carPercentFuelRemaining: r.value.carPercentFuelRemaining,
            amountRemaining: r.value.amountRemaining,
            carTraveledDistance: r.value.carTraveledDistance,
          }))}
          initialCursor={cursor}
        />
      </main>
    </div>
  );
}
