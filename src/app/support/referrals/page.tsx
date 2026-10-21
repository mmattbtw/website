import type { Metadata } from "next";

import Link from "#/components/ui/link";
import { getReferrals } from "#/lib/referrals";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "referrals · mmatt.net",
  description: "all my referral links, thank you if you use them!",
  alternates: { canonical: "/support/referrals" },
};

export default async function ReferralsPage() {
  const referrals = await getReferrals();

  return (
    <main className="min-h-screen">
      <div className="max-w-148 space-y-4 pt-1.5 pl-1.5">
        <h1 className="bg-white font-bold text-black dark:bg-black dark:text-white">
          referrals
        </h1>
        <p className="bg-white text-black dark:bg-black dark:text-white">
          all my referral links, thank you if you use them!
        </p>
        <ul className="space-y-4">
          {referrals.map((referral, index) => (
            <li key={`${referral.url}-${index}`}>
              <Link href={referral.url} rel="sponsored noopener noreferrer">
                {referral.name}
              </Link>
              <p className="bg-white text-black dark:bg-black dark:text-white">
                {referral.benefit}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
