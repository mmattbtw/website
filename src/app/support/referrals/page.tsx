import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getReferrals } from "#/lib/referrals";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Referral links - mmatt.net",
  description:
    "My referral and affiliate links. Grab a signup bonus and support what I do.",
  alternates: { canonical: "/support/referrals" },
};

export default async function ReferralsPage() {
  const referrals = await getReferrals();

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-6 py-10 sm:px-10 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" /> Back home
      </Link>

      <header className="mb-12 mt-12 space-y-5">
        <p className="text-sm">/support/referrals</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          a little for you,
          <br />a little for me.
        </h1>
        <p className="max-w-xl text-base leading-relaxed">
          If you&apos;re signing up anyway, these links help support what I do. Some
          get you a bonus, too. Thanks for using them ^_^
        </p>
        <p className="max-w-xl text-sm leading-relaxed opacity-70">
          These are referral and affiliate links. I may receive credit, cash, or
          a commission when you use them. Offers and eligibility can change;
          check the linked service for current terms.
        </p>
      </header>

      <ul className="border-t border-current/20">
        {referrals.map((referral, index) => (
          <li
            key={`${referral.url}-${index}`}
            className="grid gap-3 border-b border-current/20 py-7 sm:grid-cols-[11rem_1fr] sm:gap-6"
          >
            <h2>
              <a
                href={referral.url}
                rel="sponsored noopener"
                className="group inline-flex items-center gap-2 font-bold underline decoration-current/30 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {referral.name}
                <ArrowUpRightIcon
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
              </a>
            </h2>
            <div className="space-y-2 text-base leading-relaxed">
              <p>{referral.benefit}</p>
              {referral.reward && (
                <p className="text-sm opacity-70">{referral.reward}</p>
              )}
              {referral.code && (
                <p className="text-sm">
                  Referral code:{" "}
                  <code className="select-all border border-current/20 px-2 py-1">
                    {referral.code}
                  </code>
                </p>
              )}
              {referral.detailsUrl && (
                <a
                  href={referral.detailsUrl}
                  className="inline-flex items-center gap-1 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {referral.detailsLabel || "Referral details"}
                  <ArrowUpRightIcon className="size-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm opacity-70">
        No pressure. Only sign up for something you actually want.
      </p>
    </main>
  );
}
