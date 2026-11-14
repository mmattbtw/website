/** Build-time data for /support and /support/referrals. */
import * as v from "@atcute/lexicons/validations";
import { GITHUB_TOKEN } from "astro:env/server";

import fallback from "../data/referrals.json";
import { DID } from "../site";
import { getRecord } from "./atproto";
import { referralSchema, referralsSchema, type Referral } from "./records";

export interface Supporter {
  name: string;
  url: string;
}

/** GitHub sponsors, if a GITHUB_TOKEN is available at build time. */
export async function getSponsors(): Promise<Supporter[]> {
  if (!GITHUB_TOKEN) return [];

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "mmatt.net",
      },
      body: JSON.stringify({
        query: `{
          user(login: "mmattbtw") {
            sponsors(first: 100) {
              nodes {
                ... on User { login name url }
                ... on Organization { login name url }
              }
            }
          }
        }`,
      }),
    });

    if (!response.ok) return [];

    const result: {
      data?: {
        user?: { sponsors?: { nodes: { login: string; name: string | null; url: string }[] } };
      };
    } = await response.json();

    return (result.data?.user?.sponsors?.nodes ?? []).map((sponsor) => ({
      name: sponsor.name || sponsor.login,
      url: sponsor.url,
    }));
  } catch (error) {
    console.warn("Could not load GitHub sponsors:", error);

    return [];
  }
}

/**
 * Referral links. The PDS record (net.mmatt.support.referrals/self) wins when
 * it exists; otherwise the copy in src/data/referrals.json is used.
 */
export async function getReferrals(): Promise<Referral[]> {
  try {
    const record = await getRecord(`at://${DID}/net.mmatt.support.referrals/self`, referralsSchema);

    if (record) return record.value.links;
  } catch (error) {
    console.warn("Could not load referrals from the PDS:", error);
  }

  return v.is(v.array(referralSchema), fallback.links) ? fallback.links : [];
}
